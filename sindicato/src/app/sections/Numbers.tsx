"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useInView } from "../hooks/useInView";
import Counter from "../components/Counter";

interface Stats {
  totalCases: number;
  totalUnpaid: number;
  activeCompanies: number;
  workersLegal: number;
  casesResolved: number;
}

interface NumbersProps {
  stats: Stats;
}

export default function Numbers({ stats }: NumbersProps) {
  const { ref, isInView } = useInView();

  const counters = [
    { label: "Cases Reported", value: stats.totalCases },
    { label: "Unpaid Wages", value: stats.totalUnpaid, prefix: "€" },
    { label: "Active Companies", value: stats.activeCompanies },
    { label: "Open to Legal Action", value: stats.workersLegal },
    {
      label: "Cases Resolved",
      value: stats.casesResolved,
      color:
        stats.casesResolved / (stats.totalCases || 1) > 0.5
          ? "text-green-500"
          : "text-sindicato-red",
    },
  ];

  return (
    <section
      ref={ref}
      className="relative w-full h-full bg-transparent"
    >
      <div className="absolute inset-0 grain-overlay" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="absolute top-11 sm:top-14 left-0 right-0 z-20 text-center"
      >
        <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-sindicato-cream mb-3 sm:mb-4">
          The Numbers
        </h2>
        <p className="text-sindicato-cream/60 text-sm sm:text-base lg:text-lg">
          Real-time data from workers worldwide
        </p>
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center h-full">

        <div className="flex flex-col items-center gap-10 lg:gap-14">
          {/* Counters row */}
          <div className="w-full">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-4">
              {counters.map((counter, index) => (
                <motion.div
                  key={counter.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="text-center"
                >
                  <div
                    className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2 ${
                      counter.color || "text-sindicato-cream"
                    }`}
                  >
                    <Counter
                      target={counter.value}
                      prefix={counter.prefix}
                      isInView={isInView}
                      duration={2000 + index * 200}
                    />
                  </div>
                  <div className="text-sindicato-cream/60 text-xs sm:text-sm lg:text-sm uppercase tracking-wider">
                    {counter.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Keyboard image below counters */}
          <div className="hidden lg:block">
            <div className="relative rotate-[-12deg]">
              <Image
                src="/images/keyboard_red.png"
                alt="Keyboard"
                width={500}
                height={500}
                className="opacity-90 w-full h-auto"
                style={{ maxWidth: '500px' }}
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
