"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function FeaturedCase() {
  return (
    <section className="relative w-full h-full bg-transparent">
      <div className="absolute inset-0 grain-overlay" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="absolute top-11 sm:top-14 left-0 right-0 z-20 text-center"
      >
        <div className="inline-block bg-sindicato-red/90 torn-edge px-4 sm:px-6 py-2 mb-3 sm:mb-4">
          <span className="text-sindicato-cream font-bold uppercase tracking-wider text-xs sm:text-sm font-button">
            Featured Case
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-sindicato-cream">
          Case #001: Alignerr/Labelbox
        </h2>
      </motion.div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center h-full">

        <div className="text-center">
            <p className="text-base sm:text-lg lg:text-xl text-sindicato-cream/80 mb-8 sm:mb-10 max-w-2xl mx-auto">
              The founding case that started Sindicato. A senior ML engineer documented
              wage theft through three AI training projects, complete with Hubstaff logs,
              AutoQA scores, and a documented retaliation sequence.
            </p>

            <Link
              href="/alignerr"
              className="inline-block bg-sindicato-cream text-sindicato-black px-6 sm:px-10 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-bold uppercase tracking-wider hover:bg-sindicato-cream/90 transition-colors torn-edge font-button"
            >
              View Full Campaign
            </Link>
          </div>
        </div>
      </section>
  );
}
