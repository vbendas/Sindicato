"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function CTAs() {
  return (
    <section className="bg-sindicato-bordeaux-dark border-t border-b border-white/10 lg:section-diagonal-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-28">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="border border-white/20 p-6 sm:p-8 transition-all duration-200 hover:border-white/30 flex flex-col h-full"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-sindicato-warm-white uppercase tracking-wider mb-3 font-[family-name:var(--font-barlow)]">
              For Workers
            </h3>
            <p className="text-sindicato-warm-white/65 text-sm sm:text-base leading-relaxed mb-6 flex-1">
              Weren&apos;t paid what you were owed? Report it here. Wage theft, unpaid work, unfair practices, contractor exploitation. Whatever happened on your platform, file a case and get it documented.
            </p>
            <Link
              href="/file"
              className="bg-sindicato-charcoal text-sindicato-warm-white px-6 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-sindicato-charcoal/80 transition-all font-[family-name:var(--font-barlow)] mt-auto inline-block text-center"
            >
              File a Report
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="border border-white/20 p-6 sm:p-8 transition-all duration-200 hover:border-white/30 flex flex-col h-full"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-sindicato-warm-white uppercase tracking-wider mb-3 font-[family-name:var(--font-barlow)]">
              For Legal Support
            </h3>
            <p className="text-sindicato-warm-white/65 text-sm sm:text-base leading-relaxed mb-6 flex-1">
              Workers who file cases can choose to share their contact with attorneys. That gives you direct access to people with documented, active claims, and gives workers legal representation they couldn&apos;t afford on their own.
            </p>
            <Link
              href="/register?role=lawyer"
              className="bg-sindicato-charcoal text-sindicato-warm-white px-6 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-sindicato-charcoal/80 transition-all font-[family-name:var(--font-barlow)] mt-auto inline-block text-center"
            >
              View Case Listings
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="border border-white/20 p-6 sm:p-8 transition-all duration-200 hover:border-white/30 flex flex-col h-full"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-sindicato-warm-white uppercase tracking-wider mb-3 font-[family-name:var(--font-barlow)]">
              For Companies
            </h3>
            <p className="text-sindicato-warm-white/65 text-sm sm:text-base leading-relaxed mb-6 flex-1">
              Register your company to access cases filed against you and respond directly. Every resolution is public. Workers and the press can see which companies engage and which ones don&apos;t. It&apos;s the same record that hurts you when you ignore it, and helps you when you don&apos;t.
            </p>
            <Link
              href="/register?role=company"
              className="bg-sindicato-charcoal text-sindicato-warm-white px-6 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-sindicato-charcoal/80 transition-all font-[family-name:var(--font-barlow)] mt-auto inline-block text-center"
            >
              Company Access
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="border border-white/20 p-6 sm:p-8 transition-all duration-200 hover:border-white/30 flex flex-col h-full"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-sindicato-warm-white uppercase tracking-wider mb-3 font-[family-name:var(--font-barlow)]">
              Media &amp; Research
            </h3>
            <p className="text-sindicato-warm-white/65 text-sm sm:text-base leading-relaxed mb-6 flex-1">
              Journalists, content creators, academics, and researchers. Get access to case data, aliased contacts, and verified worker stories. Use the data for reporting, studies, and public interest work with full privacy protections.
            </p>
            <Link
              href="/register?role=media"
              className="bg-sindicato-charcoal text-sindicato-warm-white px-6 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-sindicato-charcoal/80 transition-all font-[family-name:var(--font-barlow)] mt-auto inline-block text-center"
            >
              Request Access
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
