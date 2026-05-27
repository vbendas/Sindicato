"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../sections/Footer";

export default function DonatePage() {
  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-[60] grain-overlay" style={{ opacity: 0.45 }} />
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
              className="text-sindicato-warm-white/40 hover:text-sindicato-warm-white text-xs uppercase tracking-wider transition-colors mb-6 inline-block font-[family-name:var(--font-barlow)] font-bold"
            >
              &larr; Back
            </Link>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-sindicato-warm-white uppercase font-[family-name:var(--font-barlow)] tracking-tight mb-4">
              Support Sindicato
            </h1>
            <p className="text-sindicato-warm-white/60 text-sm sm:text-base leading-relaxed">
              No investors. No advertisers. No company money.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <p className="text-sindicato-warm-white/80 text-base sm:text-lg leading-relaxed">
              This platform has no investors. No advertisers. No company money. It runs because people who care about fair work choose to support it. Workers who got their voice back. Attorneys who believe in fair representation. People who think this matters.
            </p>
            <p className="text-sindicato-warm-white/80 text-base sm:text-lg leading-relaxed mt-6">
              If that&rsquo;s you, donate what you can. If it isn&rsquo;t, use the platform freely. It costs nothing and always will.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="border border-white/10 p-8 sm:p-10"
          >
            <p className="text-sindicato-warm-white/40 text-xs uppercase tracking-widest font-[family-name:var(--font-barlow)] font-bold mb-4">
              Donation link coming soon
            </p>
            <p className="text-sindicato-warm-white/50 text-sm leading-relaxed">
              We&rsquo;re setting up our donation infrastructure. Check back shortly, or reach out at{" "}
              <a
                href="mailto:hello@sindicato.report"
                className="text-sindicato-warm-white/70 hover:text-sindicato-warm-white transition-colors underline underline-offset-2"
              >
                hello@sindicato.report
              </a>
              .
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-12 pt-8 border-t border-white/10"
          >
            <p className="text-sindicato-warm-white/30 text-xs leading-relaxed">
              Sindicato operates as a non-profit. Every euro beyond operational costs goes to the Worker Support Fund — covering small claims filing fees, legal consultations, and psychological support for workers who need it. Full financial transparency is published publicly.
            </p>
          </motion.div>
        </section>
        <Footer />
      </main>
    </>
  );
}
