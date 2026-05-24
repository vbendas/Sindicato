"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "\u20ac",
  USD: "$",
  GBP: "\u00a3",
  BRL: "R$",
  INR: "\u20b9",
};

export default function CompanyReportPage({
  params,
}: {
  params: Promise<{ company: string }>;
}) {
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => setSlug(p.company));
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    setLoading(false);
  }, [slug]);

  return (
    <div className="min-h-screen bg-sindicato-pine text-sindicato-warm-white flex items-center justify-center">
      <div className="fixed inset-0 pointer-events-none z-[60] grain-overlay" style={{ opacity: 0.45 }} />
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Data Report</h1>
        <p className="text-sindicato-warm-white/60 mb-6">
          Report view for {slug} coming soon.
        </p>
        <Link
          href={`/${slug}`}
          className="text-sindicato-red hover:underline"
        >
          &larr; Back to campaign view
        </Link>
      </div>
    </div>
  );
}
