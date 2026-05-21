"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Modal from "./components/Modal";
import Header from "./components/Header";
import Hero from "./sections/Hero";
import ManifestoStrip from "./sections/ManifestoStrip";
import HowItWorks from "./sections/HowItWorks";
import FeaturedCase from "./sections/FeaturedCase";
import WhyItExists from "./sections/WhyItExists";
import VerticalNetworkCards from "./sections/VerticalNetworkCards";
import LiveCaseFeed from "./sections/LiveCaseFeed";
import CTAs from "./sections/CTAs";
import Footer from "./sections/Footer";

interface Company {
  name: string;
  caseCount: number;
  totalUnpaid: number;
  vertical?: string;
}

interface VerticalStats {
  totalCases: number;
  totalUnpaid: number;
  activeCompanies: number;
}

interface Stats {
  totalCases: number;
  totalUnpaid: number;
  activeCompanies: number;
  workersLegal: number;
  casesResolved: number;
  companies: Company[];
  verticals?: {
    remote: VerticalStats;
    gig: VerticalStats;
  };
}

const defaultStats: Stats = {
  totalCases: 0,
  totalUnpaid: 0,
  activeCompanies: 0,
  workersLegal: 0,
  casesResolved: 0,
  companies: [],
};

const defaultVerticals = {
  remote: { totalCases: 0, totalUnpaid: 0, activeCompanies: 0 },
  gig: { totalCases: 0, totalUnpaid: 0, activeCompanies: 0 },
};

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState<Stats>(defaultStats);
  const [activeVertical, setActiveVertical] = useState("all");
  const [displayStats, setDisplayStats] = useState(defaultStats);
  const fetchedRef = useRef(false);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch("/api/stats");
      if (response.ok) {
        const json = await response.json();
        if (json.ok) {
          setStats(json.data);
          setDisplayStats(json.data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, []);

  const fetchVerticalStats = useCallback(async (vertical: string) => {
    try {
      const response = await fetch(`/api/stats?vertical=${vertical}`);
      if (response.ok) {
        const json = await response.json();
        if (json.ok) {
          setDisplayStats(json.data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch vertical stats:", error);
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

  const handleVerticalChange = useCallback(
    (vertical: string) => {
      setActiveVertical(vertical);
      if (vertical === "all") {
        setDisplayStats(stats);
      } else {
        fetchVerticalStats(vertical);
      }
    },
    [stats, fetchVerticalStats]
  );

  return (
    <>
      <Header onRelateCase={() => setIsModalOpen(true)} />
      <div className="fixed inset-0 pointer-events-none z-[60] grain-overlay" style={{ opacity: 0.45 }} />
      <main className="bg-sindicato-parchment relative">
        <Hero
          onRelateCase={() => setIsModalOpen(true)}
          caseCount={stats.totalCases}
          companyCount={stats.activeCompanies}
        />
        <ManifestoStrip />
        <HowItWorks />
        <FeaturedCase />
        <WhyItExists
          stats={displayStats}
          activeVertical={activeVertical}
          onVerticalChange={handleVerticalChange}
        />
        <VerticalNetworkCards verticals={stats.verticals ?? defaultVerticals} />
        <LiveCaseFeed />
        <CTAs onRelateCase={() => setIsModalOpen(true)} />
        <Footer />
      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
