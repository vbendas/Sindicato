"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../sections/Footer";
import { useT, useLocale } from "@/lib/i18n";
import DonateClient from "./DonateClient";

export default function DonatePage() {
  const t = useT();
  const { locale } = useLocale();
  const stripePublishableKey =
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? null;

  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none z-[60] grain-overlay"
        style={{ opacity: 0.45 }}
      />
      <Header />
      <main className="bg-sindicato-bordeaux min-h-screen">
        <section className="pt-24 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <Link
              href="/"
              className="text-sindicato-warm-white/40 hover:text-sindicato-warm-white text-xs uppercase tracking-wider transition-colors mb-6 inline-block font-[family-name:var(--font-barlow)] font-bold"
            >
              &larr; {t("donate.back")}
            </Link>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-sindicato-warm-white uppercase font-[family-name:var(--font-barlow)] tracking-tight mb-4">
              {t("donate.title")}
            </h1>
            <p className="text-sindicato-warm-white/60 text-sm sm:text-base leading-relaxed">
              {t("donate.subtitle")}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <p className="text-sindicato-warm-white/80 text-base sm:text-lg leading-relaxed">
              {t("donate.body1")}
            </p>
            <p className="text-sindicato-warm-white/80 text-base sm:text-lg leading-relaxed mt-6">
              {t("donate.body2")}
            </p>
          </motion.div>

          <DonateClient locale={locale} stripePublishableKey={stripePublishableKey} />

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-12 pt-8 border-t border-white/10"
          >
            <p className="text-sindicato-warm-white/30 text-xs leading-relaxed">
              {t("donate.transparency")}
            </p>
          </motion.div>
        </section>
        <Footer />
      </main>
    </>
  );
}
