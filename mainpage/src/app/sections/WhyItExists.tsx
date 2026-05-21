"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
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
  { label: "Remote Workers", value: "remote" },
  { label: "Gig Workers", value: "gig" },
];

const commitments = [
  {
    title: "No money. No strings. No business.",
    body: "Sindicato takes no money from investors, advertisers, or any company listed on this platform. Ever. It runs on the voluntary support of workers, attorneys, journalists, and anyone who believes wage theft should have consequences. No pressure. No commercialisation. No business. Community built for community."
  },
  {
    title: "Workers pay nothing. Ever.",
    body: "Every tool, every case filing, every communication channel is free for workers. No subscriptions. No hidden fees. No pay-to-play."
  },
  {
    title: "Non-profit. Full financial transparency.",
    body: "Every dollar that comes in and goes out is published. No black boxes. No executive bonuses. No shareholder expectations."
  },
  {
    title: "Workers own their claims. We amplify their voices.",
    body: "We provide the platform, not the verdict. Workers control their story, their identity, and their legal strategy at every step."
  },
  {
    title: "Legal protection built in.",
    body: "Companies and attorneys must sign non-retaliation contracts before contacting workers. Communication is anonymized through Sindicato alias emails until you decide otherwise."
  },
  {
    title: "Identity is a choice.",
    body: "Workers choose when and if to share their identity or contact details. Anonymity is never a barrier to filing a case."
  },
];

export default function WhyItExists({ stats, activeVertical, onVerticalChange }: WhyItExistsProps) {
  const { ref, isInView } = useInView();

  const slowDuration = 4000;

  const rows = [
    {
      stat: (
        <Counter target={stats.totalCases} isInView={isInView} duration={slowDuration} />
      ),
      label: "cases filed",
      body: "Every case adds to a permanent public record. Individual complaints get ignored. A thousand individual complaints become a movement that regulators and attorneys cannot ignore.",
      invert: false,
    },
    {
      stat: (
        <Counter target={stats.totalUnpaid} isInView={isInView} duration={slowDuration} prefix="$" />
      ),
      label: "unpaid wages documented",
      body: "This is not hypothetical money. These are hours worked, tasks completed, and promises broken. Every dollar represents time stolen from workers who showed up and delivered.",
      invert: true,
    },
    {
      stat: (
        <Counter target={stats.activeCompanies} isInView={isInView} duration={slowDuration} />
      ),
      label: "companies exposed",
      body: "Behind every number is a company policy. Wage theft is not a mistake — it is a business decision. We make those decisions visible so workers can organize around shared patterns.",
      invert: false,
    },
  ];

  return (
    <section ref={ref} className="bg-sindicato-bordeaux-dark relative">
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-32 lg:py-36">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-left sm:text-center mb-12"
        >
          <div className="w-12 h-0.5 bg-white/20 sm:mx-auto mb-4" />
          <div className="sm:border-l-4 sm:border-sindicato-charcoal sm:pl-6 inline-block">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white uppercase font-[family-name:var(--font-barlow)] tracking-wide leading-tight">
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
                  : "bg-white/10 text-white/60 hover:bg-white/20"
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
                  i > 0 ? "border-t border-white/10" : ""
                }`}
              >
                <div className={row.invert ? "order-2 md:order-2" : "order-2 md:order-1"}>
                  <div className="text-6xl sm:text-7xl lg:text-8xl font-bold text-white font-[family-name:var(--font-barlow)] leading-none">
                    {row.stat}
                  </div>
                  <div className="text-white/40 text-xs uppercase tracking-widest mt-2 font-[family-name:var(--font-jetbrains)]">
                    {row.label}
                  </div>
                </div>
                <div className={`flex items-center ${
                  row.invert ? "order-1 md:order-1" : "order-1 md:order-2"
                }`}>
                  <p className="text-white/65 text-sm sm:text-base leading-relaxed">
                    {row.body}
                  </p>
                </div>
              </motion.div>
            </div>
          ))}
        </div>

          <div className="-mx-4 sm:-mx-6 lg:-mx-8 mt-10 sm:mt-12 bg-sindicato-charcoal px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12 pb-[75px]">
            <div className="w-12 h-0.5 bg-white/20 mx-auto mb-6" />
            <h3 className="text-xl sm:text-2xl font-bold text-white uppercase text-center mb-8 font-[family-name:var(--font-barlow)] tracking-wide">
              Our Commitment
            </h3>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="border border-white/25 p-8 sm:p-10 max-w-2xl mx-auto"
            >
              <div className="space-y-6 sm:space-y-8">
                  {commitments.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.4 }}
                    >
                      <div className="flex items-start gap-4">
                        <span className="w-6 h-6 rounded-full border border-white/30 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-white/80" />
                        </span>
                        <div>
                          <p className="text-white text-sm sm:text-base font-bold mb-1">
                            {item.title}
                          </p>
                          <p className="text-white/60 text-xs sm:text-sm leading-relaxed">
                            {item.body}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
      </div>
    </section>
  );
}
