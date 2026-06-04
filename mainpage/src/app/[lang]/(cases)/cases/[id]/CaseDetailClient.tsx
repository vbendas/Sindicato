"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Header from "@/app/components/Header";
import Footer from "@/app/sections/Footer";
import TimelineSection from "./TimelineSection";
import ShareButtons from "@/components/ShareButtons";
import EntityReachStats from "@/components/EntityReachStats";
import { CaseTag } from "@/components/CaseTag";
import { TAG_TAXONOMY, TAG_CATEGORIES } from "@/lib/ai/tag-taxonomy";
import { useT, useLocale } from "@/lib/i18n";
import { LocalizedLink } from "@/lib/i18n/navigation";
import { localeNames } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/config";
import { useTranslation } from "@/hooks/useTranslation";
import type { CaseTagData } from "@/components/CaseTag";

const SEVERITY_DOT_COLORS: Record<string, string> = {
  green: "bg-emerald-400",
  yellow: "bg-amber-400",
  orange: "bg-orange-400",
  red: "bg-rose-400",
};

function AddTagDropdown({
  existingTags,
  onAdd,
}: {
  existingTags: CaseTagData[];
  onAdd: (tagName: string, category: string) => void;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const existingNames = new Set(existingTags.map((t) => t.tagName));

  const availableTags = TAG_CATEGORIES.flatMap((catSlug) => {
    const cat = TAG_TAXONOMY[catSlug];
    return cat.tags
      .filter((tag) => !existingNames.has(tag.name))
      .map((tag) => ({ ...tag, category: catSlug }));
  });

  if (availableTags.length === 0) return null;

  return (
    <div className="relative mt-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-[10px] text-sindicato-warm-white/40 hover:text-sindicato-warm-white/70 transition-colors uppercase tracking-wider border border-white/10 hover:border-white/20 px-2 py-1"
      >
        + {t("tags.addTag")}
      </button>
      {open && (
        <div className="absolute z-50 mt-1 left-0 bg-sindicato-charcoal border border-white/20 p-3 max-h-64 overflow-y-auto min-w-[280px]">
          <div className="space-y-3">
            {TAG_CATEGORIES.map((catSlug) => {
              const cat = TAG_TAXONOMY[catSlug];
              const available = cat.tags.filter(
                (tag) => !existingNames.has(tag.name)
              );
              if (available.length === 0) return null;
              return (
                <div key={catSlug}>
                  <p className="text-[9px] uppercase tracking-wider font-bold text-sindicato-warm-white/30 mb-1.5">
                    {t(cat.i18nKey)}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {available.map((tag) => (
                      <button
                        key={tag.name}
                        type="button"
                        onClick={() => {
                          onAdd(tag.name, catSlug);
                          setOpen(false);
                        }}
                        className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 border border-white/10 text-sindicato-warm-white/50 hover:text-sindicato-warm-white hover:border-white/30 hover:bg-white/5 transition-colors"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            SEVERITY_DOT_COLORS[tag.severity] ?? "bg-white/40"
                          }`}
                        />
                        {t(tag.i18nKey)}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

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
  const [showTranslated, setShowTranslated] = useState(true);
  const [caseTags, setCaseTags] = useState<CaseTagData[]>([]);
  const [generatingTags, setGeneratingTags] = useState(false);
  const [tagError, setTagError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const t = useT();
  const { locale } = useLocale();

  // Translate story on-the-fly
  const { 
    translatedText: storyTranslation, 
    isTranslating: isStoryTranslating,
  } = useTranslation(
    caseData?.story,
    caseData?.translationLanguage || undefined,
    showTranslated && locale !== 'en'
  );

  const displayStory = showTranslated
    ? (storyTranslation || caseData?.story || '')
    : (caseData?.story || '');

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

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((s) => setCurrentUserId(s?.user?.id ?? null))
      .catch(() => setCurrentUserId(null));
  }, []);

  useEffect(() => {
    if (!caseId) return;
    let cancelled = false;
    fetch(`/api/cases/${caseId}/tags`)
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) setCaseTags(json.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setCaseTags([]);
      });
    return () => { cancelled = true; };
  }, [caseId]);

  const isOwner = Boolean(
    currentUserId && caseData?.workerId && currentUserId === caseData.workerId
  );

  const handleGenerateTags = async () => {
    if (!caseId || generatingTags) return;
    setGeneratingTags(true);
    setTagError(null);
    try {
      const res = await fetch("/api/ai/generate-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId }),
      });
      const json = await res.json();
      if (res.ok && json.data?.success) {
        const tagsRes = await fetch(`/api/cases/${caseId}/tags`);
        const tagsJson = await tagsRes.json();
        setCaseTags(tagsJson.data ?? []);
        if (json.data.tagsGenerated === 0) {
          setTagError("No patterns detected in this case.");
        }
      } else {
        setTagError(json.error || json.data?.error || "Failed to generate tags");
      }
    } catch (err) {
      console.error("Failed to generate tags:", err);
      setTagError("Network error. Please try again.");
    } finally {
      setGeneratingTags(false);
    }
  };

  const handleTagOverride = async (tagId: string, override: "confirmed" | "rejected") => {
    if (!caseId) return;
    try {
      const res = await fetch(`/api/cases/${caseId}/tags/${tagId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerOverride: override }),
      });
      if (res.ok) {
        setCaseTags((prev) =>
          prev.map((tag) =>
            tag.id === tagId ? { ...tag, workerOverride: override } : tag
          )
        );
      }
    } catch (err) {
      console.error("Failed to update tag:", err);
    }
  };

  const handleTagDelete = async (tagId: string) => {
    if (!caseId) return;
    try {
      const res = await fetch(`/api/cases/${caseId}/tags/${tagId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCaseTags((prev) => prev.filter((tag) => tag.id !== tagId));
      }
    } catch (err) {
      console.error("Failed to delete tag:", err);
    }
  };

  const handleTagAdd = async (tagName: string, category: string) => {
    if (!caseId) return;
    try {
      const res = await fetch(`/api/cases/${caseId}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tagName,
          category,
          confidence: 100,
          sourceText: "Manually added by worker",
          source: "user",
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setCaseTags((prev) => [...prev, json.data]);
        }
      }
    } catch (err) {
      console.error("Failed to add tag:", err);
    }
  };

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
            {t("caseDetail.notFound")}
          </h1>
          <p className="text-sindicato-warm-white/60">
            {t("caseDetail.notFoundBody")}
          </p>
          <LocalizedLink
            href="/cases"
            className="bg-sindicato-charcoal border border-white/30 text-sindicato-warm-white px-8 py-3 font-bold uppercase tracking-wider hover:bg-sindicato-charcoal/80 transition-all font-[family-name:var(--font-barlow)]"
          >
            {t("caseDetail.backToCases")}
          </LocalizedLink>
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
                        {t("caseDetail.caseRecord")} #{caseData.id.slice(-8).toUpperCase()}
                      </span>
                      <EntityReachStats entityType="case" entityId={caseId} showVisitors={false} variant="compact" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider font-[family-name:var(--font-jetbrains)]">
                        <span className={`w-1.5 h-1.5 rounded-full ${caseData.resolutionStatus === "resolved" ? "bg-green-400" : "bg-red-400"}`} />
                        <span className={caseData.resolutionStatus === "resolved" ? "text-green-400" : "text-red-400"}>
                          {caseData.resolutionStatus === "resolved" ? t("caseDetail.resolved") : t("caseDetail.unresolved")}
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
                          {t("caseDetail.unpaid")}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mb-6">
                    <LocalizedLink
                      href={`/${caseData.vertical === "gig" ? "gig" : "workers"}/${caseData.company.slug}`}
                      className="text-sindicato-warm-white/60 hover:text-sindicato-warm-white text-sm font-semibold uppercase tracking-wider transition-colors"
                    >
                      {caseData.company.name} &rarr;
                    </LocalizedLink>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                    {caseData.project && (
                      <div className="bg-white/5 p-3">
                        <p className="text-sindicato-warm-white/40 text-xs uppercase tracking-wider mb-1">
                          {t("caseDetail.project")}
                        </p>
                        <p className="text-sindicato-warm-white text-sm">{caseData.project}</p>
                      </div>
                    )}
                    <div className="bg-white/5 p-3">
                      <p className="text-sindicato-warm-white/40 text-xs uppercase tracking-wider mb-1">
                        {t("caseDetail.dateRange")}
                      </p>
                      <p className="text-sindicato-warm-white text-sm">{caseData.dateRange}</p>
                    </div>
                    <div className="bg-white/5 p-3">
                      <p className="text-sindicato-warm-white/40 text-xs uppercase tracking-wider mb-1">
                        {t("caseDetail.contactAttempts")}
                      </p>
                      <p className="text-sindicato-warm-white text-sm">{caseData.contactAttempts}</p>
                    </div>
                  </div>

                  {/* AI Tags Section */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-sindicato-warm-white/30 text-[10px] uppercase tracking-widest font-[family-name:var(--font-jetbrains)]">
                        {t("tags.aiTags")}
                      </p>
                      {isOwner && (
                        <button
                          onClick={handleGenerateTags}
                          disabled={generatingTags}
                          className="text-[9px] text-sindicato-warm-white/30 hover:text-sindicato-warm-white/60 transition-colors uppercase tracking-wider"
                        >
                          {generatingTags ? t("tags.generatingTags") : "re-analyze"}
                        </button>
                      )}
                    </div>
                    {tagError && (
                      <p className="text-amber-400/70 text-[11px] mb-2">{tagError}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {caseTags.map((tag) => (
                        <CaseTag
                          key={tag.id}
                          tag={tag}
                          isOwner={isOwner}
                          onOverride={handleTagOverride}
                          onDelete={handleTagDelete}
                        />
                      ))}
                    </div>

                    {/* Add tag dropdown for owner */}
                    {isOwner && (
                      <AddTagDropdown
                        existingTags={caseTags}
                        onAdd={handleTagAdd}
                      />
                    )}
                  </div>

                  <div className="border-t border-white/10 pt-6">
                    <div className="mb-3">
                      <p className="text-sindicato-warm-white/40 text-xs uppercase tracking-wider">
                        {t("caseDetail.story")}
                      </p>
                    </div>
                    {showTranslated && isStoryTranslating && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                        <span className="text-blue-400 text-[10px] uppercase tracking-wider">
                          {t("common.translating")}
                        </span>
                      </div>
                    )}
                    {showTranslated && storyTranslation && !isStoryTranslating && (
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-400 font-[family-name:var(--font-jetbrains)]">
                            {t("caseDetail.machineTranslated")}
                          </span>
                          {caseData.translationLanguage && (
                            <span className="text-sindicato-warm-white/30 text-[10px]">
                              {t("caseDetail.translatedFrom", { language: localeNames[caseData.translationLanguage as Locale] || caseData.translationLanguage })}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => setShowTranslated(!showTranslated)}
                          className="text-sindicato-warm-white/50 hover:text-sindicato-warm-white text-xs uppercase tracking-wider transition-colors"
                        >
                          {t("caseDetail.showOriginal")}
                        </button>
                      </div>
                    )}
                    {!showTranslated && (caseData.storyTranslated || storyTranslation) && (
                      <div className="flex items-center justify-end mb-2">
                        <button
                          onClick={() => setShowTranslated(!showTranslated)}
                          className="text-sindicato-warm-white/50 hover:text-sindicato-warm-white text-xs uppercase tracking-wider transition-colors"
                        >
                          {t("caseDetail.showTranslation")}
                        </button>
                      </div>
                    )}
                    <div className="border-l-2 border-white/10 pl-4">
                      <p data-story-text className="text-sindicato-warm-white/80 leading-relaxed whitespace-pre-wrap">
                        {displayStory}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                    <p className="text-sindicato-warm-white/30 text-xs">
                      {t("caseDetail.reported")}{" "}
                      {new Date(caseData.createdAt).toLocaleDateString(locale, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sindicato-warm-white/20 text-[10px] font-[family-name:var(--font-jetbrains)]">
                      {t("caseDetail.case")} #{caseData.id.slice(-8).toUpperCase()}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10">
                    <p className="text-sindicato-warm-white/30 text-[10px] uppercase tracking-widest mb-3 font-[family-name:var(--font-jetbrains)]">
                      {t("caseDetail.shareThisCase")}
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
                  <TimelineSection caseId={caseId} workerId={caseData.workerId} companyName={caseData.company?.name} />
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
