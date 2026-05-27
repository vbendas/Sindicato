import { MetadataRoute } from "next";
import { locales, defaultLocale } from "@/lib/i18n/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  
  const staticPages = [
    "",
    "/manifesto",
    "/cases",
    "/donate",
    "/about",
    "/file",
    "/register",
    "/transparency",
    "/clerk",
    "/workers",
    "/gig",
    "/gig-workers",
    "/remote-workers",
    "/tos/company",
    "/tos/lawyer",
    "/tos/media",
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const page of staticPages) {
    for (const locale of locales) {
      const path = locale === defaultLocale ? page : `/${locale}${page}`;
      entries.push({
        url: `${baseUrl}${path}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: page === "" ? 1.0 : page === "/cases" ? 0.9 : 0.7,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [
              l,
              `${baseUrl}${l === defaultLocale ? page : `/${l}${page}`}`,
            ])
          ),
        },
      });
    }
  }

  return entries;
}
