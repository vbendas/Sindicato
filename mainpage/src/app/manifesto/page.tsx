"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../sections/Footer";

const sections = [
  {
    title: "The Problem",
    body: "Wage theft costs workers billions every year. Individual complaints are ignored, buried in support tickets, or dismissed as isolated incidents. Companies know that most workers can't afford legal action, and those who try face retaliation, account locks, and blacklisting.",
  },
  {
    title: "The Insight",
    body: "One worker is a nuisance. A hundred workers from the same company are a pattern. A thousand are a class action waiting to happen. The only thing between exploitation and accountability is visibility.",
  },
  {
    title: "The Solution",
    body: "Sindicato is a public record of worker exploitation. We make every case visible, searchable, and connected to every other case from the same company. Workers remain anonymous to the public but can choose to connect with attorneys pursuing collective action.",
  },
  {
    title: "The Principles",
    body: "Public record. Worker-first. Free to use. No ads. Ever. We do not edit or rewrite worker accounts. We do not take sides in disputes. We do not sell data. We do not accept money from investors, advertisers, or any company listed on this platform.",
  },
  {
    title: "How We're Funded",
    body: "Sindicato takes no money from investors, advertisers, or any company listed on this platform. Ever. It runs on the voluntary support of workers, attorneys, journalists, and anyone who believes wage theft should have consequences. No pressure. No commercialisation. No business. Community built for community.",
  },
];

export default function ManifestoPage() {
  return (
    <>
      <Header />
      <main className="bg-sindicato-bordeaux min-h-screen">
        <section className="pt-24 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <Link
              href="/"
              className="text-white/40 hover:text-white text-xs uppercase tracking-wider transition-colors mb-6 inline-block font-[family-name:var(--font-barlow)] font-bold"
            >
              &larr; Back
            </Link>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white uppercase font-[family-name:var(--font-barlow)] tracking-tight mb-4">
              Manifesto
            </h1>
            <p className="text-white/60 text-sm sm:text-base leading-relaxed">
              Why Sindicato exists, how it works, and what we stand for.
            </p>
          </motion.div>

          <div className="space-y-12">
            {sections.map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
              >
                <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider mb-3 font-[family-name:var(--font-barlow)]">
                  {section.title}
                </h2>
                <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                  {section.body}
                </p>
                {i < sections.length - 1 && (
                  <div className="w-12 h-0.5 bg-white/10 mt-8" />
                )}
              </motion.div>
            ))}
          </div>
        </section>
        <Footer />
      </main>
    </>
  );
}
