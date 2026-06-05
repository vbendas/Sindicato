import { createHash } from "node:crypto";
import { and, eq, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { translations } from "@/lib/db/schema";
import { translateStory } from "@/lib/ai/translate";
import { normalizeSourceLang, localeMatches } from "@/lib/i18n/lang-match";

export type TranslationEntityType =
  | "case"
  | "case_timeline_event"
  | "company_summary"
  | "company_pattern";

export interface TranslationItem {
  entityType: TranslationEntityType;
  entityId: string;
  field: string;
  locale: string;
  text: string;
  sourceLang?: string | null;
}

export type TranslationMap = Record<string, string>;

function hashText(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

function keyOf(item: Pick<TranslationItem, "entityType" | "entityId" | "field" | "locale">): string {
  return `${item.entityType}:${item.entityId}:${item.field}:${item.locale}`;
}

// In-flight de-dup: when the same (entity, field, locale) is requested
// concurrently, share a single in-progress promise so we only call the
// LLM once. Cleared on settle (success or failure).
const inflight = new Map<string, Promise<string>>();

// Per-process LRU. Capped to keep memory bounded under load.
const MEMORY_CACHE_MAX = 5000;
const memoryCache = new Map<string, { hash: string; text: string }>();

function memoryGet(key: string, hash: string): string | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (entry.hash !== hash) {
    memoryCache.delete(key);
    return null;
  }
  // Refresh recency
  memoryCache.delete(key);
  memoryCache.set(key, entry);
  return entry.text;
}

function memorySet(key: string, hash: string, text: string): void {
  if (memoryCache.size >= MEMORY_CACHE_MAX) {
    // Drop the oldest entry (Map iteration is insertion order)
    const oldest = memoryCache.keys().next().value;
    if (oldest !== undefined) memoryCache.delete(oldest);
  }
  memoryCache.set(key, { hash, text });
}

function shouldSkipItem(item: TranslationItem): boolean {
  if (!item.text || !item.text.trim()) return true;
  if (item.locale === "en" && (!item.sourceLang || localeMatches("en", item.sourceLang))) return true;
  if (localeMatches(item.locale, item.sourceLang)) return true;
  return false;
}

async function translateOne(item: TranslationItem): Promise<string> {
  return translateStory(
    item.text,
    normalizeSourceLang(item.sourceLang) ?? "auto",
    item.locale,
  );
}

// Concurrency limiter for LLM calls — prevents overwhelming the API.
const MAX_CONCURRENT_LLM = 5;
let activeLlm = 0;
const llmQueue: Array<() => void> = [];

function acquireLlm(): Promise<void> {
  if (activeLlm < MAX_CONCURRENT_LLM) {
    activeLlm++;
    return Promise.resolve();
  }
  return new Promise((resolve) => llmQueue.push(resolve));
}

function releaseLlm(): void {
  const next = llmQueue.shift();
  if (next) {
    next();
  } else {
    activeLlm--;
  }
}

/**
 * Get a single translation, hitting memory + DB cache and falling through
 * to the LLM on miss. Stores the result in memory + DB. Concurrent
 * requests for the same key share a single in-flight LLM call.
 */
async function getOrCreateSingle(item: TranslationItem): Promise<string> {
  if (shouldSkipItem(item)) return item.text;

  const key = keyOf(item);
  const hash = hashText(item.text);

  // 1) Memory cache
  const fromMemory = memoryGet(key, hash);
  if (fromMemory !== null) return fromMemory;

  // 2) DB cache
  if (db) {
    try {
      const rows = await db
        .select({ translatedText: translations.translatedText, sourceHash: translations.sourceHash })
        .from(translations)
        .where(
          and(
            eq(translations.entityType, item.entityType),
            eq(translations.entityId, item.entityId),
            eq(translations.field, item.field),
            eq(translations.locale, item.locale),
          ),
        )
        .limit(1);
      const row = rows[0];
      if (row && row.sourceHash === hash) {
        memorySet(key, hash, row.translatedText);
        return row.translatedText;
      }
    } catch (err) {
      console.error("translation-cache: db read failed", err);
    }
  }

  // 3) De-dup concurrent LLM calls for the same key
  const existing = inflight.get(key);
  if (existing) return existing;

  const promise = (async () => {
    try {
      await acquireLlm();
      const translated = await translateOne(item);
      // Guard: if LLM returned unchanged text and target isn't English,
      // don't cache it — this is likely a failure, not a genuine
      // "translated to same text" scenario. Let it retry on next request.
      if (translated === item.text && item.locale !== "en") {
        return item.text;
      }
      memorySet(key, hash, translated);
      if (db) {
        try {
          await db
            .insert(translations)
            .values({
              entityType: item.entityType,
              entityId: item.entityId,
              field: item.field,
              locale: item.locale,
              translatedText: translated,
              sourceHash: hash,
            })
            .onConflictDoUpdate({
              target: [translations.entityType, translations.entityId, translations.field, translations.locale],
              set: {
                translatedText: translated,
                sourceHash: hash,
                updatedAt: new Date(),
              },
            });
        } catch (err) {
          console.error("translation-cache: db write failed", err);
        }
      }
      return translated;
    } finally {
      releaseLlm();
      inflight.delete(key);
    }
  })();

  inflight.set(key, promise);
  return promise;
}

export interface BatchResult {
  /** Map keyed by `${entityType}:${entityId}:${field}:${locale}`. */
  translations: TranslationMap;
  /** Items that were skipped (e.g. source == target locale). */
  skipped: string[];
  /** Items that failed; the original text is returned as the fallback. */
  failed: string[];
}

/**
 * Batch translation lookup. Translates multiple (entity, field, locale)
 * pairs in a single call, sharing a single pass through memory + DB +
 * LLM. Returns the original text for items that fail or are skipped.
 */
export async function getOrCreateTranslations(
  items: TranslationItem[],
): Promise<BatchResult> {
  const result: TranslationMap = {};
  const skipped: string[] = [];
  const failed: string[] = [];

  // Pre-filter: skip items that don't need translation
  const toTranslate: TranslationItem[] = [];
  for (const item of items) {
    if (shouldSkipItem(item)) {
      result[keyOf(item)] = item.text;
      skipped.push(keyOf(item));
    } else {
      toTranslate.push(item);
    }
  }

  // Memory + DB bulk read
  const memoryMisses: TranslationItem[] = [];
  const dbMisses: TranslationItem[] = [];

  // Precompute hashes once to avoid double-hashing in the DB match loop.
  const hashByKey = new Map<string, string>();
  for (const item of toTranslate) {
    const key = keyOf(item);
    hashByKey.set(key, hashText(item.text));
  }

  for (const item of toTranslate) {
    const key = keyOf(item);
    const hash = hashByKey.get(key)!;
    const fromMem = memoryGet(key, hash);
    if (fromMem !== null) {
      result[key] = fromMem;
    } else {
      memoryMisses.push(item);
    }
  }

  if (db && memoryMisses.length > 0) {
    try {
      // Use OR-of-ANDs for exact tuple matching instead of Cartesian product.
      const conditions = memoryMisses.map((i) =>
        and(
          eq(translations.entityType, i.entityType),
          eq(translations.entityId, i.entityId),
          eq(translations.field, i.field),
          eq(translations.locale, i.locale),
        ),
      );

      const rows = await db
        .select({
          entityType: translations.entityType,
          entityId: translations.entityId,
          field: translations.field,
          locale: translations.locale,
          translatedText: translations.translatedText,
          sourceHash: translations.sourceHash,
        })
        .from(translations)
        .where(or(...conditions));

      const rowByKey = new Map<string, { hash: string; text: string }>();
      for (const row of rows) {
        rowByKey.set(
          `${row.entityType}:${row.entityId}:${row.field}:${row.locale}`,
          { hash: row.sourceHash, text: row.translatedText },
        );
      }

      for (const item of memoryMisses) {
        const key = keyOf(item);
        const hash = hashByKey.get(key)!;
        const row = rowByKey.get(key);
        if (row && row.hash === hash) {
          result[key] = row.text;
          memorySet(key, hash, row.text);
        } else {
          dbMisses.push(item);
        }
      }
    } catch (err) {
      console.error("translation-cache: batch db read failed", err);
      // Fall through — all memory misses become LLM calls
      dbMisses.push(...memoryMisses);
    }
  } else {
    dbMisses.push(...memoryMisses);
  }

  // LLM translate the remaining misses, de-duped by key
  const llmPromises = new Map<string, Promise<string>>();
  for (const item of dbMisses) {
    const key = keyOf(item);
    let p = llmPromises.get(key);
    if (!p) {
      p = getOrCreateSingle(item).catch((err) => {
        console.error("translation-cache: llm failed for", key, err);
        failed.push(key);
        return item.text;
      });
      llmPromises.set(key, p);
    }
  }

  await Promise.all(llmPromises.values());

  for (const [key, p] of llmPromises) {
    const text = await p;
    result[key] = text;
  }

  return { translations: result, skipped, failed };
}
