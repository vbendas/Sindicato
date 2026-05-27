"use client";

import { forwardRef } from "react";
import Link, { type LinkProps } from "next/link";
import { useLocale } from "./locale-provider";
import { locales } from "./config";

type LocalizedLinkProps = LinkProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>;

export const LocalizedLink = forwardRef<HTMLAnchorElement, LocalizedLinkProps>(
  ({ href, ...props }, ref) => {
    const { locale } = useLocale();

    if (typeof href === "string" && href.startsWith("/") && !href.startsWith("/api")) {
      const segments = href.split("/");
      const hasLocalePrefix = locales.some((l) => segments[1] === l);

      if (!hasLocalePrefix) {
        href = `/${locale}${href === "/" ? "" : href}`;
      } else if (segments[1] !== locale) {
        segments[1] = locale;
        href = segments.join("/") || "/";
      }
    }

    return <Link ref={ref} href={href} {...props} />;
  }
);

LocalizedLink.displayName = "LocalizedLink";
