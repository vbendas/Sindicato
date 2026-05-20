"use client";

import { motion } from "framer-motion";
import Counter from "../components/Counter";
import { useInView } from "../hooks/useInView";

interface Stats {
  totalCases: number;
  totalUnpaid: number;
  activeCompanies: number;
  workersLegal: number;
  casesResolved: number;
}

interface WhyItExistsProps {
  stats: Stats;
  activeVertical: string;
  onVerticalChange: (vertical: string) => void;
}

const tabs = [
  { label: "All Networks", value: "all" },
  { label: "Remote", value: "remote" },
  { label: "Gig", value: "gig" },
];

const commitments = [
  "Workers pay nothing. Ever.",
  "Non-profit. Full financial transparency.",
  "Workers own their claims. We amplify their voices.",
  "Every company contact requires a signed non-retaliation agreement.",
];

export default function WhyItExists({ stats, activeVertical, onVerticalChange }: WhyItExistsProps) {
  const { ref, isInView } = useInView();

  const rows = [
    {
      stat: (
        <Counter target={stats.totalCases} isInView={isInView} duration={2500} />
      ),
      label: "cases filed",
      body: "Every case adds to a permanent public record. Individual complaints get ignored. A thousand individual complaints become a movement that regulators and attorneys cannot ignore.",
      invert: false,
    },
    {
      stat: `$${stats.totalUnpaid.toLocaleString()}`,
      label: "unpaid wages documented",
      body: "This is not hypothetical money. These are hours worked, tasks completed, and promises broken. Every dollar represents time stolen from workers who showed up and delivered.",
      invert: true,
    },
    {
      stat: stats.activeCompanies,
      label: "companies exposed",
      body: "Behind every number is a company policy. Wage theft is not a mistake — it is a business decision. We make those decisions visible so workers can organize around shared patterns.",
      invert: false,
    },
  ];

  return (
    <section ref={ref} className="bg-sindicato-parchment">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-left sm:text-center mb-12"
        >
          <div className="w-12 h-0.5 bg-sindicato-bordeaux/30 sm:mx-auto mb-4" />
          <div className="sm:border-l-4 sm:border-sindicato-gold sm:pl-6 inline-block">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-sindicato-bordeaux uppercase font-[family-name:var(--font-barlow)] tracking-wide leading-tight">
              Why It<br className="sm:hidden" /> Exists
            </h2>
          </div>
        </motion.div>

        <div className="flex justify-center gap-2 mb-16">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onVerticalChange(tab.value)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors font-[family-name:var(--font-barlow)] ${
                activeVertical === tab.value
                  ? "bg-sindicato-bordeaux text-white shadow-sm"
                  : "bg-sindicato-bordeaux/10 text-sindicato-bordeaux/60 hover:bg-sindicato-bordeaux/20"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-0">
          {rows.map((row, i) => (
            <div key={row.label}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className={`grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 py-10 sm:py-12 ${
                  i > 0 ? "border-t border-sindicato-bordeaux/10" : ""
                }`}
              >
                <div className={row.invert ? "order-2 md:order-2" : "order-2 md:order-1"}>
                  <div className="text-6xl sm:text-7xl lg:text-8xl font-bold text-sindicato-bordeaux font-[family-name:var(--font-barlow)] leading-none">
                    {row.stat}
                  </div>
                  <div className="text-sindicato-bordeaux/40 text-xs uppercase tracking-widest mt-2 font-[family-name:var(--font-jetbrains)]">
                    {row.label}
                  </div>
                </div>
                <div className={`flex items-center ${
                  row.invert ? "order-1 md:order-1" : "order-1 md:order-2"
                }`}>
                  <p className="text-sindicato-charcoal/65 text-sm sm:text-base leading-relaxed">
                    {row.body}
                  </p>
                </div>
              </motion.div>
            </div>
          ))}
        </div>

        <div className="border-t border-sindicato-bordeaux/10 pt-10 sm:pt-12 mt-10 sm:mt-12">
          <div className="w-12 h-0.5 bg-sindicato-bordeaux/30 mx-auto mb-6" />
          <h3 className="text-xl sm:text-2xl font-bold text-sindicato-bordeaux uppercase text-center mb-8 font-[family-name:var(--font-barlow)] tracking-wide">
            Our Commitment
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {commitments.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex items-start gap-3 bg-sindicato-warm-white p-4 transition-all duration-200 hover:shadow-sm"
              >
                <span className="w-1.5 h-1.5 bg-sindicato-bordeaux rounded-full mt-2 shrink-0" />
                <p className="text-sindicato-charcoal/80 text-sm">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
