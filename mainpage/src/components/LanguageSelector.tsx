"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale, locales, localeNames, localeFlags } from "@/lib/i18n";

export default function LanguageSelector() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sindicato-warm-white/50 hover:text-sindicato-warm-white text-[10px] uppercase tracking-wider transition-colors font-[family-name:var(--font-jetbrains)]"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span>{localeFlags[locale]}</span>
        <span>{localeNames[locale]}</span>
        <svg
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute bottom-full mb-2 right-0 bg-sindicato-charcoal border border-white/10 shadow-xl z-50 min-w-[140px]"
          role="listbox"
        >
          {locales.map((l) => (
            <button
              key={l}
              role="option"
              aria-selected={l === locale}
              onClick={() => {
                setLocale(l);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors text-left ${
                l === locale
                  ? "text-sindicato-warm-white bg-white/10"
                  : "text-sindicato-warm-white/60 hover:text-sindicato-warm-white hover:bg-white/5"
              }`}
            >
              <span>{localeFlags[l]}</span>
              <span>{localeNames[l]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
