// ISO 639-3 to ISO 639-1 normalization, plus locale matching helpers.
// Shared between the client `useTranslation` hook and the server
// `translation-cache` helper.

export const ISO_639_3_TO_LOCALE: Record<string, string> = {
  eng: "en",
  por: "pt",
  spa: "es",
  fra: "fr",
  fre: "fr",
  deu: "de",
  ger: "de",
  ita: "it",
  hin: "hi",
  ara: "ar",
  amh: "am",
  fil: "fil",
  tgl: "fil",
  nep: "ne",
  swa: "sw",
  vie: "vi",
};

export function normalizeSourceLang(sourceLang?: string | null): string | null {
  if (!sourceLang) return null;
  const lower = sourceLang.toLowerCase();
  if (ISO_639_3_TO_LOCALE[lower]) return ISO_639_3_TO_LOCALE[lower];
  // Already 2-letter, or a locale variant like "pt-BR" — use the first segment.
  return lower.split("-")[0] || null;
}

export function localeMatches(locale: string, sourceLang?: string | null): boolean {
  const normalized = normalizeSourceLang(sourceLang);
  if (!normalized) return false;
  if (normalized === locale) return true;
  // Handle locale variants (e.g. "pt" matches a sourceLang of "pt-br")
  if (locale.startsWith(normalized + "-")) return true;
  if (normalized.startsWith(locale + "-")) return true;
  return false;
}
