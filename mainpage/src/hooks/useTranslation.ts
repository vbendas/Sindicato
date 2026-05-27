import { useState, useEffect } from 'react';
import { useLocale } from '@/lib/i18n';

interface TranslationCache {
  [key: string]: string;
}

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

export function useTranslation(
  text: string | null | undefined,
  sourceLang?: string,
  enabled: boolean = true
) {
  const { locale } = useLocale();
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!text || !enabled) {
      setTranslatedText(null);
      return;
    }

    // Don't translate if already in target language
    if (locale === 'en' && (!sourceLang || sourceLang === 'eng' || sourceLang === 'en')) {
      setTranslatedText(null);
      return;
    }

    // Don't translate if source matches target
    if (sourceLang && (sourceLang === locale || sourceLang.startsWith(locale))) {
      setTranslatedText(null);
      return;
    }

    const cacheKey = getCacheKey(text, locale, sourceLang);
    const cached = getFromCache(cacheKey);
    
    if (cached) {
      setTranslatedText(cached);
      return;
    }

    let cancelled = false;
    setIsTranslating(true);
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
        if (cancelled) return;
        
        if (data.ok && data.data?.translated) {
          setTranslatedText(data.data.translated);
          setInCache(cacheKey, data.data.translated);
        } else {
          setError(data.error || 'Translation failed');
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
      })
      .finally(() => {
        if (!cancelled) {
          setIsTranslating(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [text, locale, sourceLang, enabled]);

  return {
    translatedText,
    isTranslating,
    error,
    displayText: translatedText || text || '',
  };
}
