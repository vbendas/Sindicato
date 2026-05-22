"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface CaseItem {
  id: string;
  displayName: string;
  country: string;
  amountOwed: string;
  currency: string;
  story: string;
  vertical: "remote" | "gig";
  resolutionStatus: string;
  createdAt: string;
  company: {
    name: string;
    slug: string;
  };
}

type TabValue = "all" | "remote" | "gig";

const tabs: { label: string; value: TabValue }[] = [
  { label: "All Networks", value: "all" },
  { label: "Remote", value: "remote" },
  { label: "Gig", value: "gig" },
];

const verticalStyles = {
  remote: { badge: "bg-sindicato-bordeaux text-sindicato-cream", label: "REMOTE" },
  gig: { badge: "bg-sindicato-bordeaux-light text-sindicato-cream", label: "GIG" },
};

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const MASONRY_MAX_HEIGHT = 1380;

export default function LiveCaseFeed() {
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const fetchedRef = useRef(false);
  const masonryRef = useRef<HTMLDivElement>(null);

  const fetchCases = useCallback(async (tab: TabValue) => {
    try {
      setLoading(true);
      setError(false);
      const params = new URLSearchParams({ limit: "12", sort: "newest" });
      if (tab !== "all") params.set("vertical", tab);
      const response = await fetch(`/api/cases?${params}`);
      if (response.ok) {
        const json = await response.json();
        setCases(json.ok ? json.data.cases : []);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchCases(activeTab);
    }
    const interval = setInterval(() => fetchCases(activeTab), 30000);
    return () => clearInterval(interval);
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
    fetchedRef.current = true;
    fetchCases(tab);
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
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-sindicato-cream uppercase font-[family-name:var(--font-barlow)] tracking-wide">
            Recent Cases
          </h2>
        </motion.div>

        <div className="flex justify-center gap-2 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors font-[family-name:var(--font-barlow)] ${
                activeTab === tab.value
                  ? "bg-white/20 backdrop-blur-sm border border-white/30 text-sindicato-cream"
                  : "bg-white/10 text-sindicato-cream/60 hover:bg-white/20"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading && cases.length === 0 && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full mx-auto mb-4" />
            <p className="text-sindicato-cream/40 text-sm">Loading cases...</p>
          </div>
        )}

        {error && cases.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sindicato-cream/40 text-sm">Unable to load recent cases. Please try again later.</p>
          </div>
        )}

        {!loading && !error && cases.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sindicato-cream/40 text-lg mb-2">No cases reported yet</p>
            <p className="text-sindicato-cream/30 text-sm">Be the first to report your experience</p>
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
              {cases.map((item, index) => (
                <Link key={item.id} href={`/cases/${item.id}`}>
                  <div
                    className="break-inside-avoid mb-5 bg-white/10 backdrop-blur-sm p-5 sm:p-6 border border-white/10 transition-all duration-300 hover:bg-white/15 hover:border-white/25 hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider ${
                          verticalStyles[item.vertical].badge
                        } font-[family-name:var(--font-barlow)]`}
                      >
                        {verticalStyles[item.vertical].label}
                      </span>
                      {Number(item.amountOwed) > 0 && (
                        <span className="text-sindicato-cream font-bold text-base font-[family-name:var(--font-jetbrains)] tracking-tight">
                          {item.currency === "EUR" ? "\u20AC" : item.currency === "USD" ? "$" : item.currency}{" "}
                          {Number(item.amountOwed).toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-sindicato-cream/80 text-sm font-medium">
                        {item.displayName}
                      </span>
                      <span className="text-sindicato-cream/20 text-sm">&bull;</span>
                      <Link
                        href={`/${item.vertical === "gig" ? "gig" : "workers"}/${item.company.slug}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sindicato-cream/60 text-sm hover:text-sindicato-cream transition-colors"
                      >
                        {item.company.name}
                      </Link>
                    </div>

                    <p className="text-sindicato-cream/65 text-sm leading-relaxed">
                      {item.story}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sindicato-cream/40 text-xs font-[family-name:var(--font-jetbrains)]">
                        {formatTimeAgo(item.createdAt)}
                      </span>
                      <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider font-[family-name:var(--font-jetbrains)]">
                        <span className={`w-1.5 h-1.5 rounded-full ${item.resolutionStatus === "resolved" ? "bg-green-400" : "bg-red-400"}`} />
                        <span className={item.resolutionStatus === "resolved" ? "text-green-400" : "text-red-400"}>
                          {item.resolutionStatus === "resolved" ? "solved" : "unresolved"}
                        </span>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {cases.length > 0 && (
          <div className="mt-[15px] text-center">
            <Link
              href="/cases"
              className="inline-block bg-white/10 backdrop-blur-sm border border-white/30 px-6 py-3 text-sindicato-cream text-sm uppercase tracking-wider hover:bg-white/20 transition-all font-[family-name:var(--font-barlow)] font-bold"
            >
              View All Cases &rarr;
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
