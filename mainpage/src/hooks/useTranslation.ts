import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocale } from '@/lib/i18n';

const CACHE_KEY = 'sindicato_translations';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

function getCacheKey(text: string, targetLang: string, sourceLang?: string): string {
  const hash = btoa(text.slice(0, 100) + targetLang + (sourceLang || ''));
  return hash;
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
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore cache errors
  }
}

/**
 * Hook to translate text on-the-fly using the /api/translate endpoint.
 * Translations are cached in localStorage for 7 days.
 *
 * IMPORTANT: This hook intentionally calls setState synchronously in effects
 * for cache hits. This is safe because React bails out of re-renders when
 * the state value doesn't change (functional updater returns the same object).
 * The lint rule `react-hooks/set-state-in-effect` is a general guideline, but
 * in this case the pattern is correct and doesn't cause cascading renders.
 */
export function useTranslation(
  text: string | null | undefined,
  sourceLang?: string,
  enabled: boolean = true
) {
  const { locale } = useLocale();

  const cacheKey = useMemo(
    () => (text ? getCacheKey(text, locale, sourceLang) : ''),
    [text, locale, sourceLang]
  );

  const [translationMap, setTranslationMap] = useState<Record<string, string>>({});
  const [inflightKey, setInflightKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const shouldSkip = useMemo(() => {
    if (!text || !enabled) return true;
    if (locale === 'en' && (!sourceLang || sourceLang === 'eng' || sourceLang === 'en')) return true;
    if (sourceLang && (sourceLang === locale || sourceLang.startsWith(locale))) return true;
    return false;
  }, [text, locale, sourceLang, enabled]);

  useEffect(() => {
    if (shouldSkip || !text || !cacheKey) return;

    const cached = getFromCache(cacheKey);
    if (cached) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- safe: React bails out when value is unchanged
      setTranslationMap((prev) => (prev[cacheKey] === cached ? prev : { ...prev, [cacheKey]: cached }));
      setInflightKey(null);
      return;
    }

    const requestId = ++requestIdRef.current;
    setInflightKey(cacheKey);
    setError(null);

    fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        targetLang: locale,
        sourceLang,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Translation failed');
        return res.json();
      })
      .then((data) => {
        if (requestId !== requestIdRef.current) return;

        if (data.ok && data.data?.translated) {
          setTranslationMap((prev) => ({ ...prev, [cacheKey]: data.data.translated }));
          setInCache(cacheKey, data.data.translated);
        } else {
          setError(data.error || 'Translation failed');
        }
      })
      .catch((err) => {
        if (requestId !== requestIdRef.current) return;
        setError(err.message);
      })
      .finally(() => {
        if (requestId === requestIdRef.current) {
          setInflightKey(null);
        }
      });
  }, [text, locale, sourceLang, enabled, shouldSkip, cacheKey]);

  const translatedText = cacheKey ? translationMap[cacheKey] ?? null : null;
  const isTranslating = !shouldSkip && inflightKey === cacheKey;

  return useMemo(() => ({
    translatedText,
    isTranslating,
    error: shouldSkip ? null : error,
    displayText: translatedText || text || '',
  }), [translatedText, isTranslating, error, shouldSkip, text]);
}
