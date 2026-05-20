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
  remote: { badge: "bg-sindicato-bordeaux text-white", label: "REMOTE" },
  gig: { badge: "bg-sindicato-bordeaux-light text-white", label: "GIG" },
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

export default function LiveCaseFeed() {
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const fetchedRef = useRef(false);

  const fetchCases = useCallback(async (tab: TabValue) => {
    try {
      setLoading(true);
      setError(false);
      const params = new URLSearchParams({ limit: "5", sort: "newest" });
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

  const handleTabChange = (tab: TabValue) => {
    setActiveTab(tab);
    fetchedRef.current = true;
    fetchCases(tab);
  };

  return (
    <section id="feed" className="bg-sindicato-bordeaux py-20 sm:py-24 lg:py-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-12 h-0.5 bg-white/20 mx-auto mb-4" />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white uppercase font-[family-name:var(--font-barlow)] tracking-wide">
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
                  ? "bg-sindicato-warm-white text-sindicato-bordeaux shadow-sm"
                  : "bg-white/10 text-white/60 hover:bg-white/20"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading && cases.length === 0 && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full mx-auto mb-4" />
            <p className="text-white/40 text-sm">Loading cases...</p>
          </div>
        )}

        {error && cases.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/40 text-sm">Unable to load recent cases. Please try again later.</p>
          </div>
        )}

        {!loading && !error && cases.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/40 text-lg mb-2">No cases reported yet</p>
            <p className="text-white/30 text-sm">Be the first to report your experience</p>
          </div>
        )}

        {cases.length > 0 && (
          <div className="space-y-4">
            {cases.map((item, index) => (
              <Link key={item.id} href={`/cases/${item.id}`}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="bg-sindicato-warm-white p-5 sm:p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider ${
                          verticalStyles[item.vertical].badge
                        } font-[family-name:var(--font-barlow)]`}
                      >
                        {verticalStyles[item.vertical].label}
                      </span>
                      <span className="text-sindicato-charcoal/80 text-sm font-medium">
                        {item.displayName}
                      </span>
                      <span className="text-sindicato-charcoal/20 text-sm">&bull;</span>
                      <span className="text-sindicato-charcoal/60 text-sm">
                        {item.company.name}
                      </span>
                    </div>
                    <span className="text-sindicato-charcoal/40 text-xs whitespace-nowrap font-[family-name:var(--font-jetbrains)]">
                      {formatTimeAgo(item.createdAt)}
                    </span>
                  </div>

                  <p className="text-sindicato-charcoal/65 text-sm leading-relaxed">
                    {item.story.length > 150
                      ? item.story.slice(0, item.story.lastIndexOf(" ", 150)) + "..."
                      : item.story}
                  </p>

                  <div className="mt-2">
                    <span className="text-sindicato-bordeaux font-bold text-sm font-[family-name:var(--font-jetbrains)]">
                      {item.currency === "EUR" ? "\u20AC" : item.currency === "USD" ? "$" : item.currency}{" "}
                      {Number(item.amountOwed).toLocaleString()}
                    </span>
                    <span className="text-sindicato-charcoal/30 text-xs ml-2">unpaid</span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}

        {cases.length > 0 && (
          <div className="mt-10 text-center">
            <Link
              href="/cases"
              className="inline-block text-white/60 hover:text-white text-sm uppercase tracking-wider transition-colors font-[family-name:var(--font-barlow)] font-bold"
            >
              View All Cases &rarr;
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
