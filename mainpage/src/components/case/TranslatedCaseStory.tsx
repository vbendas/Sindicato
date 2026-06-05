"use client";

import { useTranslation, type ServerCacheKey } from "@/hooks/useTranslation";
import { localeMatches } from "@/lib/i18n/lang-match";

export type TFunction = (
  key: string,
  params?: Record<string, string | number>,
) => string;

interface TranslatedCaseStoryProps {
  /** Original case story (in the case's filing language, often English). */
  text: string;
  /**
   * Server-side cached translation. Holds the ENGLISH version of a
   * non-English case (DB column `story_translated`). For an English-filed
   * case this is `null` and the original text is used as the translation
   * source instead.
   */
  cachedTranslation: string | null;
  /**
   * ISO 639-3 source language code from `franc()` (e.g. "por", "eng").
   * Used to detect when the page locale already matches the case's
   * source language so we can skip translation entirely and show the
   * original text directly. Pass `null` if unknown.
   */
  sourceLanguage?: string | null;
  /** Current page locale (e.g. "en", "pt", "es"). */
  locale: string;
  /** Translator from the i18n provider. */
  t: TFunction;
  /** Optional className for the story <Element>. */
  className?: string;
  /** Element type for the story container. Defaults to <p>. */
  as?: "p" | "div" | "span";
  /**
   * Optional server-cache key. When provided, translations are persisted
   * server-side and reused across users. The `field` should be `"story"`.
   */
  cacheKey?: ServerCacheKey;
}

/**
 * Renders a case story with on-the-fly translation into the page locale.
 *
 * - On English pages, the original text is always shown.
 * - If a server-side cached translation exists (case was filed in another
 *   language and pre-translated to English), that English version is
 *   used as the source and translated on the fly to the page locale.
 * - If no cached translation exists (common English-filed case), the
 *   original text is translated on the fly to the page locale.
 * - If the case's source language matches the page locale, no
 *   translation is performed and the original is shown directly.
 *
 * Renders a "Translating..." spinner while in flight and a
 * "Machine translated" pill once a translation is applied.
 */
export function TranslatedCaseStory({
  text,
  cachedTranslation,
  sourceLanguage,
  locale,
  t,
  className,
  as: Element = "p",
  cacheKey,
}: TranslatedCaseStoryProps) {
  const isSourceLocale = localeMatches(locale, sourceLanguage);

  // The translation source is the cached English version when available,
  // otherwise the original text. Both end up being in English, so we
  // pass "en" as the source language to the hook.
  const textToTranslate = cachedTranslation ?? text;
  const needsTranslation =
    locale !== "en" && !isSourceLocale && Boolean(textToTranslate);

  const {
    displayText: translatedStory,
    translatedText,
    isTranslating,
  } = useTranslation(textToTranslate, "en", needsTranslation, cacheKey);

  const displayStory = locale === "en" || isSourceLocale
    ? text
    : translatedStory;

  const showSpinner =
    needsTranslation && isTranslating && !translatedText;

  const showPill =
    needsTranslation && !isTranslating && Boolean(translatedText) && translatedText !== textToTranslate;

  return (
    <span>
      {showSpinner && (
        <span className="flex items-center gap-1.5 mb-1">
          <span className="w-2.5 h-2.5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
          <span className="text-blue-400 text-[9px] uppercase tracking-wider font-[family-name:var(--font-jetbrains)]">
            {t("common.translating")}
          </span>
        </span>
      )}
      {showPill && (
        <span className="inline-flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-blue-400 font-[family-name:var(--font-jetbrains)] mb-1">
          {t("caseDetail.machineTranslated")}
        </span>
      )}
      <Element className={className}>{displayStory}</Element>
    </span>
  );
}
