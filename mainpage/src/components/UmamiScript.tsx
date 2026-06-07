"use client";
import Script from "next/script";
import { onUmamiLoaded } from "@/lib/umami";

const WEBSITE_ID = "8674bf5b-c6a5-4cc1-8394-fa5a49cdd053";
const SCRIPT_URL = process.env.NEXT_PUBLIC_UMAMI_URL || "https://cloud.umami.is/script.js";

export function UmamiScript() {
  return (
    <Script
      defer
      src={SCRIPT_URL}
      data-website-id={WEBSITE_ID}
      strategy="afterInteractive"
      onLoad={onUmamiLoaded}
    />
  );
}
