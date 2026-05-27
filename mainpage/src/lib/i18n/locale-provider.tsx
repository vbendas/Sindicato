"use client";

import { createContext, useContext, useCallback, useMemo, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { locales, defaultLocale, localeNames, localeFlags, type Locale, isValidLocale } from "./config";

type Dictionary = Record<string, unknown>;

interface LocaleContextValue {
  locale: Locale;
  dictionary: Dictionary;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const setLocale = useCallback(
    (newLocale: Locale) => {
      document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;samesite=lax`;

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
      const keys = key.split(".");
      let value: unknown = dictionary;
      for (const k of keys) {
        if (value && typeof value === "object" && k in (value as Record<string, unknown>)) {
          value = (value as Record<string, unknown>)[k];
        } else {
          return key;
        }
      }
      if (typeof value !== "string") return key;

      if (!params) return value;

      return value.replace(/\{(\w+)\}/g, (_, paramKey: string) => {
        return params[paramKey] !== undefined ? String(params[paramKey]) : `{${paramKey}}`;
      });
    },
    [dictionary]
  );

  const contextValue = useMemo(
    () => ({ locale, dictionary, setLocale, t }),
    [locale, dictionary, setLocale, t]
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
