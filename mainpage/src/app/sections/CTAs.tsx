"use client";

import { motion } from "framer-motion";

interface CTAsProps {
  onRelateCase: () => void;
}

export default function CTAs({ onRelateCase }: CTAsProps) {
  return (
    <section className="bg-sindicato-bordeaux-dark border-t border-b border-white/10 lg:section-diagonal-top">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="border border-white/20 p-6 sm:p-8 transition-all duration-200 hover:border-white/30"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider mb-3 font-[family-name:var(--font-barlow)]">
              For Workers
            </h3>
            <p className="text-white/65 text-sm sm:text-base leading-relaxed mb-6">
              Were you not paid? Report wage theft, unpaid work, unfair practices, and contractor
              exploitation. Whether you work on remote platforms or gig delivery — your voice,
              your claim, your power.
            </p>
            <button
              onClick={onRelateCase}
              className="bg-sindicato-warm-white text-sindicato-bordeaux px-6 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-sindicato-warm-white/90 transition-all font-[family-name:var(--font-barlow)] shadow-sm active:scale-[0.98]"
            >
              File a Report
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="border border-white/20 p-6 sm:p-8 transition-all duration-200 hover:border-white/30"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider mb-3 font-[family-name:var(--font-barlow)]">
              For Legal Support
            </h3>
            <p className="text-white/65 text-sm sm:text-base leading-relaxed mb-6">
              Workers who report cases can choose to share their contact with attorneys. You get
              direct access to potential class action members. They get representation they could
              never afford alone.
            </p>
            <button className="border border-white/30 text-white px-6 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-white/10 transition-colors font-[family-name:var(--font-barlow)]">
              View Case Listings
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
