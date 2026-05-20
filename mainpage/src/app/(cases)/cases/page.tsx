"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Header from "@/app/components/Header";
import Modal from "@/app/components/Modal";

interface CaseCard {
  id: string;
  displayName: string;
  email: string;
  country: string;
  projects: string;
  dateRange: string;
  amountOwed: string;
  currency: string;
  claimTypes: {
    unpaidWages?: boolean;
    unfairPractices?: boolean;
    retaliation?: boolean;
    other?: boolean;
  };
  story: string;
  createdAt: string;
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

const CLAIM_LABELS: Record<string, string> = {
  unpaidWages: "Unpaid Wages",
  unfairPractices: "Unfair Practices",
  retaliation: "Retaliation",
  other: "Other",
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "\u20ac",
  USD: "$",
  GBP: "\u00a3",
  BRL: "R$",
  INR: "\u20b9",
};

export default function CasesPage() {
  const [casesList, setCasesList] = useState<CaseCard[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fetchedRef = useRef(false);

  const fetchCases = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cases?page=${page}&limit=12`);
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
  }, []);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchCases(1);
    }
  }, [fetchCases]);

  return (
    <>
      <Header onRelateCase={() => setIsModalOpen(true)} />

      <div className="relative pt-24 pb-16">
        <div className="absolute inset-0 grain-overlay" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-block bg-sindicato-red/90 torn-edge px-6 py-2 mb-4">
              <span className="text-sindicato-cream font-bold uppercase tracking-wider text-sm font-button">
                Cases Wall
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-sindicato-cream mb-4 font-heading">
              Cases Wall
            </h1>
            <p className="text-sindicato-cream/60 text-lg sm:text-xl max-w-2xl mx-auto">
              Real stories from real workers
            </p>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-sindicato-red border-t-transparent rounded-full animate-spin" />
            </div>
          ) : casesList.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-sindicato-cream/60 text-lg">
                No cases reported yet. Be the first to share your story.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-6 bg-sindicato-red text-sindicato-cream px-8 py-3 font-bold uppercase tracking-wider hover:bg-sindicato-red/90 transition-colors torn-edge font-button"
              >
                Relate a Case
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {casesList.map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                  >
                    <Link href={`/cases/${c.id}`}>
                      <div className="bg-sindicato-cream/5 border border-sindicato-cream/10 p-6 hover:border-sindicato-red/50 transition-colors torn-edge h-full flex flex-col">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-sindicato-cream font-bold text-lg">
                              {c.displayName}
                            </p>
                            <p className="text-sindicato-cream/50 text-sm">
                              {c.country}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sindicato-red font-bold text-xl">
                              {CURRENCY_SYMBOLS[c.currency] ?? c.currency}
                              {c.amountOwed}
                            </p>
                          </div>
                        </div>

                        <Link
                          href={`/${c.company.slug}`}
                          className="text-sindicato-orange text-sm font-semibold uppercase tracking-wider hover:underline mb-3 inline-block"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {c.company.name}
                        </Link>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {Object.entries(c.claimTypes)
                            .filter(([, v]) => v)
                            .map(([key]) => (
                              <span
                                key={key}
                                className="bg-sindicato-red/20 text-sindicato-red text-xs px-2 py-1 uppercase tracking-wider font-semibold"
                              >
                                {CLAIM_LABELS[key] ?? key}
                              </span>
                            ))}
                        </div>

                        <p className="text-sindicato-cream/60 text-sm flex-1">
                          {c.story}
                        </p>

                        <div className="mt-4 pt-3 border-t border-sindicato-cream/10">
                          <p className="text-sindicato-cream/30 text-xs">
                            {new Date(c.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-12">
                  <button
                    onClick={() => fetchCases(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="bg-sindicato-cream/10 text-sindicato-cream px-6 py-2 font-bold uppercase tracking-wider hover:bg-sindicato-cream/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed torn-edge font-button text-sm"
                  >
                    Previous
                  </button>
                  <span className="text-sindicato-cream/60 text-sm">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => fetchCases(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="bg-sindicato-cream/10 text-sindicato-cream px-6 py-2 font-bold uppercase tracking-wider hover:bg-sindicato-cream/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed torn-edge font-button text-sm"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
