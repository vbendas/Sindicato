"use client";

import { createContext, useContext, useCallback, useMemo, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { locales, defaultLocale, localeNames, localeFlags, type Locale, isValidLocale } from "./config";

type Dictionary = Record<string, unknown>;

interface LocaleContextValue {
  locale: Locale;
  dictionary: Dictionary;
  fallbackDictionary: Dictionary;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  dictionary,
  fallbackDictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  fallbackDictionary: Dictionary;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const setLocale = useCallback(
    (newLocale: Locale) => {
      document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;samesite=lax${typeof window !== "undefined" && window.location.protocol === "https:" ? ";secure" : ""}`;

      const segments = pathname.split("/");
      const hasLocalePrefix = locales.some(
        (l) => segments[1] === l
      );

      let newPath: string;
      if (hasLocalePrefix) {
        segments[1] = newLocale;
        newPath = segments.join("/") || "/";
      } else {
        newPath = `/${newLocale}${pathname === "/" ? "" : pathname}`;
      }

      if (newPath !== pathname) {
        router.push(newPath);
      } else {
        router.refresh();
      }
    },
    [pathname, router]
  );

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const resolve = (dict: Dictionary): string | null => {
        const segments = key.split(".");
        let value: unknown = dict;
        for (const k of segments) {
          if (value && typeof value === "object" && k in (value as Record<string, unknown>)) {
            value = (value as Record<string, unknown>)[k];
          } else {
            return null;
          }
        }
        return typeof value === "string" ? value : null;
      };

      const value = resolve(dictionary) ?? resolve(fallbackDictionary);
      if (value === null) return key;

      if (!params) return value;

      return value.replace(/\{(\w+)\}/g, (_, paramKey: string) => {
        return params[paramKey] !== undefined ? String(params[paramKey]) : `{${paramKey}}`;
      });
    },
    [dictionary, fallbackDictionary]
  );

  const contextValue = useMemo(
    () => ({ locale, dictionary, fallbackDictionary, setLocale, t }),
    [locale, dictionary, fallbackDictionary, setLocale, t]
  );

  return (
    <LocaleContext.Provider value={contextValue}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within a LocaleProvider");
  return ctx;
}

export function useT() {
  const { t } = useLocale();
  return t;
}

export { locales, defaultLocale, localeNames, localeFlags, isValidLocale };
export type { Locale };
