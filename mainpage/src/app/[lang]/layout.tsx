import type { Metadata } from "next";
import { Barlow_Condensed, Inter, JetBrains_Mono, Geist, Noto_Sans_Arabic, Noto_Sans_Devanagari, Noto_Sans_Ethiopic } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import { ClerkWidgetProvider, ClerkBubble, ClerkPanel } from "@/components/clerk-widget";
import LanguageSuggestionBanner from "@/components/LanguageSuggestionBanner";
import { UmamiScript } from "@/components/UmamiScript";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import { LocaleProvider } from "@/lib/i18n/locale-provider";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { locales, defaultLocale, isRTLLocale, type Locale } from "@/lib/i18n/config";
import { headers } from "next/headers";
import "../globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-barlow",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
});

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-arabic",
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-devanagari",
});

const notoSansEthiopic = Noto_Sans_Ethiopic({
  subsets: ["ethiopic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-ethiopic",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = (locales.includes(lang as Locale) ? lang : "en") as Locale;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  
  const alternates: Record<string, string> = {};
  for (const l of locales) {
    const path = l === defaultLocale ? "" : `/${l}`;
    alternates[l] = `${baseUrl}${path}`;
  }
  alternates["x-default"] = baseUrl;

  return {
    title: "Sindicato — Make Exploitation Expensive",
    description:
      "Workers document unpaid wages, retaliation, lockouts, and unfair practices. Companies are notified. Patterns become visible. Resolution becomes possible.",
    alternates: {
      canonical: `${baseUrl}${locale === defaultLocale ? "" : `/${locale}`}`,
      languages: alternates,
    },
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  const locale = (locales.includes(lang as Locale) ? lang : "en") as Locale;
  const dictionary = await getDictionary(locale);
  const fallbackDictionary =
    locale === "en" ? dictionary : await getDictionary("en");
  const isRTL = isRTLLocale(locale);

  const needsArabicFont = locale === "ar";
  const needsDevanagariFont = locale === "hi" || locale === "ne";
  const needsEthiopicFont = locale === "am";

  const headerStore = await headers();
  const acceptLanguage = headerStore.get("accept-language") || "";
  let suggestedLocale = "";
  if (acceptLanguage) {
    const preferred = acceptLanguage.split(",").map((lang) => lang.split(";")[0].trim().split("-")[0].toLowerCase());
    const match = preferred.find((l) => locales.includes(l as Locale));
    if (match && match !== locale) {
      suggestedLocale = match;
    }
  }

  return (
    <html
      lang={locale}
      dir={isRTL ? "rtl" : "ltr"}
      data-suggested-locale={suggestedLocale}
      className={cn(
        "antialiased",
        barlowCondensed.variable,
        inter.variable,
        jetbrainsMono.variable,
        "font-sans",
        geist.variable,
        needsArabicFont && notoSansArabic.variable,
        needsDevanagariFont && notoSansDevanagari.variable,
        needsEthiopicFont && notoSansEthiopic.variable
      )}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#e94560" />
      </head>
      <body className="font-[family-name:var(--font-inter)]">
        <ServiceWorkerRegistration />
        <UmamiScript />
        <LocaleProvider
          locale={locale}
          dictionary={dictionary}
          fallbackDictionary={fallbackDictionary}
        >
          <AuthProvider>
            <ClerkWidgetProvider>
              <LanguageSuggestionBanner />
              {children}
              <ClerkBubble />
              <ClerkPanel />
            </ClerkWidgetProvider>
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
