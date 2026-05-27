"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useT } from "@/lib/i18n";

export default function CTAs() {
  const t = useT();
  return (
    <section className="bg-sindicato-bordeaux-dark border-t border-b border-white/10 lg:section-diagonal-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-28">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="border border-white/20 p-6 sm:p-8 transition-all duration-200 hover:border-white/30 flex flex-col h-full"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-sindicato-warm-white uppercase tracking-wider mb-3 font-[family-name:var(--font-barlow)]">
              {t("ctas.workersTitle")}
            </h3>
            <p className="text-sindicato-warm-white/65 text-sm sm:text-base leading-relaxed mb-6 flex-1">
              {t("ctas.workersBody")}
            </p>
            <Link
              href="/file"
              className="bg-sindicato-charcoal text-sindicato-warm-white px-6 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-sindicato-charcoal/80 transition-all font-[family-name:var(--font-barlow)] mt-auto inline-block text-center"
            >
              {t("ctas.workersCta")}
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="border border-white/20 p-6 sm:p-8 transition-all duration-200 hover:border-white/30 flex flex-col h-full"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-sindicato-warm-white uppercase tracking-wider mb-3 font-[family-name:var(--font-barlow)]">
              {t("ctas.legalTitle")}
            </h3>
            <p className="text-sindicato-warm-white/65 text-sm sm:text-base leading-relaxed mb-6 flex-1">
              {t("ctas.legalBody")}
            </p>
            <Link
              href="/register?role=lawyer"
              className="bg-sindicato-charcoal text-sindicato-warm-white px-6 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-sindicato-charcoal/80 transition-all font-[family-name:var(--font-barlow)] mt-auto inline-block text-center"
            >
              {t("ctas.legalCta")}
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="border border-white/20 p-6 sm:p-8 transition-all duration-200 hover:border-white/30 flex flex-col h-full"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-sindicato-warm-white uppercase tracking-wider mb-3 font-[family-name:var(--font-barlow)]">
              {t("ctas.companiesTitle")}
            </h3>
            <p className="text-sindicato-warm-white/65 text-sm sm:text-base leading-relaxed mb-6 flex-1">
              {t("ctas.companiesBody")}
            </p>
            <Link
              href="/register?role=company"
              className="bg-sindicato-charcoal text-sindicato-warm-white px-6 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-sindicato-charcoal/80 transition-all font-[family-name:var(--font-barlow)] mt-auto inline-block text-center"
            >
              {t("ctas.companiesCta")}
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="border border-white/20 p-6 sm:p-8 transition-all duration-200 hover:border-white/30 flex flex-col h-full"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-sindicato-warm-white uppercase tracking-wider mb-3 font-[family-name:var(--font-barlow)]">
              {t("ctas.mediaTitle")}
            </h3>
            <p className="text-sindicato-warm-white/65 text-sm sm:text-base leading-relaxed mb-6 flex-1">
              {t("ctas.mediaBody")}
            </p>
            <Link
              href="/register?role=media"
              className="bg-sindicato-charcoal text-sindicato-warm-white px-6 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-sindicato-charcoal/80 transition-all font-[family-name:var(--font-barlow)] mt-auto inline-block text-center"
            >
              {t("ctas.mediaCta")}
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
