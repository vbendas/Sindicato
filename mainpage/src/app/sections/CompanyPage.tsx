"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "../components/Header";
import Footer from "../sections/Footer";
import ShareButtons from "@/components/ShareButtons";
import { useTrackPageview } from "@/hooks/useTrackPageview";

interface CaseItem {
  id: string;
  displayName: string;
  country: string;
  amountOwed: string;
  currency: string;
  story: string;
  vertical: string;
  createdAt: string;
  resolutionStatus: string;
  company: { name: string; slug: string };
}

interface CompanyPageProps {
  slug: string;
  vertical: "remote" | "gig";
}

export default function CompanyPage({ slug, vertical }: CompanyPageProps) {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewsTotal, setViewsTotal] = useState<number | null>(null);
  const pathname = usePathname();
  const { data: session } = useSession();

  useTrackPageview("company", slug);

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

  useEffect(() => {
    async function fetchViews() {
      try {
        const res = await fetch(`/api/metrics?type=company&id=${slug}`);
        if (res.ok) {
          const json = await res.json();
          setViewsTotal(json.data?.viewsTotal ?? 0);
        }
      } catch {
        // silent
      }
    }
    fetchViews();
  }, [slug]);

  const companyName = cases.length > 0 ? cases[0].company.name : slug;
  const totalOwed = cases.reduce(
    (sum, c) => sum + Number(c.amountOwed),
    0
  );
  // legalWorkers would need a separate API call

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-[60] grain-overlay" style={{ opacity: 0.45 }} />
      <Header scrolledBg="bg-sindicato-pine/70 backdrop-blur-md border-white/5" clerkBg="bg-sindicato-bordeaux text-sindicato-warm-white" />
      <main className="bg-sindicato-pine min-h-screen">
        <section className="pt-20 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <Link
            href={vertical === "remote" ? "/workers" : "/gig"}
            className="text-sindicato-warm-white/40 hover:text-sindicato-warm-white text-xs uppercase tracking-wider transition-colors mb-6 inline-block font-[family-name:var(--font-barlow)] font-bold"
          >
            &larr; Back to {vertical === "remote" ? "Remote Workers" : "Gig Workers"} Hub
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-sindicato-warm-white uppercase font-[family-name:var(--font-barlow)] tracking-tight mb-4">
              {companyName}
            </h1>

            <div className="flex flex-wrap gap-6 mb-8">
              <div>
                <span className="block text-sindicato-warm-white/30 text-xs uppercase tracking-wider mb-1 font-[family-name:var(--font-jetbrains)]">
                  Total Cases
                </span>
                <span className="text-sindicato-warm-white text-2xl font-bold font-[family-name:var(--font-barlow)]">
                  {cases.length}
                </span>
              </div>
              <div>
                <span className="block text-sindicato-warm-white/30 text-xs uppercase tracking-wider mb-1 font-[family-name:var(--font-jetbrains)]">
                  Total Unpaid
                </span>
                <span className="text-sindicato-warm-white text-2xl font-bold font-[family-name:var(--font-barlow)]">
                  ${totalOwed.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="block text-sindicato-warm-white/30 text-xs uppercase tracking-wider mb-1 font-[family-name:var(--font-jetbrains)]">
                  Vertical
                </span>
                <span className="text-sindicato-warm-white text-2xl font-bold font-[family-name:var(--font-barlow)]">
                  {vertical === "remote" ? "Remote" : "Gig"}
                </span>
              </div>
              <div>
                <span className="block text-sindicato-warm-white/30 text-xs uppercase tracking-wider mb-1 font-[family-name:var(--font-jetbrains)]">
                  Total Views
                </span>
                <span className="text-sindicato-warm-white text-2xl font-bold font-[family-name:var(--font-barlow)]">
                  {viewsTotal !== null ? viewsTotal.toLocaleString() : "—"}
                </span>
              </div>
            </div>

            {cases.length > 0 && (
              <div className="mb-8">
                <p className="text-sindicato-warm-white/30 text-[10px] uppercase tracking-widest mb-3 font-[family-name:var(--font-jetbrains)]">
                  Share this report
                </p>
                <ShareButtons
                  url={typeof window !== "undefined" ? window.location.origin + pathname : pathname}
                  title={`${cases.length} cases filed against ${companyName}`}
                  description={`$${totalOwed.toLocaleString()} in unpaid wages reported by workers.`}
                  variant="company"
                  companyName={companyName}
                  stats={{ cases: cases.length, totalOwed: totalOwed.toLocaleString() }}
                  entityType="company"
                  entityId={slug}
                  isAuth={!!session}
                />
              </div>
            )}

            <div className="border-t border-white/10 pt-6">
              <h2 className="text-lg font-bold text-sindicato-warm-white uppercase tracking-wider mb-4 font-[family-name:var(--font-barlow)]">
                Filed Cases
              </h2>

              {loading && (
                <p className="text-sindicato-warm-white/40 text-sm">Loading cases...</p>
              )}

              {!loading && cases.length === 0 && (
                <p className="text-sindicato-warm-white/40 text-sm">No cases filed against this company yet.</p>
              )}

              <div className="space-y-3">
                {cases.map((item) => (
                  <Link key={item.id} href={`/cases/${item.id}`}>
                    <div className="bg-white/5 border border-white/10 p-4 hover:bg-white/10 transition-colors">
                      <div className="flex items-start justify-between gap-4 mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sindicato-warm-white font-medium text-sm truncate">
                            {item.displayName}
                          </span>
                          <span className="inline-flex items-center gap-1 bg-white/10 border border-white/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider font-[family-name:var(--font-jetbrains)] shrink-0">
                            <span className={`w-1 h-1 rounded-full ${item.resolutionStatus === "resolved" ? "bg-green-400" : "bg-red-400"}`} />
                            <span className={item.resolutionStatus === "resolved" ? "text-green-400" : "text-red-400"}>
                              {item.resolutionStatus === "resolved" ? "solved" : "unresolved"}
                            </span>
                          </span>
                        </div>
                        <span className="text-sindicato-warm-white/40 text-xs font-[family-name:var(--font-jetbrains)] shrink-0">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sindicato-warm-white/60 text-sm line-clamp-2">
                        {item.story}
                      </p>
                      {Number(item.amountOwed) > 0 && (
                        <div className="mt-2">
                          <span className="text-sindicato-warm-white font-bold text-sm font-[family-name:var(--font-jetbrains)]">
                            {item.currency === "EUR" ? "\u20AC" : "$"}{Number(item.amountOwed).toLocaleString()}
                          </span>
                          <span className="text-sindicato-warm-white/30 text-xs ml-2">unpaid</span>
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
