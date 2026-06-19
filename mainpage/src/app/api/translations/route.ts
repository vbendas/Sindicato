import { NextResponse } from "next/server";
import { inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/auth/rate-limit";
import { error, getClientIp } from "@/lib/utils/api";
import { locales } from "@/lib/i18n/config";
import { db } from "@/lib/db";
import { cases, companies, caseTimelineEvents } from "@/lib/db/schema";
import {
  getOrCreateTranslations,
  type TranslationEntityType,
} from "@/lib/i18n/translation-cache";

const VALID_ENTITY_TYPES: TranslationEntityType[] = [
  "case",
  "case_timeline_event",
  "company_summary",
  "company_pattern",
];

const MAX_ITEMS = 50;
const MAX_TEXT_LENGTH = 5000;

type RejectReason =
  | "missing_fields"
  | "invalid_type"
  | "invalid_locale"
  | "text_too_long"
  | "empty_text"
  | "entity_not_found";

interface IncomingItem {
  entityType?: string;
  entityId?: string;
  field?: string;
  locale?: string;
  text?: string;
  sourceLang?: string | null;
}

interface RejectedItem {
  index: number;
  reason: RejectReason;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return error("Authentication required", 401);
  }

  const ip = getClientIp(request);
  // 100 req/min/IP — batch endpoint, more permissive than per-translate.
  const rl = await rateLimit(`translations:${ip}`, 100, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const items: IncomingItem[] = Array.isArray(body?.items) ? body.items : [];

    if (items.length === 0) {
      return NextResponse.json({
        ok: true,
        data: { translations: {}, skipped: [], failed: [], rejected: [] },
      });
    }

    if (items.length > MAX_ITEMS) {
      return NextResponse.json(
        { ok: false, error: `Too many items (max ${MAX_ITEMS})` },
        { status: 400 }
      );
    }

    // Validate and normalize, tracking rejected items with original indices.
    const validated: (Parameters<typeof getOrCreateTranslations>[0][number] & { _origIndex: number })[] = [];
    const rejected: RejectedItem[] = [];

    for (let i = 0; i < items.length; i++) {
      const raw = items[i];
      if (
        !raw ||
        typeof raw.entityType !== "string" ||
        typeof raw.entityId !== "string" ||
        typeof raw.field !== "string" ||
        typeof raw.locale !== "string" ||
        typeof raw.text !== "string"
      ) {
        rejected.push({ index: i, reason: "missing_fields" });
        continue;
      }
      if (!VALID_ENTITY_TYPES.includes(raw.entityType as TranslationEntityType)) {
        rejected.push({ index: i, reason: "invalid_type" });
        continue;
      }
      if (!locales.includes(raw.locale as (typeof locales)[number])) {
        rejected.push({ index: i, reason: "invalid_locale" });
        continue;
      }
      if (raw.text.length > MAX_TEXT_LENGTH) {
        rejected.push({ index: i, reason: "text_too_long" });
        continue;
      }
      if (!raw.text.trim()) {
        rejected.push({ index: i, reason: "empty_text" });
        continue;
      }
      validated.push({
        entityType: raw.entityType as TranslationEntityType,
        entityId: raw.entityId,
        field: raw.field,
        locale: raw.locale,
        text: raw.text,
        sourceLang: raw.sourceLang ?? null,
        _origIndex: i,
      });
    }

    if (validated.length === 0) {
      return NextResponse.json({
        ok: true,
        data: { translations: {}, skipped: [], failed: [], rejected },
      });
    }

    // Entity existence validation — skip items whose entityId doesn't
    // exist. Prevents cache poisoning and wasted LLM calls.
    if (db) {
      const byType = new Map<string, string[]>();
      for (const v of validated) {
        const ids = byType.get(v.entityType) ?? [];
        ids.push(v.entityId);
        byType.set(v.entityType, ids);
      }

      const existentByType = new Map<string, Set<string>>();
      for (const [type, ids] of byType) {
        if (type === "company_pattern") continue; // pattern name is not a DB entity
        const uniqueIds = [...new Set(ids)];
        try {
          let rows: { id: string }[] | { slug: string }[] = [];
          if (type === "case") {
            rows = await db
              .select({ id: cases.id })
              .from(cases)
              .where(inArray(cases.id, uniqueIds));
          } else if (type === "case_timeline_event") {
            rows = await db
              .select({ id: caseTimelineEvents.id })
              .from(caseTimelineEvents)
              .where(inArray(caseTimelineEvents.id, uniqueIds));
          } else if (type === "company_summary") {
            rows = await db
              .select({ slug: companies.slug })
              .from(companies)
              .where(inArray(companies.slug, uniqueIds));
          }
          existentByType.set(type, new Set(rows.map((r) => "id" in r ? r.id : r.slug)));
        } catch {
          // DB error — skip existence check, let items through
          existentByType.set(type, new Set(uniqueIds));
        }
      }

      // Filter out non-existent entities.
      const filtered: typeof validated = [];
      for (const v of validated) {
        const existent = existentByType.get(v.entityType);
        if (existent && !existent.has(v.entityId)) {
          rejected.push({ index: v._origIndex, reason: "entity_not_found" });
        } else {
          filtered.push(v);
        }
      }
      validated.length = 0;
      validated.push(...filtered);
    }

    if (validated.length === 0) {
      return NextResponse.json({
        ok: true,
        data: { translations: {}, skipped: [], failed: [], rejected },
      });
    }

    // Strip internal _origIndex before passing to cache helper.
    const itemsForCache = validated.map((v) => ({
      entityType: v.entityType,
      entityId: v.entityId,
      field: v.field,
      locale: v.locale,
      text: v.text,
      sourceLang: v.sourceLang,
    }));
    const result = await getOrCreateTranslations(itemsForCache);

    return NextResponse.json({
      ok: true,
      data: { ...result, rejected },
    });
  } catch (err) {
    console.error("Translations API error:", err);
    return NextResponse.json(
      { ok: false, error: "Translation failed" },
      { status: 500 }
    );
  }
}
