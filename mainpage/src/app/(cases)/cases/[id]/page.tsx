"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Header from "@/app/components/Header";

interface CaseDetail {
  id: string;
  displayName: string;
  country: string;
  ageRange: string | null;
  sex: string | null;
  project: string | null;
  dateRange: string;
  amountOwed: string;
  currency: string;
  contactAttempts: number;
  contactAlias: string | null;
  story: string;
  storyTranslated: string | null;
  translationLanguage: string | null;
  vertical: string;
  resolutionStatus: string;
  createdAt: string;
  company: {
    name: string;
    slug: string;
  };
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "\u20ac",
  USD: "$",
  GBP: "\u00a3",
  BRL: "R$",
  INR: "\u20b9",
};

export default function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [id, setId] = useState<string>("");
  const [showTranslated, setShowTranslated] = useState(false);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;

    const fetchCase = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/cases/${id}`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (res.ok) {
          const json = await res.json();
          setCaseData(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch case:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCase();
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-sindicato-red border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (notFound || !caseData) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex flex-col items-center justify-center gap-6">
          <h1 className="text-3xl font-bold text-sindicato-cream font-heading">
            Case Not Found
          </h1>
          <p className="text-sindicato-cream/60">
            This case may have been removed or does not exist.
          </p>
          <Link
            href="/cases"
            className="bg-sindicato-red text-sindicato-cream px-6 py-3 font-bold uppercase tracking-wider hover:bg-sindicato-red/90 transition-colors torn-edge font-button"
          >
            Back to Cases Wall
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="relative pt-24 pb-16">
        <div className="fixed inset-0 pointer-events-none z-50 grain-overlay" style={{ opacity: 0.04 }} />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6">
              <Link
                href="/cases"
                className="text-sindicato-cream/50 hover:text-sindicato-cream transition-colors text-sm uppercase tracking-wider"
              >
                &larr; Back to Cases Wall
              </Link>
            </div>

            <div className="bg-sindicato-cream/5 border border-sindicato-cream/10 p-6 sm:p-8 torn-edge mb-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-sindicato-cream font-bold text-2xl mb-1">
                    {caseData.displayName}
                  </p>
                  <p className="text-sindicato-cream/50 text-sm">
                    {caseData.country}
                    {caseData.ageRange && ` \u00b7 ${caseData.ageRange}`}
                    {caseData.sex && ` \u00b7 ${caseData.sex}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sindicato-red font-bold text-3xl">
                    {CURRENCY_SYMBOLS[caseData.currency] ?? caseData.currency}
                    {caseData.amountOwed}
                  </p>
                  <p className="text-sindicato-cream/40 text-xs uppercase tracking-wider">
                    Unpaid
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <Link
                  href={`/${caseData.vertical === "gig" ? "gig" : "workers"}/${caseData.company.slug}`}
                  className="text-sindicato-orange text-sm font-semibold uppercase tracking-wider hover:underline"
                >
                  {caseData.company.name}
                </Link>
                <span className="inline-flex items-center gap-1.5 bg-sindicato-cream/5 border border-sindicato-cream/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider font-[family-name:var(--font-jetbrains)]">
                  <span className={`w-1.5 h-1.5 rounded-full ${caseData.resolutionStatus === "resolved" ? "bg-green-400" : "bg-red-400"}`} />
                  <span className={caseData.resolutionStatus === "resolved" ? "text-green-400" : "text-red-400"}>
                    {caseData.resolutionStatus === "resolved" ? "solved" : "unresolved"}
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                {caseData.project && (
                  <div className="bg-sindicato-cream/5 p-3">
                    <p className="text-sindicato-cream/40 text-xs uppercase tracking-wider mb-1">
                      Project
                    </p>
                    <p className="text-sindicato-cream text-sm">{caseData.project}</p>
                  </div>
                )}
                <div className="bg-sindicato-cream/5 p-3">
                  <p className="text-sindicato-cream/40 text-xs uppercase tracking-wider mb-1">
                    Date Range
                  </p>
                  <p className="text-sindicato-cream text-sm">{caseData.dateRange}</p>
                </div>
                <div className="bg-sindicato-cream/5 p-3">
                  <p className="text-sindicato-cream/40 text-xs uppercase tracking-wider mb-1">
                    Contact Attempts
                  </p>
                  <p className="text-sindicato-cream text-sm">{caseData.contactAttempts}</p>
                </div>
              </div>

              <div className="border-t border-sindicato-cream/10 pt-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sindicato-cream/40 text-xs uppercase tracking-wider">
                    Story
                  </p>
                  {caseData.storyTranslated && (
                    <button
                      onClick={() => setShowTranslated(!showTranslated)}
                      className="text-sindicato-orange text-xs uppercase tracking-wider hover:underline"
                    >
                      {showTranslated ? "Show original" : "Show English translation"}
                    </button>
                  )}
                </div>
                <p className="text-sindicato-cream/80 leading-relaxed whitespace-pre-wrap">
                  {showTranslated && caseData.storyTranslated
                    ? caseData.storyTranslated
                    : caseData.story}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sindicato-cream/30 text-xs">
                Reported{" "}
                {new Date(caseData.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              {caseData.contactAlias && (
                <p className="text-sindicato-cream/30 text-xs">
                  Contact: {caseData.contactAlias}
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
