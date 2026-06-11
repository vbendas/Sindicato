"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import Header from "../components/Header";
import Hero from "../sections/Hero";
import ManifestoStrip from "../sections/ManifestoStrip";
import HowItWorks from "../sections/HowItWorks";
import DataProtection from "../sections/DataProtection";
import PlatformOverview from "../sections/PlatformOverview";
import WhyItExists from "../sections/WhyItExists";
import VerticalNetworkCards from "../sections/VerticalNetworkCards";
import PathToResolution from "../sections/PathToResolution";
import LiveCaseFeed from "../sections/LiveCaseFeed";
import CTAs from "../sections/CTAs";
import Footer from "../sections/Footer";

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

interface TopTag {
  tagName: string;
  severity: "green" | "yellow" | "orange" | "red";
  count: number;
}

interface Stats {
  totalCases: number;
  totalUnpaid: number;
  activeCompanies: number;
  workersLegal: number;
  casesResolved: number;
  topTags: TopTag[];
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
  topTags: [],
  companies: [],
};

const defaultVerticals = {
  remote: { totalCases: 0, totalUnpaid: 0, activeCompanies: 0 },
  gig: { totalCases: 0, totalUnpaid: 0, activeCompanies: 0 },
};

export default function Home() {
  const [stats, setStats] = useState<Stats>(defaultStats);
  const [activeVertical, setActiveVertical] = useState("all");
  const [displayStats, setDisplayStats] = useState(defaultStats);
  const pathname = usePathname();

  const fetchStats = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch("/api/stats", { signal });
      if (response.ok) {
        const json = await response.json();
        if (json.ok) {
          setStats(json.data);
          setDisplayStats(json.data);
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      console.error("Failed to fetch stats:", err);
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetching on mount
    void fetchStats(controller.signal);
    const interval = setInterval(fetchStats, 30000);
    
    return () => {
      clearTimeout(timeoutId);
      controller.abort();
      clearInterval(interval);
    };
  }, [fetchStats, pathname]);

  // Refetch on browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      void fetchStats();
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
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
      <Header />
      <div className="fixed inset-0 pointer-events-none z-[60] grain-overlay" style={{ opacity: 0.45 }} />
      <main className="bg-sindicato-parchment relative">
        <Hero
          caseCount={stats.totalCases}
          companyCount={stats.activeCompanies}
        />
        <ManifestoStrip />
        <HowItWorks />
        <DataProtection />
        <PlatformOverview stats={displayStats} />
        <WhyItExists
          stats={displayStats}
          activeVertical={activeVertical}
          onVerticalChange={handleVerticalChange}
        />
        <VerticalNetworkCards verticals={stats.verticals ?? defaultVerticals} />
        <PathToResolution />
        <LiveCaseFeed />
        <CTAs />
        <Footer />
      </main>
    </>
  );
}
