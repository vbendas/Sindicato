"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useT, useLocale } from "@/lib/i18n";

export default function PathToResolution() {
  const t = useT();
  const { locale } = useLocale();

  return (
    <section className="bg-sindicato-bordeaux-dark py-20 sm:py-24 lg:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-12 h-0.5 bg-white/20 mb-6" />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-sindicato-warm-white uppercase font-[family-name:var(--font-barlow)] tracking-wide mb-4">
            {t("pathToResolution.title")}
          </h2>
          <p className="text-sindicato-warm-white/40 text-sm sm:text-base mb-10 font-[family-name:var(--font-jetbrains)] tracking-wider uppercase">
            {t("pathToResolution.subtitle")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="space-y-6 mb-10"
        >
          <p className="text-sindicato-warm-white/65 text-sm sm:text-base leading-relaxed">
            {t("pathToResolution.body1")}
          </p>
          <p className="text-sindicato-warm-white/65 text-sm sm:text-base leading-relaxed">
            {t("pathToResolution.body2")}
          </p>
          <p className="text-sindicato-warm-white/65 text-sm sm:text-base leading-relaxed">
            {t("pathToResolution.body3")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="border-t border-white/15 pt-8"
        >
          <p className="text-sindicato-warm-white/80 text-base sm:text-lg font-bold mb-8 max-w-3xl">
            {t("pathToResolution.closing")}
          </p>

          <Link
            href={`/${locale}/register?role=company`}
            className="inline-block bg-sindicato-charcoal text-sindicato-warm-white px-8 sm:px-10 py-3.5 text-sm font-bold uppercase tracking-wider hover:bg-sindicato-charcoal/80 transition-all font-[family-name:var(--font-barlow)] shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            {t("pathToResolution.cta")} &rarr;
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
