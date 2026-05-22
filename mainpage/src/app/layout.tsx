import type { Metadata } from "next";
import { Barlow_Condensed, Inter, JetBrains_Mono, Geist } from "next/font/google";
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
        {children}
      </body>
    </html>
  );
}
