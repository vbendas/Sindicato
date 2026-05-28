"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Header from "@/app/components/Header";
import Footer from "@/app/sections/Footer";
import { useT, useLocale } from "@/lib/i18n";

interface CaseCard {
  id: string;
  displayName: string;
  country: string;
  project: string | null;
  dateRange: string;
  amountOwed: string;
  currency: string;
  contactAlias: string | null;
  story: string;
  vertical: string;
  createdAt: string;
  resolutionStatus: string;
  company: {
    name: string;
    slug: string;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "\u20ac",
  USD: "$",
  GBP: "\u00a3",
  BRL: "R$",
  INR: "\u20b9",
};

export default function CasesPage() {
  const t = useT();
  const { locale } = useLocale();
  
  useEffect(() => {
    document.documentElement.classList.add("cases-page");
    return () => document.documentElement.classList.remove("cases-page");
  }, []);

  const [casesList, setCasesList] = useState<CaseCard[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [verticalFilter, setVerticalFilter] = useState<string>("");
  const fetchedRef = useRef(false);

  const fetchCases = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "24" });
      if (verticalFilter) params.set("vertical", verticalFilter);

      const res = await fetch(`/api/cases?${params}`);
      if (res.ok) {
        const json = await res.json();
        setCasesList(json.data.cases);
        setPagination(json.data.pagination);
      }
    } catch (err) {
      console.error("Failed to fetch cases:", err);
    } finally {
      setLoading(false);
    }
  }, [verticalFilter]);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchCases(1);
    }
  }, [fetchCases]);

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-[60] grain-overlay" style={{ opacity: 0.45 }} />
      <Header scrolledBg="bg-sindicato-charcoal/70 backdrop-blur-md border-white/10" clerkBg="bg-sindicato-bordeaux text-sindicato-warm-white" />

      <div className="relative pt-24 pb-16 bg-sindicato-charcoal min-h-screen">

        <div className="relative z-10 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="w-12 h-0.5 bg-white/20 mb-6 mx-auto" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-sindicato-cream uppercase font-[family-name:var(--font-barlow)] tracking-tight mb-2">
              {t("casesPage.title")}
            </h1>
            <p className="text-sindicato-cream/40 text-sm font-[family-name:var(--font-jetbrains)]">
              {t("casesPage.subtitle")}
            </p>
          </motion.div>

          <div className="flex justify-center gap-2 mb-10">
            {["", "remote", "gig"].map((v) => (
              <button
                key={v}
                onClick={() => { setVerticalFilter(v); fetchedRef.current = false; }}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors font-[family-name:var(--font-barlow)] ${
                  verticalFilter === v
                    ? "bg-white/20 backdrop-blur-sm border border-white/30 text-sindicato-cream"
                    : "bg-white/10 text-sindicato-cream/60 hover:bg-white/20"
                }`}
              >
                {v === "" ? t("casesPage.filterAll") : v === "remote" ? t("casesPage.filterRemote") : t("casesPage.filterGig")}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          ) : casesList.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-sindicato-cream/60 text-lg">
                {t("casesPage.empty")}
              </p>
              <Link
                href="/file"
                className="mt-6 bg-sindicato-charcoal border border-white/30 text-sindicato-cream px-8 py-3 font-bold uppercase tracking-wider hover:bg-sindicato-charcoal/80 transition-all font-[family-name:var(--font-barlow)] inline-block"
              >
                {t("casesPage.emptyCta")}
              </Link>
            </div>
          ) : (
            <>
              <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
                {casesList.map((c) => (
                    <div key={c.id} className="break-inside-avoid mb-5">
                    <Link href={`/cases/${c.id}`}>
                      <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-6 hover:border-white/25 transition-all flex flex-col">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <p className="text-sindicato-cream font-bold text-lg">
                              {c.displayName}
                            </p>
                            <p className="text-sindicato-cream/50 text-sm">
                              {c.country}
                            </p>
                          </div>
                          {Number(c.amountOwed) > 0 && (
                            <div className="text-right shrink-0">
                              <p className="text-sindicato-cream font-bold text-xl font-[family-name:var(--font-jetbrains)]">
                                {CURRENCY_SYMBOLS[c.currency] ?? c.currency}
                                {c.amountOwed}
                              </p>
                            </div>
                          )}
                        </div>

                        <Link
                          href={`/${c.vertical === "gig" ? "gig" : "workers"}/${c.company.slug}`}
                          className="text-sindicato-cream/60 text-sm font-semibold uppercase tracking-wider hover:text-sindicato-cream transition-colors mb-3 inline-block"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {c.company.name}
                        </Link>

                        {c.project && (
                          <p className="text-sindicato-cream/40 text-xs mb-3">
                            {c.project}
                          </p>
                        )}

                        <p className="text-sindicato-cream/60 text-sm flex-1 leading-relaxed">
                          {c.story}
                        </p>

                        <div className="mt-4 pt-3 border-t border-white/10 flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sindicato-cream/30 text-xs">
                              {new Date(c.createdAt).toLocaleDateString(locale, {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                            <p className="text-sindicato-cream/20 text-[10px] font-[family-name:var(--font-jetbrains)] mt-1">
                              CASE #{c.id.slice(-8).toUpperCase()}
                            </p>
                          </div>
                          <span className="shrink-0 inline-flex items-center gap-1.5 bg-white/10 border border-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider font-[family-name:var(--font-jetbrains)]">
                            <span className={`w-1.5 h-1.5 rounded-full ${c.resolutionStatus === "resolved" ? "bg-green-400" : "bg-red-400"}`} />
                            <span className={c.resolutionStatus === "resolved" ? "text-green-400" : "text-red-400"}>
                              {c.resolutionStatus === "resolved" ? t("casesPage.statusSolved") : t("casesPage.statusUnresolved")}
                            </span>
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-4 mt-12">
                  <button
                    onClick={() => fetchCases(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="bg-sindicato-charcoal text-sindicato-cream px-6 py-2 text-sm font-bold uppercase tracking-wider hover:bg-sindicato-charcoal/80 transition-all disabled:opacity-30 disabled:cursor-not-allowed font-[family-name:var(--font-barlow)]"
                  >
                    {t("common.previous")}
                  </button>
                  <span className="text-sindicato-cream/60 text-sm font-[family-name:var(--font-jetbrains)]">
                    {t("casesPage.pageOf", { page: pagination.page, total: pagination.totalPages })}
                  </span>
                  <button
                    onClick={() => fetchCases(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="bg-sindicato-charcoal text-sindicato-cream px-6 py-2 text-sm font-bold uppercase tracking-wider hover:bg-sindicato-charcoal/80 transition-all disabled:opacity-30 disabled:cursor-not-allowed font-[family-name:var(--font-barlow)]"
                  >
                    {t("common.next")}
                  </button>
                </div>
            </>
          )}
        </div>
      </div>

      <Footer bg="bg-sindicato-charcoal" />
    </>
  );
}
