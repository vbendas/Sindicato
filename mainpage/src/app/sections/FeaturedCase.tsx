"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface CaseData {
  id: string;
  amountOwed: string;
  currency: string;
  dateRange: string;
  createdAt: string;
  company: { name: string; slug: string };
  status: string;
}

export default function FeaturedCase() {
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
    status: "active",
  };

  return (
    <section className="bg-sindicato-bordeaux py-12 sm:py-16 lg:py-20 lg:section-diagonal-bottom">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8 text-center sm:text-left">
          <span className="text-white/30 text-xs font-bold tracking-[0.25em] uppercase font-[family-name:var(--font-jetbrains)]">
            {`// FEATURED CASE #001`}
          </span>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="border border-white/25 p-8 sm:p-10 lg:p-12 transition-all duration-300 hover:border-white/35"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white uppercase tracking-wide font-[family-name:var(--font-barlow)]">
                {display.company.name}
              </h2>
            </div>
            <span className="inline-flex items-center gap-2 bg-white/10 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 font-[family-name:var(--font-jetbrains)] shrink-0">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              {display.status === "active" ? "ACTIVE" : display.status.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mb-8">
            <div>
              <span className="block text-white/35 text-xs uppercase tracking-wider mb-1 font-[family-name:var(--font-jetbrains)]">
                Amount
              </span>
              <span className="text-white text-2xl sm:text-3xl font-bold font-[family-name:var(--font-jetbrains)]">
                {display.currency === "USD" ? "$" : "\u20AC"}{Number(display.amountOwed).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="block text-white/35 text-xs uppercase tracking-wider mb-1 font-[family-name:var(--font-jetbrains)]">
                Period
              </span>
              <span className="text-white text-base sm:text-lg font-[family-name:var(--font-jetbrains)]">
                Apr 9 – May 18, 2026
              </span>
            </div>
            <div>
              <span className="block text-white/35 text-xs uppercase tracking-wider mb-1 font-[family-name:var(--font-jetbrains)]">
                Cases Filed
              </span>
              <span className="text-white text-2xl sm:text-3xl font-bold font-[family-name:var(--font-jetbrains)]">
                3
              </span>
            </div>
            <div>
              <span className="block text-white/35 text-xs uppercase tracking-wider mb-1 font-[family-name:var(--font-jetbrains)]">
                Workers for Legal Action
              </span>
              <span className="text-white text-2xl sm:text-3xl font-bold font-[family-name:var(--font-jetbrains)]">
                2
              </span>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <p className="text-white/65 text-sm sm:text-base leading-relaxed mb-6 max-w-3xl">
              A senior ML engineer documented wage theft through multiple AI training projects,
              complete with Hubstaff logs, AutoQA scores, and a documented retaliation sequence.
              This founding case established the pattern that Sindicato was built to expose.
            </p>

            <Link
              href={`/remote/${display.company.slug}`}
              className="inline-flex items-center gap-2 text-white font-bold uppercase tracking-wider text-sm hover:text-white/80 transition-colors font-[family-name:var(--font-barlow)] group"
            >
              View Full Report
              <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
