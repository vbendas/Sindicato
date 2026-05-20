"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface CaseCard {
  id: string;
  displayName: string;
  country: string;
  amountOwed: string;
  currency: string;
  claimTypes: {
    unpaidWages?: boolean;
    unfairPractices?: boolean;
    retaliation?: boolean;
    other?: boolean;
  };
  createdAt: string;
}

interface CompanyStats {
  slug: string;
  name: string;
  caseCount: number;
  totalUnpaid: number;
  wageClaims: number;
  unfairPracticeClaims: number;
  retaliationClaims: number;
  otherClaims: number;
}

const CLAIM_LABELS: Record<string, string> = {
  unpaidWages: "Unpaid Wages",
  unfairPractices: "Unfair Practices",
  retaliation: "Retaliation",
  other: "Other",
};

export default function CompanyReportPage({
  params,
}: {
  params: Promise<{ company: string }>;
}) {
  const [slug, setSlug] = useState<string>("");
  const [casesList, setCasesList] = useState<CaseCard[]>([]);
  const [companyStats, setCompanyStats] = useState<CompanyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => setSlug(p.company));
  }, [params]);

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [casesRes, statsRes] = await Promise.all([
          fetch(`/api/cases?company=${slug}&limit=100`),
          fetch("/api/stats"),
        ]);

        if (casesRes.ok) {
          const json = await casesRes.json();
          setCasesList(
            json.data.cases.map((c: CaseCard) => ({
              id: c.id,
              displayName: c.displayName,
              country: c.country,
              amountOwed: c.amountOwed,
              currency: c.currency,
              claimTypes: c.claimTypes,
              createdAt: c.createdAt,
            }))
          );
        }

        if (statsRes.ok) {
          const json = await statsRes.json();
          const found = json.data.companies.find(
            (c: CompanyStats) => c.slug === slug
          );
          if (found) setCompanyStats(found);
        }
      } catch (err) {
        console.error("Failed to fetch report data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  const displayName = companyStats?.name ?? slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const unpaidByCurrency = new Map<string, number>();
  for (const c of casesList) {
    const curr = c.currency ?? "EUR";
    unpaidByCurrency.set(curr, (unpaidByCurrency.get(curr) ?? 0) + Number(c.amountOwed));
  }
  const totalUnpaidDisplay = Array.from(unpaidByCurrency.entries())
    .map(([curr, total]) => `${curr} ${total.toLocaleString()}`)
    .join(" + ");

  const claimBreakdown = [
    { label: "Unpaid Wages", count: casesList.filter((c) => c.claimTypes.unpaidWages).length },
    { label: "Unfair Practices", count: casesList.filter((c) => c.claimTypes.unfairPractices).length },
    { label: "Retaliation", count: casesList.filter((c) => c.claimTypes.retaliation).length },
    { label: "Other", count: casesList.filter((c) => c.claimTypes.other).length },
  ];

  const sortedCases = [...casesList].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-sindicato-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sindicato-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sindicato-black relative">
      <div className="fixed inset-0 pointer-events-none z-50 grain-overlay" style={{ opacity: 0.04 }} />
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-8">
              <Link
                href={`/${slug}`}
                className="text-sindicato-cream/50 hover:text-sindicato-cream transition-colors text-sm uppercase tracking-wider"
              >
                &larr; Back to Campaign
              </Link>
            </div>

            <div className="border-b border-sindicato-cream/10 pb-8 mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-sindicato-cream font-heading mb-2">
                Data Report: {displayName}
              </h1>
              <p className="text-sindicato-cream/50 text-sm">
                Generated {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
              <div className="border border-sindicato-cream/10 p-6">
                <p className="text-sindicato-cream/50 text-xs uppercase tracking-wider mb-2">
                  Total Reported Cases
                </p>
                <p className="text-4xl font-bold text-sindicato-cream">
                  {casesList.length}
                </p>
              </div>
              <div className="border border-sindicato-cream/10 p-6">
                <p className="text-sindicato-cream/50 text-xs uppercase tracking-wider mb-2">
                  Total Unpaid
                </p>
                <p className="text-4xl font-bold text-sindicato-red">
                  {totalUnpaidDisplay}
                </p>
              </div>
              <div className="border border-sindicato-cream/10 p-6">
                <p className="text-sindicato-cream/50 text-xs uppercase tracking-wider mb-2">
                  Resolution Rate
                </p>
                <p className="text-4xl font-bold text-sindicato-orange">
                  0%
                </p>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-xl font-bold text-sindicato-cream mb-6 font-heading uppercase tracking-wider">
                Breakdown by Claim Type
              </h2>
              <div className="space-y-4">
                {claimBreakdown.map((item) => (
                  <div key={item.label} className="flex items-center gap-4">
                    <span className="text-sindicato-cream/70 text-sm w-40 shrink-0">
                      {item.label}
                    </span>
                    <div className="flex-1 bg-sindicato-cream/5 h-8 relative overflow-hidden">
                      <div
                        className="bg-sindicato-red h-full transition-all duration-500"
                        style={{
                          width: casesList.length > 0 ? `${(item.count / casesList.length) * 100}%` : "0%",
                        }}
                      />
                    </div>
                    <span className="text-sindicato-cream font-bold text-sm w-12 text-right">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-xl font-bold text-sindicato-cream mb-6 font-heading uppercase tracking-wider">
                Timeline of Reports
              </h2>
              <div className="border-l-2 border-sindicato-cream/10 ml-4 space-y-6">
                {sortedCases.map((c, i) => (
                  <div key={c.id} className="relative pl-8">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 bg-sindicato-red rounded-full" />
                    <div className="bg-sindicato-cream/5 border border-sindicato-cream/10 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sindicato-cream font-bold text-sm">
                          Case #{String(i + 1).padStart(3, "0")}
                        </p>
                        <p className="text-sindicato-cream/40 text-xs">
                          {new Date(c.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-sindicato-cream/60 text-sm">
                          {c.country}
                        </p>
                        <p className="text-sindicato-red font-bold text-sm">
                          {"\u20ac"}{c.amountOwed}
                        </p>
                        <div className="flex gap-2">
                          {Object.entries(c.claimTypes)
                            .filter(([, v]) => v)
                            .map(([key]) => (
                              <span
                                key={key}
                                className="text-sindicato-cream/40 text-xs uppercase"
                              >
                                {CLAIM_LABELS[key]}
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-sindicato-cream/10 pt-8">
              <div className="bg-sindicato-cream/5 border border-sindicato-cream/10 p-6">
                <p className="text-sindicato-cream/50 text-xs uppercase tracking-wider mb-3 font-bold">
                  Data Accuracy Disclaimer
                </p>
                <p className="text-sindicato-cream/40 text-sm leading-relaxed">
                  This report is generated from worker-submitted data. Each case represents an
                  individual account and has been attested to by the submitter. Sindicato does not
                  independently verify financial claims. Data is presented as reported and should
                  be considered accordingly. All personally identifiable information has been
                  redacted to protect worker privacy.
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link
                href={`/${slug}`}
                className="bg-sindicato-cream text-sindicato-black px-8 py-3 font-bold uppercase tracking-wider hover:bg-sindicato-cream/90 transition-colors torn-edge font-button inline-block"
              >
                Back to Campaign
              </Link>
            </div>
          </motion.div>
        </div>
    </div>
  );
}
