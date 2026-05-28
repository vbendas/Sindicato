export const locales = ['en', 'es', 'pt', 'fr', 'it', 'de', 'hi', 'fil', 'vi', 'sw', 'ne', 'am', 'ar'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  pt: 'Português',
  fr: 'Français',
  it: 'Italiano',
  de: 'Deutsch',
  hi: 'हिन्दी',
  fil: 'Filipino',
  vi: 'Tiếng Việt',
  sw: 'Kiswahili',
  ne: 'नेपाली',
  am: 'አማርኛ',
  ar: 'العربية',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  es: '🇪🇸',
  pt: '🇵🇹',
  fr: '🇫🇷',
  it: '🇮🇹',
  de: '🇩🇪',
  hi: '🇮🇳',
  fil: '🇵🇭',
  vi: '🇻🇳',
  sw: '🇰🇪',
  ne: '🇳🇵',
  am: '🇪🇹',
  ar: '🇸🇦',
};

export const rtlLocales: readonly Locale[] = ['ar'];

export function isRTLLocale(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
