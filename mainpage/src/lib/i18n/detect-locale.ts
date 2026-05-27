import { locales, defaultLocale, type Locale } from './config';

export function detectLocale(acceptLanguage: string | null, cookie?: string): Locale {
  if (cookie && locales.includes(cookie as Locale)) {
    return cookie as Locale;
  }

  if (!acceptLanguage) {
    return defaultLocale;
  }

  const languages = acceptLanguage
    .split(',')
    .map((part) => {
      const [lang, q] = part.trim().split(';q=');
      return { lang: lang.toLowerCase(), quality: q ? parseFloat(q) : 1 };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { lang } of languages) {
    const base = lang.split('-')[0];
    if (locales.includes(base as Locale)) {
      return base as Locale;
    }
  }

  return defaultLocale;
}
