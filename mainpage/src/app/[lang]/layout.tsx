import type { Metadata } from "next";
import { Barlow_Condensed, Inter, JetBrains_Mono, Geist, Noto_Sans_Arabic, Noto_Sans_Devanagari, Noto_Sans_Ethiopic } from "next/font/google";
import Script from "next/script";
import { AuthProvider } from "@/components/AuthProvider";
import { ClerkWidgetProvider, ClerkBubble, ClerkPanel } from "@/components/clerk-widget";
import LanguageSuggestionBanner from "@/components/LanguageSuggestionBanner";
import { onUmamiLoaded } from "@/lib/umami";
import { LocaleProvider } from "@/lib/i18n/locale-provider";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { locales, defaultLocale, isRTLLocale, type Locale } from "@/lib/i18n/config";
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
      "Workers report wage theft, unpaid work, and contractor exploitation. Together, our voices become impossible to silence.",
    alternates: {
      canonical: `${baseUrl}${locale === defaultLocale ? "" : `/${locale}`}`,
      languages: alternates,
    },
  };
}

const umamiScript = process.env.NEXT_PUBLIC_UMAMI_URL && process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

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

  return (
    <html
      lang={locale}
      dir={isRTL ? "rtl" : "ltr"}
      data-suggested-locale=""
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
      <body className="font-[family-name:var(--font-inter)]">
        {umamiScript && (
          <Script
            defer
            src={process.env.NEXT_PUBLIC_UMAMI_URL}
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
            strategy="afterInteractive"
            onLoad={onUmamiLoaded}
          />
        )}
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
