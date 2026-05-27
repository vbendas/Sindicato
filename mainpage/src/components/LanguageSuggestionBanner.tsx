"use client";

import { useState, useEffect } from "react";
import { useLocale, locales, localeNames, localeFlags, type Locale } from "@/lib/i18n";

export default function LanguageSuggestionBanner() {
  const { locale, setLocale } = useLocale();
  const [suggestedLocale, setSuggestedLocale] = useState<Locale | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("locale-suggestion-dismissed");
    if (dismissed) return;

    const htmlElement = document.documentElement;
    const serverSuggested = htmlElement.getAttribute("data-suggested-locale");

    let detected: string | null = null;

    if (serverSuggested && locales.includes(serverSuggested as Locale)) {
      detected = serverSuggested;
    } else if (typeof navigator !== "undefined" && navigator.languages) {
      for (const lang of navigator.languages) {
        const base = lang.split("-")[0];
        if (locales.includes(base as Locale)) {
          detected = base;
          break;
        }
      }
    }

    if (detected && detected !== locale && locales.includes(detected as Locale)) {
      setSuggestedLocale(detected as Locale);
      setIsVisible(true);
    }
  }, [locale]);

  const handleAccept = () => {
    if (suggestedLocale) {
      setLocale(suggestedLocale);
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("locale-suggestion-dismissed", "true");
    setIsVisible(false);
  };

  if (!isVisible || !suggestedLocale) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-sindicato-bordeaux text-sindicato-warm-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-lg">{localeFlags[suggestedLocale]}</span>
          <span>
            This site is available in <strong>{localeNames[suggestedLocale]}</strong>. Switch?
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAccept}
            className="px-3 py-1.5 bg-sindicato-warm-white text-sindicato-bordeaux text-xs font-semibold uppercase tracking-wider hover:bg-white transition-colors"
          >
            Switch
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-1.5 bg-transparent border border-sindicato-warm-white/30 text-sindicato-warm-white text-xs font-semibold uppercase tracking-wider hover:bg-sindicato-warm-white/10 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
