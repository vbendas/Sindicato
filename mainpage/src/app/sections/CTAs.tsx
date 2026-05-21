"use client";

import { motion } from "framer-motion";

interface CTAsProps {
  onRelateCase: () => void;
}

export default function CTAs({ onRelateCase }: CTAsProps) {
  return (
    <section className="bg-sindicato-bordeaux-dark border-t border-b border-white/10 lg:section-diagonal-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-28">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="border border-white/20 p-6 sm:p-8 transition-all duration-200 hover:border-white/30 flex flex-col h-full"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider mb-3 font-[family-name:var(--font-barlow)]">
              For Workers
            </h3>
            <p className="text-white/65 text-sm sm:text-base leading-relaxed mb-6 flex-1">
              Weren't paid what you were owed? Report it here. Wage theft, unpaid work, unfair practices, contractor exploitation. Whatever happened on your platform, file a case and get it documented.
            </p>
            <button
              onClick={onRelateCase}
              className="bg-sindicato-charcoal text-white px-6 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-sindicato-charcoal/80 transition-all font-[family-name:var(--font-barlow)] mt-auto"
            >
              File a Report
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="border border-white/20 p-6 sm:p-8 transition-all duration-200 hover:border-white/30 flex flex-col h-full"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider mb-3 font-[family-name:var(--font-barlow)]">
              For Legal Support
            </h3>
            <p className="text-white/65 text-sm sm:text-base leading-relaxed mb-6 flex-1">
              Workers who file cases can choose to share their contact with attorneys. That gives you direct access to people with documented, active claims, and gives workers legal representation they couldn't afford on their own.
            </p>
            <button className="bg-sindicato-charcoal text-white px-6 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-sindicato-charcoal/80 transition-all font-[family-name:var(--font-barlow)] mt-auto">
              View Case Listings
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="border border-white/20 p-6 sm:p-8 transition-all duration-200 hover:border-white/30 flex flex-col h-full"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider mb-3 font-[family-name:var(--font-barlow)]">
              For Companies
            </h3>
            <p className="text-white/65 text-sm sm:text-base leading-relaxed mb-6 flex-1">
              Register your company to access cases filed against you and respond directly. Every resolution is public. Workers and the press can see which companies engage and which ones don't. It's the same record that hurts you when you ignore it, and helps you when you don't.
            </p>
            <button className="bg-sindicato-charcoal text-white px-6 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-sindicato-charcoal/80 transition-all font-[family-name:var(--font-barlow)] mt-auto">
              Company Access
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
