"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import Header from "../components/Header";
import ManifestoStrip from "../sections/ManifestoStrip";
import HowItWorks from "../sections/HowItWorks";
import WhyItExists from "../sections/WhyItExists";
import LiveCaseFeed from "../sections/LiveCaseFeed";
import CTAs from "../sections/CTAs";
import Footer from "../sections/Footer";
import { useT } from "@/lib/i18n";

interface Company {
  name: string;
  caseCount: number;
  totalUnpaid: number;
  vertical?: string;
}

interface Stats {
  totalCases: number;
  totalUnpaid: number;
  activeCompanies: number;
  workersLegal: number;
  casesResolved: number;
  companies: Company[];
}

const defaultStats: Stats = {
  totalCases: 0,
  totalUnpaid: 0,
  activeCompanies: 0,
  workersLegal: 0,
  casesResolved: 0,
  companies: [],
};

export default function VerticalHub({ vertical }: { vertical: "remote" | "gig" }) {
  const t = useT();
  const [stats, setStats] = useState<Stats>(defaultStats);
  const [activeVertical, setActiveVertical] = useState<string>(vertical);
  const fetchedRef = useRef(false);

  const fetchStats = useCallback(async (v: string) => {
    try {
      const response = await fetch(`/api/stats?vertical=${v}`);
      if (response.ok) {
        const json = await response.json();
        if (json.ok) {
          setStats(json.data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, []);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchStats(vertical);
    }
  }, [fetchStats, vertical]);

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-[60] grain-overlay" style={{ opacity: 0.45 }} />
      <Header />
      <main className="bg-sindicato-parchment relative">
        <section className="min-h-[60vh] flex items-center justify-center bg-sindicato-bordeaux relative overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 max-w-3xl mx-auto px-4 text-center py-16 sm:py-20"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-sindicato-warm-white uppercase mb-4 leading-tight font-[family-name:var(--font-barlow)]">
              {t(`verticalHub.${vertical}Title`)}
            </h1>
            <p className="text-base sm:text-lg text-sindicato-warm-white/70 max-w-2xl mx-auto">
              {t(`verticalHub.${vertical}Subtitle`)}
            </p>
          </motion.div>
        </section>

        <ManifestoStrip />
        <HowItWorks />
        <WhyItExists
          stats={stats}
          activeVertical={activeVertical}
          onVerticalChange={setActiveVertical}
        />
        <LiveCaseFeed />
        <CTAs />
        <Footer />
      </main>
    </>
  );
}
