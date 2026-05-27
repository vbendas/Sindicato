"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useT } from "@/lib/i18n";

interface CaseData {
  id: string;
  amountOwed: string;
  currency: string;
  dateRange: string;
  createdAt: string;
  company: { name: string; slug: string };
  resolutionStatus: string;
}

export default function FeaturedCase() {
  const t = useT();
  const [caseData, setCaseData] = useState<CaseData | null>(null);

  useEffect(() => {
    async function fetchCase() {
      try {
        const res = await fetch("/api/cases?company=alignerr&limit=1");
        if (res.ok) {
          const json = await res.json();
          if (json.ok && json.data.cases.length > 0) {
            setCaseData(json.data.cases[0]);
          }
        }
      } catch {
        // fallback to hardcoded
      }
    }
    fetchCase();
  }, []);

  const display = caseData ?? {
    amountOwed: "2432",
    currency: "USD",
    dateRange: "Apr 9 – May 18, 2026",
    company: { name: "Alignerr", slug: "alignerr" },
    resolutionStatus: "none",
  };

  return (
    <section className="bg-sindicato-charcoal py-16 sm:py-20 lg:py-24 lg:section-diagonal-bottom">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8 text-center sm:text-left">
          <span className="text-sindicato-warm-white/30 text-xs font-bold tracking-[0.25em] uppercase font-[family-name:var(--font-jetbrains)]">
            {t("featuredCase.label")}
          </span>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="border border-white/15 p-8 sm:p-10 lg:p-12 transition-all duration-300 hover:border-white/30"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-sindicato-warm-white uppercase tracking-wide font-[family-name:var(--font-barlow)]">
                {display.company.name}
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider font-[family-name:var(--font-jetbrains)] shrink-0">
              <span className={`w-1.5 h-1.5 rounded-full ${display.resolutionStatus === "resolved" ? "bg-green-400" : "bg-red-400"}`} />
              <span className={display.resolutionStatus === "resolved" ? "text-green-400" : "text-red-400"}>
                {display.resolutionStatus === "resolved" ? t("featuredCase.statusSolved") : t("featuredCase.statusUnresolved")}
              </span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mb-8">
            {Number(display.amountOwed) > 0 && (
              <div>
                <span className="block text-sindicato-warm-white/40 text-xs uppercase tracking-wider mb-1 font-[family-name:var(--font-jetbrains)]">
                  {t("featuredCase.amountLabel")}
                </span>
                <span className="text-sindicato-warm-white text-2xl sm:text-3xl font-bold font-[family-name:var(--font-jetbrains)]">
                  {display.currency === "USD" ? "$" : "\u20AC"}{Number(display.amountOwed).toLocaleString()}
                </span>
              </div>
            )}
            <div>
              <span className="block text-sindicato-warm-white/40 text-xs uppercase tracking-wider mb-1 font-[family-name:var(--font-jetbrains)]">
                {t("featuredCase.periodLabel")}
              </span>
              <span className="text-sindicato-warm-white text-base sm:text-lg font-[family-name:var(--font-jetbrains)]">
                {display.dateRange}
              </span>
            </div>
            <div>
              <span className="block text-sindicato-warm-white/40 text-xs uppercase tracking-wider mb-1 font-[family-name:var(--font-jetbrains)]">
                {t("featuredCase.casesFiledLabel")}
              </span>
              <span className="text-sindicato-warm-white text-2xl sm:text-3xl font-bold font-[family-name:var(--font-jetbrains)]">
                3
              </span>
            </div>
            <div>
              <span className="block text-sindicato-warm-white/40 text-xs uppercase tracking-wider mb-1 font-[family-name:var(--font-jetbrains)]">
                {t("featuredCase.workersLegalLabel")}
              </span>
              <span className="text-sindicato-warm-white text-2xl sm:text-3xl font-bold font-[family-name:var(--font-jetbrains)]">
                2
              </span>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <p className="text-sindicato-warm-white/65 text-sm sm:text-base leading-relaxed mb-6 max-w-3xl">
              {t("featuredCase.description")}
            </p>

            <Link
              href={`/workers/${display.company.slug}`}
              className="inline-flex items-center gap-2 text-sindicato-warm-white font-bold uppercase tracking-wider text-sm hover:text-sindicato-warm-white/80 transition-colors font-[family-name:var(--font-barlow)] group"
            >
              {t("featuredCase.viewReport")}
              <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
