"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "../components/Header";
import Footer from "../sections/Footer";
import ShareButtons from "@/components/ShareButtons";
import { useTrackPageview } from "@/hooks/useTrackPageview";
import { useT, useLocale } from "@/lib/i18n";
import { useTranslation } from "@/hooks/useTranslation";

interface CaseItem {
  id: string;
  displayName: string;
  country: string;
  amountOwed: string;
  currency: string;
  story: string;
  vertical: string;
  createdAt: string;
  resolutionStatus: string;
  company: { name: string; slug: string };
}

interface CompanyPageProps {
  slug: string;
  vertical: "remote" | "gig";
}

export default function CompanyPage({ slug, vertical }: CompanyPageProps) {
  const t = useT();
  const { locale } = useLocale();
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewsTotal, setViewsTotal] = useState<number | null>(null);
  const [summary, setSummary] = useState<{
    summary: string;
    commonIssues: string[];
    resolutionRate: string;
    engagementPattern: string;
    keyInsight: string;
  } | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  // Translate summary text
  const { 
    translatedText: summaryTranslation, 
    isTranslating: isSummaryTranslating,
    displayText: displaySummary 
  } = useTranslation(
    summary?.summary,
    undefined,
    locale !== 'en'
  );

  const { 
    translatedText: keyInsightTranslation, 
    isTranslating: isKeyInsightTranslating,
    displayText: displayKeyInsight 
  } = useTranslation(
    summary?.keyInsight,
    undefined,
    locale !== 'en'
  );

  useTrackPageview("company", slug);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/cases?company=${slug}&limit=20`);
        if (res.ok) {
          const json = await res.json();
          if (json.ok) setCases(json.data.cases);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  useEffect(() => {
    async function fetchViews() {
      try {
        const res = await fetch(`/api/metrics?type=company&id=${slug}`);
        if (res.ok) {
          const json = await res.json();
          setViewsTotal(json.data?.viewsTotal ?? 0);
        }
      } catch {
        // silent
      }
    }
    fetchViews();
  }, [slug]);

  useEffect(() => {
    async function fetchSummary() {
      setSummaryLoading(true);
      try {
        const res = await fetch(`/api/ai/company-summary?company=${slug}`);
        if (res.ok) {
          const json = await res.json();
          if (json.ok && json.data) {
            setSummary(json.data);
          }
        }
      } catch {
        // Silent fail - don't show error, just hide summary
      } finally {
        setSummaryLoading(false);
      }
    }
    if (cases.length > 0) {
      fetchSummary();
    }
  }, [slug, cases.length]);

  const companyName = cases.length > 0 ? cases[0].company.name : slug;
  const totalOwed = cases.reduce(
    (sum, c) => sum + Number(c.amountOwed),
    0
  );
  // legalWorkers would need a separate API call

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-[60] grain-overlay" style={{ opacity: 0.45 }} />
      <Header scrolledBg="bg-sindicato-pine/70 backdrop-blur-md border-white/5" clerkBg="bg-sindicato-bordeaux text-sindicato-warm-white" />
      <main className="bg-sindicato-pine min-h-screen">
        <section className="pt-20 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-sindicato-warm-white uppercase font-[family-name:var(--font-barlow)] tracking-tight mb-4">
              {companyName}
            </h1>

            <div className="flex flex-wrap gap-6 mb-8">
              <div>
                <span className="block text-sindicato-warm-white/30 text-xs uppercase tracking-wider mb-1 font-[family-name:var(--font-jetbrains)]">
                  {t("companyPage.totalCases")}
                </span>
                <span className="text-sindicato-warm-white text-2xl font-bold font-[family-name:var(--font-barlow)]">
                  {cases.length}
                </span>
              </div>
              <div>
                <span className="block text-sindicato-warm-white/30 text-xs uppercase tracking-wider mb-1 font-[family-name:var(--font-jetbrains)]">
                  {t("companyPage.totalUnpaid")}
                </span>
                <span className="text-sindicato-warm-white text-2xl font-bold font-[family-name:var(--font-barlow)]">
                  ${totalOwed.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="block text-sindicato-warm-white/30 text-xs uppercase tracking-wider mb-1 font-[family-name:var(--font-jetbrains)]">
                  {t("companyPage.vertical")}
                </span>
                <span className="text-sindicato-warm-white text-2xl font-bold font-[family-name:var(--font-barlow)]">
                  {vertical === "remote" ? t("companyPage.verticalRemote") : t("companyPage.verticalGig")}
                </span>
              </div>
              <div>
                <span className="block text-sindicato-warm-white/30 text-xs uppercase tracking-wider mb-1 font-[family-name:var(--font-jetbrains)]">
                  {t("companyPage.totalViews")}
                </span>
                <span className="text-sindicato-warm-white text-2xl font-bold font-[family-name:var(--font-barlow)]">
                  {viewsTotal !== null ? viewsTotal.toLocaleString() : "—"}
                </span>
              </div>
            </div>

            {summaryLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 bg-white/5 border border-white/10 p-6 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-4 border-2 border-sindicato-warm-white/30 border-t-sindicato-warm-white rounded-full animate-spin" />
                  <span className="text-sindicato-warm-white/60 text-sm">
                    {t("companyPage.loadingSummary")}
                  </span>
                </div>
              </motion.div>
            )}

            {summary && !summaryLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-8 bg-gradient-to-br from-sindicato-bordeaux/20 to-sindicato-pine/20 border border-white/10 p-6 rounded-lg"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-sindicato-warm-white uppercase tracking-wider font-[family-name:var(--font-barlow)] mb-1">
                      {t("companyPage.aiSummary")}
                    </h3>
                    <span className="text-sindicato-warm-white/40 text-[10px] uppercase tracking-widest font-[family-name:var(--font-jetbrains)]">
                      {t("companyPage.aiGenerated")}
                    </span>
                  </div>
                </div>

                {isSummaryTranslating && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                    <span className="text-blue-400 text-[10px] uppercase tracking-wider">
                      {t("common.translating")}
                    </span>
                  </div>
                )}

                {summaryTranslation && !isSummaryTranslating && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-400 font-[family-name:var(--font-jetbrains)]">
                      {t("caseDetail.machineTranslated")}
                    </span>
                  </div>
                )}

                <p className="text-sindicato-warm-white/80 text-sm leading-relaxed mb-4">
                  {displaySummary}
                </p>

                {summary.keyInsight && (
                  <div className="mb-4 p-3 bg-white/5 border-l-2 border-sindicato-bordeaux rounded">
                    {isKeyInsightTranslating && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                        <span className="text-blue-400 text-[10px] uppercase tracking-wider">
                          {t("common.translating")}
                        </span>
                      </div>
                    )}
                    {keyInsightTranslation && !isKeyInsightTranslating && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-400 font-[family-name:var(--font-jetbrains)]">
                          {t("caseDetail.machineTranslated")}
                        </span>
                      </div>
                    )}
                    <p className="text-sindicato-warm-white/90 text-sm italic">
                      {displayKeyInsight}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  {summary.commonIssues.length > 0 && (
                    <div>
                      <span className="block text-sindicato-warm-white/40 text-[10px] uppercase tracking-wider mb-2 font-[family-name:var(--font-jetbrains)]">
                        {t("companyPage.commonIssues")}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {summary.commonIssues.slice(0, 3).map((issue) => (
                          <span
                            key={issue}
                            className="text-[10px] px-2 py-0.5 bg-sindicato-bordeaux/30 text-sindicato-warm-white rounded font-[family-name:var(--font-jetbrains)]"
                          >
                            {t(`caseTypes.${issue}`)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="block text-sindicato-warm-white/40 text-[10px] uppercase tracking-wider mb-2 font-[family-name:var(--font-jetbrains)]">
                      {t("companyPage.resolutionRate")}
                    </span>
                    <span className="text-sindicato-warm-white text-lg font-bold font-[family-name:var(--font-barlow)]">
                      {summary.resolutionRate}
                    </span>
                  </div>

                  <div>
                    <span className="block text-sindicato-warm-white/40 text-[10px] uppercase tracking-wider mb-2 font-[family-name:var(--font-jetbrains)]">
                      {t("companyPage.engagementPattern")}
                    </span>
                    <span
                      className={`inline-block text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider font-[family-name:var(--font-jetbrains)] ${
                        summary.engagementPattern === "engaged"
                          ? "bg-green-500/20 text-green-400"
                          : summary.engagementPattern === "retaliation"
                          ? "bg-red-500/20 text-red-400"
                          : summary.engagementPattern === "ignoring"
                          ? "bg-orange-500/20 text-orange-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {t(`companyPage.engagement${summary.engagementPattern.charAt(0).toUpperCase() + summary.engagementPattern.slice(1)}`)}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {cases.length > 0 && (
              <div className="mb-8">
                <p className="text-sindicato-warm-white/30 text-[10px] uppercase tracking-widest mb-3 font-[family-name:var(--font-jetbrains)]">
                  {t("companyPage.shareLabel")}
                </p>
                <ShareButtons
                  url={typeof window !== "undefined" ? window.location.origin + pathname : pathname}
                  title={`${cases.length} cases filed against ${companyName}`}
                  description={`$${totalOwed.toLocaleString()} in unpaid wages reported by workers.`}
                  variant="company"
                  companyName={companyName}
                  stats={{ cases: cases.length, totalOwed: totalOwed.toLocaleString() }}
                  entityType="company"
                  entityId={slug}
                  isAuth={!!session}
                />
              </div>
            )}

            <div className="border-t border-white/10 pt-6">
              <h2 className="text-lg font-bold text-sindicato-warm-white uppercase tracking-wider mb-4 font-[family-name:var(--font-barlow)]">
                {t("companyPage.filedCases")}
              </h2>

              {loading && (
                <p className="text-sindicato-warm-white/40 text-sm">{t("companyPage.loading")}</p>
              )}

              {!loading && cases.length === 0 && (
                <p className="text-sindicato-warm-white/40 text-sm">{t("companyPage.noCases")}</p>
              )}

              <div className="space-y-3">
                {cases.map((item) => (
                  <Link key={item.id} href={`/cases/${item.id}`}>
                    <div className="bg-white/5 border border-white/10 p-4 hover:bg-white/10 transition-colors">
                      <div className="flex items-start justify-between gap-4 mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sindicato-warm-white font-medium text-sm truncate">
                            {item.displayName}
                          </span>
                          <span className="inline-flex items-center gap-1 bg-white/10 border border-white/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider font-[family-name:var(--font-jetbrains)] shrink-0">
                            <span className={`w-1 h-1 rounded-full ${item.resolutionStatus === "resolved" ? "bg-green-400" : "bg-red-400"}`} />
                            <span className={item.resolutionStatus === "resolved" ? "text-green-400" : "text-red-400"}>
                              {item.resolutionStatus === "resolved" ? t("companyPage.statusSolved") : t("companyPage.statusUnresolved")}
                            </span>
                          </span>
                        </div>
                        <span className="text-sindicato-warm-white/40 text-xs font-[family-name:var(--font-jetbrains)] shrink-0">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sindicato-warm-white/60 text-sm line-clamp-2">
                        {item.story}
                      </p>
                      {Number(item.amountOwed) > 0 && (
                        <div className="mt-2">
                          <span className="text-sindicato-warm-white font-bold text-sm font-[family-name:var(--font-jetbrains)]">
                            {item.currency === "EUR" ? "\u20AC" : "$"}{Number(item.amountOwed).toLocaleString()}
                          </span>
                          <span className="text-sindicato-warm-white/30 text-xs ml-2">{t("companyPage.unpaid")}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </section>
        <Footer bg="bg-sindicato-pine" />
      </main>
    </>
  );
}
