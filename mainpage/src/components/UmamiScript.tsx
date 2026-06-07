"use client";
import Script from "next/script";
import { onUmamiLoaded } from "@/lib/umami";

export function UmamiScript() {
  const src = process.env.NEXT_PUBLIC_UMAMI_URL;
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  if (!src || !websiteId) return null;
  return (
    <Script
      defer
      src={src}
      data-website-id={websiteId}
      strategy="afterInteractive"
      onLoad={onUmamiLoaded}
    />
  );
}
