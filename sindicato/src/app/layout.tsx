import type { Metadata } from "next";
import localFont from "next/font/local";
import { Finlandica, Open_Sans } from "next/font/google";
import "./globals.css";

const politik = localFont({
  src: [
    {
      path: "./fonts/politik/Politik-1Rg2.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/politik/PolitikBold-R1mA.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/politik/PolitikBoldItalic-BOJd.ttf",
      weight: "700",
      style: "italic",
    },
    {
      path: "./fonts/politik/PolitikItalic-829g.ttf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-politik",
});

const finlandica = Finlandica({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-finlandica",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-opensans",
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
      className={`${politik.variable} ${finlandica.variable} ${openSans.variable} h-full antialiased`}
    >
      <body className="h-full font-[family-name:var(--font-opensans)]">
        {children}
      </body>
    </html>
  );
}
