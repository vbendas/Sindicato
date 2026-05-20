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

interface Company {
  name: string;
  caseCount: number;
  totalUnpaid: number;
  wageClaims: number;
  unfairPracticeClaims: number;
  retaliationClaims: number;
  otherClaims: number;
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

const content = {
  remote: {
    title: "Remote Workers",
    subtitle: "Data annotators, translators, freelancers, and platform workers. Your work powers AI. Your voice deserves to be heard.",
  },
  gig: {
    title: "Gig Delivery Workers",
    subtitle: "Delivery drivers and couriers from Uber, Glovo, DoorDash, Just Eat, and more. Your labor moves cities. Your rights should move too.",
  },
};

export default function VerticalHub({ vertical }: { vertical: "remote" | "gig" }) {
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

  const cfg = content[vertical];

  return (
    <>
      <Header onRelateCase={() => { window.location.href = "/file"; }} />
      <main className="bg-sindicato-parchment relative">
        <div className="fixed inset-0 pointer-events-none z-50 grain-overlay" style={{ opacity: 0.04 }} />
        <section className="min-h-[60vh] flex items-center justify-center bg-sindicato-bordeaux relative overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 max-w-3xl mx-auto px-4 text-center py-16 sm:py-20"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white uppercase mb-4 leading-tight font-[family-name:var(--font-barlow)]">
              {cfg.title}
            </h1>
            <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto">
              {cfg.subtitle}
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
        <CTAs onRelateCase={() => { window.location.href = "/file"; }} />
        <Footer />
      </main>
    </>
  );
}
