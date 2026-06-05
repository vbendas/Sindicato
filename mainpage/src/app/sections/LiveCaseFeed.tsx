"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useT, useLocale } from "@/lib/i18n";
import { TranslatedCaseStory } from "@/components/case/TranslatedCaseStory";

interface CaseItem {
  id: string;
  displayName: string;
  country: string;
  amountOwed: string;
  currency: string;
  story: string;
  storyTranslated: string | null;
  translationLanguage: string | null;
  vertical: "remote" | "gig";
  resolutionStatus: string;
  createdAt: string;
  company: {
    name: string;
    slug: string;
  };
}

type TabValue = "all" | "remote" | "gig";

function formatTimeAgo(dateStr: string, t: (key: string, params?: Record<string, string | number>) => string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return t("liveFeed.timeJustNow");
  if (minutes < 60) return t("liveFeed.timeMinutesAgo", { n: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("liveFeed.timeHoursAgo", { n: hours });
  const days = Math.floor(hours / 24);
  if (days < 30) return t("liveFeed.timeDaysAgo", { n: days });
  return new Date(dateStr).toLocaleDateString();
}

interface CaseCardProps {
  item: CaseItem;
  locale: string;
  t: (key: string, params?: Record<string, string | number>) => string;
  verticalStyles: Record<string, { badge: string; label: string }>;
  onClick: () => void;
}

function CaseCard({ item, locale, t, verticalStyles, onClick }: CaseCardProps) {
  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter") onClick(); }}
      role="presentation"
      className="break-inside-avoid mb-5 bg-white/10 backdrop-blur-sm p-5 sm:p-6 border border-white/10 transition-all duration-300 hover:bg-white/15 hover:border-white/25 hover:-translate-y-1 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-4 mb-2">
        <span
          className={`text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider whitespace-nowrap ${
            verticalStyles[item.vertical].badge
          } font-[family-name:var(--font-barlow)]`}
        >
          {verticalStyles[item.vertical].label}
        </span>
        {Number(item.amountOwed) > 0 && (
          <span className="text-sindicato-warm-white font-bold text-base font-[family-name:var(--font-jetbrains)] tracking-tight">
            {item.currency === "EUR" ? "\u20AC" : item.currency === "USD" ? "$" : item.currency}{" "}
            {Number(item.amountOwed).toLocaleString()}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-2">
        <span className="text-sindicato-warm-white/80 text-sm font-medium">
          {item.displayName}
        </span>
        <span className="text-sindicato-warm-white/20 text-sm">&bull;</span>
        <Link
          href={`/${locale}/${item.vertical === "gig" ? "gig" : "workers"}/${item.company.slug}`}
          onClick={(e) => e.stopPropagation()}
          className="text-sindicato-warm-white/60 text-sm hover:text-sindicato-warm-white transition-colors"
        >
          {item.company.name}
        </Link>
      </div>

      <TranslatedCaseStory
        text={item.story}
        cachedTranslation={item.storyTranslated}
        sourceLanguage={item.translationLanguage}
        locale={locale}
        t={t}
        className="text-sindicato-warm-white/65 text-sm leading-relaxed block"
        cacheKey={{ entityType: "case", entityId: item.id, field: "story" }}
      />

      <div className="mt-2 flex items-center justify-between">
        <span className="text-sindicato-warm-white/40 text-xs font-[family-name:var(--font-jetbrains)]">
          {formatTimeAgo(item.createdAt, t)}
        </span>
        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider font-[family-name:var(--font-jetbrains)]">
          <span className={`w-1.5 h-1.5 rounded-full ${item.resolutionStatus === "resolved" ? "bg-green-400" : "bg-red-400"}`} />
          <span className={item.resolutionStatus === "resolved" ? "text-green-400" : "text-red-400"}>
            {item.resolutionStatus === "resolved" ? t("liveFeed.statusSolved") : t("liveFeed.statusUnresolved")}
          </span>
        </span>
      </div>
    </div>
  );
}

const MASONRY_MAX_HEIGHT = 1380;

export default function LiveCaseFeed() {
  const t = useT();
  const { locale } = useLocale();
  // Always prefix navigation paths with the current locale to prevent
  // RSC payload fetch failures and full page reloads (bfcache bugs).

  const tabs: { label: string; value: TabValue }[] = [
    { label: t("liveFeed.tabAll"), value: "all" },
    { label: t("liveFeed.tabRemote"), value: "remote" },
    { label: t("liveFeed.tabGig"), value: "gig" },
  ];

  const verticalStyles = {
    remote: { badge: "bg-sindicato-bordeaux text-sindicato-warm-white", label: t("liveFeed.badgeRemote") },
    gig: { badge: "bg-sindicato-bordeaux-light text-sindicato-warm-white", label: t("liveFeed.badgeGig") },
  };

  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const masonryRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const fetchCases = useCallback(async (tab: TabValue, signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(false);
      const params = new URLSearchParams({ limit: "12", sort: "newest" });
      if (tab !== "all") params.set("vertical", tab);
      const response = await fetch(`/api/cases?${params}`, { signal });
      if (response.ok) {
        const json = await response.json();
        setCases(json.ok ? json.data.cases : []);
      } else {
        setError(true);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetching on mount
    void fetchCases(activeTab, controller.signal);
    const interval = setInterval(() => fetchCases(activeTab), 30000);
    
    return () => {
      clearTimeout(timeoutId);
      controller.abort();
      clearInterval(interval);
    };
  }, [fetchCases, activeTab, pathname]);

  // Refetch on browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      void fetchCases(activeTab);
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [fetchCases, activeTab]);

  useEffect(() => {
    const el = masonryRef.current;
    if (!el) return;
    const check = () => setIsOverflowing(el.scrollHeight > MASONRY_MAX_HEIGHT);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [cases]);

  const handleTabChange = (tab: TabValue) => {
    setActiveTab(tab);
  };

  return (
    <section id="feed" className="bg-sindicato-charcoal pt-14 sm:pt-16 lg:pt-20 pb-4">
      <div className="px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-12 h-0.5 bg-white/20 mx-auto mb-4" />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-sindicato-warm-white uppercase font-[family-name:var(--font-barlow)] tracking-wide">
            {t("liveFeed.title")}
          </h2>
        </motion.div>

        <div className="flex justify-center gap-2 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors font-[family-name:var(--font-barlow)] ${
                activeTab === tab.value
                  ? "bg-white/20 backdrop-blur-sm border border-white/30 text-sindicato-warm-white"
                  : "bg-white/10 text-sindicato-warm-white/60 hover:bg-white/20"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading && cases.length === 0 && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-sindicato-warm-white rounded-full mx-auto mb-4" />
            <p className="text-sindicato-warm-white/40 text-sm">{t("liveFeed.loading")}</p>
          </div>
        )}

        {error && cases.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sindicato-warm-white/40 text-sm">{t("liveFeed.error")}</p>
          </div>
        )}

        {!loading && !error && cases.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sindicato-warm-white/40 text-lg mb-2">{t("liveFeed.emptyTitle")}</p>
            <p className="text-sindicato-warm-white/30 text-sm">{t("liveFeed.emptySubtitle")}</p>
          </div>
        )}

        {cases.length > 0 && (
          <div
            className="relative"
            style={isOverflowing ? {
              maxHeight: `${MASONRY_MAX_HEIGHT}px`,
              overflow: "hidden",
              maskImage: "linear-gradient(to bottom, black 65%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 65%, transparent 100%)",
            } : undefined}
          >
            <div ref={masonryRef} className="columns-1 md:columns-2 lg:columns-3 gap-6">
              {cases.map((item) => (
                <CaseCard
                  key={item.id}
                  item={item}
                  locale={locale}
                  t={t}
                  verticalStyles={verticalStyles}
                  onClick={() => router.push(`/${locale}/cases/${item.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {cases.length > 0 && (
          <div className="mt-[15px] text-center">
            <Link
              href={`/${locale}/cases`}
              className="inline-block bg-white/10 backdrop-blur-sm border border-white/30 px-6 py-3 text-sindicato-warm-white text-sm uppercase tracking-wider hover:bg-white/20 transition-all font-[family-name:var(--font-barlow)] font-bold"
            >
              {t("liveFeed.viewAll")} &rarr;
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
