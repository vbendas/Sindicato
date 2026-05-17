"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Modal from "./components/Modal";
import Hero from "./sections/Hero";
import Numbers from "./sections/Numbers";
import Manifesto from "./sections/Manifesto";
import HowItWorks from "./sections/HowItWorks";
import CTAs from "./sections/CTAs";
import FeaturedCase from "./sections/FeaturedCase";
import TrustBar from "./sections/TrustBar";
import Footer from "./sections/Footer";

interface Company {
  name: string;
  caseCount: number;
  totalUnpaid: number;
  wageClaims: number;
  unfairPracticeClaims: number;
  retaliationClaims: number;
  otherClaims: number;
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

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState<Stats>(defaultStats);
  const fetchedRef = useRef(false);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch("/api/stats");
      if (response.ok) {
        const json = await response.json();
        setStats(json.ok ? json.data : json);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, []);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchStats();
    }
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return (
    <>
      <main className="scroll-container">
        <div className="snap-section">
          <Hero onRelateCase={() => setIsModalOpen(true)} />
        </div>
        <div className="snap-section">
          <Numbers stats={stats} />
        </div>
        <div className="snap-section">
          <Manifesto companies={stats.companies} />
        </div>
        <div className="snap-section">
          <HowItWorks />
        </div>
        <div className="snap-section">
          <CTAs onRelateCase={() => setIsModalOpen(true)} />
        </div>
        <div className="snap-section">
          <FeaturedCase />
        </div>
        <div className="snap-section">
          <TrustBar />
        </div>
        <div className="snap-section">
          <Footer />
        </div>
      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
