"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../sections/Footer";

interface CaseItem {
  id: string;
  displayName: string;
  country: string;
  amountOwed: string;
  currency: string;
  story: string;
  vertical: string;
  createdAt: string;
  company: { name: string; slug: string };
}

interface CompanyPageProps {
  slug: string;
  vertical: "remote" | "gig";
}

export default function CompanyPage({ slug, vertical }: CompanyPageProps) {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);

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

  const companyName = cases.length > 0 ? cases[0].company.name : slug;
  const totalOwed = cases.reduce(
    (sum, c) => sum + Number(c.amountOwed),
    0
  );
  // legalWorkers would need a separate API call

  return (
    <>
      <Header scrolledBg="bg-sindicato-pine/70 backdrop-blur-md border-white/5" />
      <main className="bg-sindicato-pine min-h-screen">
        <section className="pt-20 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <Link
            href={vertical === "remote" ? "/workers" : "/gig"}
            className="text-white/40 hover:text-white text-xs uppercase tracking-wider transition-colors mb-6 inline-block font-[family-name:var(--font-barlow)] font-bold"
          >
            &larr; Back to {vertical === "remote" ? "Remote Workers" : "Gig Workers"} Hub
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white uppercase font-[family-name:var(--font-barlow)] tracking-tight mb-4">
              {companyName}
            </h1>

            <div className="flex flex-wrap gap-6 mb-8">
              <div>
                <span className="block text-white/30 text-xs uppercase tracking-wider mb-1 font-[family-name:var(--font-jetbrains)]">
                  Total Cases
                </span>
                <span className="text-white text-2xl font-bold font-[family-name:var(--font-barlow)]">
                  {cases.length}
                </span>
              </div>
              <div>
                <span className="block text-white/30 text-xs uppercase tracking-wider mb-1 font-[family-name:var(--font-jetbrains)]">
                  Total Unpaid
                </span>
                <span className="text-white text-2xl font-bold font-[family-name:var(--font-barlow)]">
                  ${totalOwed.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="block text-white/30 text-xs uppercase tracking-wider mb-1 font-[family-name:var(--font-jetbrains)]">
                  Vertical
                </span>
                <span className="text-white text-2xl font-bold font-[family-name:var(--font-barlow)]">
                  {vertical === "remote" ? "Remote" : "Gig"}
                </span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4 font-[family-name:var(--font-barlow)]">
                Filed Cases
              </h2>

              {loading && (
                <p className="text-white/40 text-sm">Loading cases...</p>
              )}

              {!loading && cases.length === 0 && (
                <p className="text-white/40 text-sm">No cases filed against this company yet.</p>
              )}

              <div className="space-y-3">
                {cases.map((item) => (
                  <Link key={item.id} href={`/cases/${item.id}`}>
                    <div className="bg-white/5 border border-white/10 p-4 hover:bg-white/10 transition-colors">
                      <div className="flex items-start justify-between gap-4 mb-1">
                        <span className="text-white font-medium text-sm">
                          {item.displayName}
                        </span>
                        <span className="text-white/40 text-xs font-[family-name:var(--font-jetbrains)]">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-white/60 text-sm line-clamp-2">
                        {item.story}
                      </p>
                      {Number(item.amountOwed) > 0 && (
                        <div className="mt-2">
                          <span className="text-white font-bold text-sm font-[family-name:var(--font-jetbrains)]">
                            {item.currency === "EUR" ? "\u20AC" : "$"}{Number(item.amountOwed).toLocaleString()}
                          </span>
                          <span className="text-white/30 text-xs ml-2">unpaid</span>
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
