import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocale } from '@/lib/i18n';
import { localeMatches } from '@/lib/i18n/lang-match';

const CACHE_KEY = 'sindicato_translations';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

export type ServerCacheEntityType =
  | 'case'
  | 'case_timeline_event'
  | 'company_summary'
  | 'company_pattern';

export interface ServerCacheKey {
  entityType: ServerCacheEntityType;
  entityId: string;
  field: string;
}

interface ServerTranslationRequest {
  entityType: ServerCacheEntityType;
  entityId: string;
  field: string;
  locale: string;
  text: string;
  sourceLang: string | null;
}

function localStorageKey(
  parts: { entityType: string; entityId: string; field: string; locale: string } | { hash: string },
): string {
  if ('hash' in parts) return `hash:${parts.hash}`;
  return `srv:${parts.entityType}:${parts.entityId}:${parts.field}:${parts.locale}`;
}

function getFromCache(key: string): string | null {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    const entry = cache[key];
    if (!entry) return null;

    if (Date.now() - entry.timestamp > CACHE_EXPIRY) {
      delete cache[key];
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      return null;
    }

    return entry.translation;
  } catch {
    return null;
  }
}

function setInCache(key: string, translation: string): void {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    cache[key] = {
      translation,
      timestamp: Date.now(),
    };
    // Cap at 500 entries to prevent unbounded localStorage growth.
    const keys = Object.keys(cache);
    if (keys.length > 500) {
      keys.sort((a, b) => (cache[a].timestamp ?? 0) - (cache[b].timestamp ?? 0));
      for (const k of keys.slice(0, keys.length - 500)) {
        delete cache[k];
      }
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore cache errors
  }
}

// Module-level batcher: many useTranslation calls on a single page
// (e.g. 12 case cards) coalesce into a single POST /api/translations.
type Resolver = (translation: string) => void;
let pendingBatch: ServerTranslationRequest[] = [];
let pendingResolvers = new Map<string, Resolver[]>();
let flushScheduled = false;

function serverKeyOf(req: ServerTranslationRequest): string {
  return `${req.entityType}:${req.entityId}:${req.field}:${req.locale}`;
}

function scheduleFlush(): void {
  if (flushScheduled) return;
  flushScheduled = true;
  // Coalesce all calls within the same microtask + a tiny macrotask window
  // so React's render-then-effect-then-effect order produces one batch.
  setTimeout(flushBatch, 0);
}

async function flushBatch(): Promise<void> {
  flushScheduled = false;
  if (pendingBatch.length === 0) return;

  const batch = pendingBatch;
  const resolvers = pendingResolvers;
  pendingBatch = [];
  pendingResolvers = new Map();

  try {
    const res = await fetch('/api/translations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: batch }),
    });
    if (!res.ok) throw new Error('Translation fetch failed');
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'Translation failed');
    const translations: Record<string, string> = data.data?.translations ?? {};
    for (const item of batch) {
      const key = serverKeyOf(item);
      const subs = resolvers.get(key) ?? [];
      const translation = translations[key] ?? item.text;
      // Populate localStorage so the next visit is instant.
      setInCache(
        localStorageKey({
          entityType: item.entityType,
          entityId: item.entityId,
          field: item.field,
          locale: item.locale,
        }),
        translation,
      );
      for (const cb of subs) cb(translation);
    }
  } catch {
    // Fallback: original text
    for (const item of batch) {
      const key = serverKeyOf(item);
      const subs = resolvers.get(key) ?? [];
      for (const cb of subs) cb(item.text);
    }
  }
}

function enqueueServerTranslation(req: ServerTranslationRequest): Promise<string> {
  return new Promise((resolve) => {
    const key = serverKeyOf(req);
    const existing = pendingResolvers.get(key);
    if (existing) {
      existing.push(resolve);
    } else {
      pendingResolvers.set(key, [resolve]);
    }
    pendingBatch.push(req);
    scheduleFlush();
  });
}

function hashKeyForLegacy(text: string, targetLang: string, sourceLang?: string | null): string {
  // FNV-1a hash — works on any Unicode string, no btoa dependency.
  let hash = 0x811c9dc5;
  const input = text.slice(0, 100) + targetLang + (sourceLang || "");
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (hash * 0x01000193) | 0;
  }
  return `h${(hash >>> 0).toString(36)}`;
}

function legacyLocalStorageKey(
  text: string,
  targetLang: string,
  sourceLang?: string | null,
): string {
  return hashKeyForLegacy(text, targetLang, sourceLang);
}

/**
 * Hook to translate text on-the-fly.
 *
 * When `cacheKey` is provided, translations are looked up on the server
 * via the `/api/translations` batch endpoint and persisted in the DB
 * (keyed by entity). LocalStorage is used as a fast first-level cache.
 * Many concurrent hook calls on the same page coalesce into a single
 * batch HTTP request.
 *
 * When `cacheKey` is omitted, the legacy per-call `/api/translate` path
 * is used (no server cache, localStorage only). This is kept for
 * ad-hoc text that isn't tied to a stable entity.
 *
 * IMPORTANT: This hook intentionally calls setState synchronously in
 * effects for cache hits and batch resolves. React bails out of
 * re-renders when the state value doesn't change, so this is safe.
 */
export function useTranslation(
  text: string | null | undefined,
  sourceLang?: string | null,
  enabled: boolean = true,
  cacheKey?: ServerCacheKey,
) {
  const { locale } = useLocale();

  // LocalStorage key: server-keyed (entity) or hash-keyed (legacy)
  const lsKey = useMemo(() => {
    if (!text) return '';
    if (cacheKey) {
      return localStorageKey({ ...cacheKey, locale });
    }
    return legacyLocalStorageKey(text, locale, sourceLang);
  }, [text, locale, sourceLang, cacheKey]);

  const [translationMap, setTranslationMap] = useState<Record<string, string>>({});
  const [inflightKey, setInflightKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const shouldSkip = useMemo(() => {
    if (!text || !enabled) return true;
    if (locale === 'en' && (!sourceLang || localeMatches('en', sourceLang))) return true;
    if (localeMatches(locale, sourceLang)) return true;
    return false;
  }, [text, locale, sourceLang, enabled]);

  useEffect(() => {
    if (shouldSkip || !text || !lsKey) return;

    const cached = getFromCache(lsKey);
    if (cached) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- safe: React bails out when value is unchanged
      setTranslationMap((prev) => (prev[lsKey] === cached ? prev : { ...prev, [lsKey]: cached }));
      setInflightKey(null);
      return;
    }

    const requestId = ++requestIdRef.current;
    setInflightKey(lsKey);
    setError(null);

    const resolve = (translation: string) => {
      if (requestId !== requestIdRef.current) return;
      setTranslationMap((prev) => ({ ...prev, [lsKey]: translation }));
      setInCache(lsKey, translation);
      setInflightKey(null);
    };

    const fail = (err: Error) => {
      if (requestId !== requestIdRef.current) return;
      setError(err.message);
      setInflightKey(null);
    };

    if (cacheKey) {
      // Server-cached path: batch through /api/translations
      enqueueServerTranslation({
        entityType: cacheKey.entityType,
        entityId: cacheKey.entityId,
        field: cacheKey.field,
        locale,
        text,
        sourceLang: sourceLang ?? null,
      })
        .then(resolve)
        .catch(fail);
    } else {
      // Legacy per-call path
      fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang: locale, sourceLang }),
      })
        .then((res) => {
          if (!res.ok) throw new Error('Translation failed');
          return res.json();
        })
        .then((data) => {
          if (data.ok && data.data?.translated) {
            resolve(data.data.translated);
          } else {
            fail(new Error(data.error || 'Translation failed'));
          }
        })
        .catch(fail);
    }
  }, [text, locale, sourceLang, enabled, shouldSkip, lsKey, cacheKey]);

  const translatedText = lsKey ? translationMap[lsKey] ?? null : null;
  const isTranslating = !shouldSkip && inflightKey === lsKey;

  return useMemo(
    () => ({
      translatedText,
      isTranslating,
      error: shouldSkip ? null : error,
      displayText: translatedText || text || '',
    }),
    [translatedText, isTranslating, error, shouldSkip, text],
  );
}
