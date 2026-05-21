"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Header from "@/app/components/Header";
import Modal from "@/app/components/Modal";

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

export default function CompanyPage({
  params,
}: {
  params: Promise<{ company: string }>;
}) {
  const [slug, setSlug] = useState<string>("");
  const [casesList, setCasesList] = useState<CaseCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    params.then((p) => setSlug(p.company));
  }, [params]);

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const casesRes = await fetch(`/api/cases?company=${slug}&limit=100`);

        if (casesRes.ok) {
          const json = await casesRes.json();
          setCasesList(json.data.cases);
        }
      } catch (err) {
        console.error("Failed to fetch company data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  const unpaidByCurrency = new Map<string, number>();
  for (const c of casesList) {
    const curr = c.currency ?? "EUR";
    unpaidByCurrency.set(curr, (unpaidByCurrency.get(curr) ?? 0) + Number(c.amountOwed));
  }
  const totalUnpaidDisplay = Array.from(unpaidByCurrency.entries())
    .map(([curr, total]) => `${CURRENCY_SYMBOLS[curr] ?? curr}${total.toLocaleString()}`)
    .join(" + ");
  const displayName = casesList[0]?.company.name ?? slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <>
      <Header onRelateCase={() => setIsModalOpen(true)} />

      <div className="relative pt-24 pb-16">
        <div className="fixed inset-0 pointer-events-none z-50 grain-overlay" style={{ opacity: 0.04 }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-block bg-sindicato-red/90 torn-edge px-6 py-2 mb-4">
              <span className="text-sindicato-cream font-bold uppercase tracking-wider text-sm font-button">
                Company Campaign
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-sindicato-cream mb-4 font-heading">
              {displayName}
            </h1>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-sindicato-red border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-sindicato-cream/5 border border-sindicato-cream/10 p-6 text-center torn-edge"
                >
                  <p className="text-3xl sm:text-4xl font-bold text-sindicato-red">
                    {casesList.length}
                  </p>
                  <p className="text-sindicato-cream/60 text-sm uppercase tracking-wider mt-2">
                    Total Cases
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-sindicato-cream/5 border border-sindicato-cream/10 p-6 text-center torn-edge"
                >
                  <p className="text-3xl sm:text-4xl font-bold text-sindicato-red">
                    {totalUnpaidDisplay}
                  </p>
                  <p className="text-sindicato-cream/60 text-sm uppercase tracking-wider mt-2">
                    Total Reported Unpaid
                  </p>
                </motion.div>
              </div>

              <div className="bg-sindicato-red/10 border border-sindicato-red/30 p-6 mb-12 torn-edge">
                <p className="text-sindicato-cream/70 text-sm">
                  Figures represent individual reports submitted by registered users. Sindicato does not independently verify claims.
                </p>
              </div>

              {casesList.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sindicato-cream/60">
                    No cases reported for this company yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {casesList.map((c, i) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
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
                            <p className="text-sindicato-red font-bold text-xl">
                              {CURRENCY_SYMBOLS[c.currency] ?? c.currency}
                              {c.amountOwed}
                            </p>
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
              )}

              <div className="text-center">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-sindicato-red text-sindicato-cream px-10 py-4 font-bold uppercase tracking-wider hover:bg-sindicato-red/90 transition-colors torn-edge font-button text-lg"
                >
                  Worked here? Report your case
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
