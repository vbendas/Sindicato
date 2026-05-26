import type { Metadata } from "next";
import { Barlow_Condensed, Inter, JetBrains_Mono, Geist } from "next/font/google";
import Script from "next/script";
import { AuthProvider } from "@/components/AuthProvider";
import { ClerkWidgetProvider, ClerkBubble, ClerkPanel } from "@/components/clerk-widget";
import { onUmamiLoaded } from "@/lib/umami";
import "./globals.css";
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

export const metadata: Metadata = {
  title: "Sindicato — Make Exploitation Expensive",
  description:
    "Workers report wage theft, unpaid work, and contractor exploitation. Together, our voices become impossible to silence.",
};

const umamiScript = process.env.NEXT_PUBLIC_UMAMI_URL && process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("antialiased", barlowCondensed.variable, inter.variable, jetbrainsMono.variable, "font-sans", geist.variable)}
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
        <AuthProvider>
          <ClerkWidgetProvider>
            {children}
            <ClerkBubble />
            <ClerkPanel />
          </ClerkWidgetProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
