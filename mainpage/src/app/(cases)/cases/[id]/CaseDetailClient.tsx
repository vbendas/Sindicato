"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Header from "@/app/components/Header";
import Footer from "@/app/sections/Footer";
import TimelineSection from "./TimelineSection";
import ShareButtons from "@/components/ShareButtons";
import EntityReachStats from "@/components/EntityReachStats";

function ScrollableColumn({ children, className, innerClassName }: { children: React.ReactNode; className?: string; innerClassName?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showArrow, setShowArrow] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const hasScroll = el.scrollHeight > el.clientHeight;
    const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4;
    setShowArrow(hasScroll && !isAtBottom);
  }, []);

  const scrollDown = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ top: 200, behavior: "smooth" });
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    const observer = new ResizeObserver(checkScroll);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      observer.disconnect();
    };
  }, [checkScroll]);

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <div
        ref={scrollRef}
        className={`h-full overflow-y-auto [&::-webkit-scrollbar]:hidden ${innerClassName ?? ""}`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
      </div>
      <AnimatePresence>
        {showArrow && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-2 left-0 right-0 flex justify-center cursor-pointer"
            onClick={scrollDown}
          >
            <ChevronDown className="size-5 text-sindicato-warm-white/30 hover:text-sindicato-warm-white/60 transition-colors" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface CaseDetail {
  id: string;
  workerId: string | null;
  displayName: string;
  country: string;
  ageRange: string | null;
  sex: string | null;
  project: string | null;
  dateRange: string;
  amountOwed: string;
  currency: string;
  contactAttempts: number;
  daysWithoutAnswer: number | null;
  contactAlias: string | null;
  story: string;
  storyTranslated: string | null;
  translationLanguage: string | null;
  caseType: string;
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

export default function CaseDetailClient({
  caseId,
  shareUrl,
}: {
  caseId: string;
  shareUrl: string;
}) {
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showTranslated, setShowTranslated] = useState(false);

  useEffect(() => {
    if (!caseId) return;

    const fetchCase = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/cases/${caseId}`);
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
  }, [caseId]);

  if (loading) {
    return (
      <>
        <div className="fixed inset-0 pointer-events-none z-[60] grain-overlay" style={{ opacity: 0.45 }} />
        <Header scrolledBg="bg-sindicato-charcoal/70 backdrop-blur-md border-white/5" clerkBg="bg-sindicato-bordeaux text-sindicato-warm-white" />
        <div className="min-h-screen bg-sindicato-charcoal flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-sindicato-warm-white rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (notFound || !caseData) {
    return (
      <>
        <div className="fixed inset-0 pointer-events-none z-[60] grain-overlay" style={{ opacity: 0.45 }} />
        <Header scrolledBg="bg-sindicato-charcoal/70 backdrop-blur-md border-white/5" clerkBg="bg-sindicato-bordeaux text-sindicato-warm-white" />
        <div className="min-h-screen bg-sindicato-charcoal flex flex-col items-center justify-center gap-6">
          <h1 className="text-3xl font-bold text-sindicato-warm-white font-[family-name:var(--font-barlow)]">
            Case Not Found
          </h1>
          <p className="text-sindicato-warm-white/60">
            This case may have been removed or does not exist.
          </p>
          <Link
            href="/cases"
            className="bg-sindicato-charcoal border border-white/30 text-sindicato-warm-white px-8 py-3 font-bold uppercase tracking-wider hover:bg-sindicato-charcoal/80 transition-all font-[family-name:var(--font-barlow)]"
          >
            Back to Cases Wall
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-[60] grain-overlay" style={{ opacity: 0.45 }} />
      <Header scrolledBg="bg-sindicato-charcoal/70 backdrop-blur-md border-white/5" clerkBg="bg-sindicato-bordeaux text-sindicato-warm-white" />

      <div className="relative bg-sindicato-charcoal flex flex-col min-h-screen">

        <div className="flex-1 flex flex-col min-h-0 pt-24">
          <div className="relative z-10 px-4 sm:px-6 lg:px-8 flex-1 flex flex-col min-h-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col flex-1 min-h-0"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
                {/* Left Column: Case Data */}
                <ScrollableColumn className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 sm:p-8 pb-16 sm:pb-20">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <span className="text-sindicato-warm-white/30 text-[10px] font-bold uppercase tracking-widest font-[family-name:var(--font-jetbrains)]">
                        CASE RECORD #{caseData.id.slice(-8).toUpperCase()}
                      </span>
                      <EntityReachStats entityType="case" entityId={caseId} showVisitors={false} variant="compact" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider font-[family-name:var(--font-jetbrains)]">
                        <span className={`w-1.5 h-1.5 rounded-full ${caseData.resolutionStatus === "resolved" ? "bg-green-400" : "bg-red-400"}`} />
                        <span className={caseData.resolutionStatus === "resolved" ? "text-green-400" : "text-red-400"}>
                          {caseData.resolutionStatus === "resolved" ? "solved" : "unresolved"}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <p className="text-sindicato-warm-white font-bold text-2xl mb-1">
                        {caseData.displayName}
                      </p>
                      <p className="text-sindicato-warm-white/50 text-sm">
                        {caseData.country}
                        {caseData.ageRange && ` \u00b7 ${caseData.ageRange}`}
                        {caseData.sex && ` \u00b7 ${caseData.sex}`}
                      </p>
                    </div>
                    {Number(caseData.amountOwed) > 0 && (
                      <div className="text-right shrink-0">
                        <p className="text-sindicato-warm-white font-bold text-3xl">
                          {CURRENCY_SYMBOLS[caseData.currency] ?? caseData.currency}
                          {caseData.amountOwed}
                        </p>
                        <p className="text-sindicato-warm-white/40 text-xs uppercase tracking-wider">
                          Unpaid
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mb-6">
                    <Link
                      href={`/${caseData.vertical === "gig" ? "gig" : "workers"}/${caseData.company.slug}`}
                      className="text-sindicato-warm-white/60 hover:text-sindicato-warm-white text-sm font-semibold uppercase tracking-wider transition-colors"
                    >
                      {caseData.company.name} &rarr;
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                    {caseData.project && (
                      <div className="bg-white/5 p-3">
                        <p className="text-sindicato-warm-white/40 text-xs uppercase tracking-wider mb-1">
                          Project
                        </p>
                        <p className="text-sindicato-warm-white text-sm">{caseData.project}</p>
                      </div>
                    )}
                    <div className="bg-white/5 p-3">
                      <p className="text-sindicato-warm-white/40 text-xs uppercase tracking-wider mb-1">
                        Date Range
                      </p>
                      <p className="text-sindicato-warm-white text-sm">{caseData.dateRange}</p>
                    </div>
                    <div className="bg-white/5 p-3">
                      <p className="text-sindicato-warm-white/40 text-xs uppercase tracking-wider mb-1">
                        Contact Attempts
                      </p>
                      <p className="text-sindicato-warm-white text-sm">{caseData.contactAttempts}</p>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sindicato-warm-white/40 text-xs uppercase tracking-wider">
                        Story
                      </p>
                      {caseData.storyTranslated && (
                        <button
                          onClick={() => setShowTranslated(!showTranslated)}
                          className="text-sindicato-warm-white/50 hover:text-sindicato-warm-white text-xs uppercase tracking-wider transition-colors"
                        >
                          {showTranslated ? "Show original" : "Show English translation"}
                        </button>
                      )}
                    </div>
                    <div className="border-l-2 border-white/10 pl-4">
                      <p className="text-sindicato-warm-white/80 leading-relaxed whitespace-pre-wrap">
                        {showTranslated && caseData.storyTranslated
                          ? caseData.storyTranslated
                          : caseData.story}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                    <p className="text-sindicato-warm-white/30 text-xs">
                      Reported{" "}
                      {new Date(caseData.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sindicato-warm-white/20 text-[10px] font-[family-name:var(--font-jetbrains)]">
                      CASE #{caseData.id.slice(-8).toUpperCase()}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10">
                    <p className="text-sindicato-warm-white/30 text-[10px] uppercase tracking-widest mb-3 font-[family-name:var(--font-jetbrains)]">
                      Share this case
                    </p>
                    <ShareButtons
                      url={shareUrl}
                      title={`Worker from ${caseData.country} is owed ${CURRENCY_SYMBOLS[caseData.currency] ?? ""}${caseData.amountOwed} by ${caseData.company.name}`}
                      description={caseData.story}
                      variant="case"
                      companyName={caseData.company.name}
                      stats={{
                        amount: `${CURRENCY_SYMBOLS[caseData.currency] ?? ""}${caseData.amountOwed}`,
                        country: caseData.country,
                      }}
                      caseType={caseData.caseType}
                      displayName={caseData.displayName}
                      dateRange={caseData.dateRange}
                      vertical={caseData.vertical}
                      resolutionStatus={caseData.resolutionStatus}
                    />
                  </div>
                </ScrollableColumn>

                {/* Right Column: Timeline */}
                <ScrollableColumn className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 sm:p-8 pb-16 sm:pb-20" innerClassName="pl-8">
                  <TimelineSection caseId={caseId} workerId={caseData.workerId} />
                </ScrollableColumn>
              </div>
            </motion.div>
          </div>
        </div>

        <Footer bg="bg-sindicato-charcoal" />
      </div>
    </>
  );
}
