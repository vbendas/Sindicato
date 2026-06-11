"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Counter from "../components/Counter";
import { useInView } from "../hooks/useInView";
import { useT } from "@/lib/i18n";

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

export default function WhyItExists({ stats, activeVertical, onVerticalChange }: WhyItExistsProps) {
  const t = useT();
  const { ref, isInView } = useInView();

  const tabs = [
    { label: t("whyItExists.tabAll"), value: "all" },
    { label: t("whyItExists.tabRemote"), value: "remote" },
    { label: t("whyItExists.tabGig"), value: "gig" },
  ];

  const commitments = [
    {
      title: t("whyItExists.commitment1Title"),
      body: t("whyItExists.commitment1Body"),
    },
    {
      title: t("whyItExists.commitment2Title"),
      body: t("whyItExists.commitment2Body"),
    },
    {
      title: t("whyItExists.commitment3Title"),
      body: t("whyItExists.commitment3Body"),
    },
    {
      title: t("whyItExists.commitment4Title"),
      body: t("whyItExists.commitment4Body"),
    },
    {
      title: t("whyItExists.commitment5Title"),
      body: t("whyItExists.commitment5Body"),
    },
    {
      title: t("whyItExists.commitment6Title"),
      body: t("whyItExists.commitment6Body"),
    },
    {
      title: t("whyItExists.commitment7Title"),
      body: t("whyItExists.commitment7Body"),
    },
  ];

  const slowDuration = 4000;

  const rows = [
    {
      stat: (
        <Counter target={stats.totalCases} isInView={isInView} duration={slowDuration} />
      ),
      label: t("whyItExists.statCasesLabel"),
      body: t("whyItExists.statCasesBody"),
      invert: false,
    },
    {
      stat: (
        <Counter target={stats.totalUnpaid} isInView={isInView} duration={slowDuration} prefix="$" />
      ),
      label: t("whyItExists.statUnpaidLabel"),
      body: t("whyItExists.statUnpaidBody"),
      invert: true,
    },
    {
      stat: (
        <Counter target={stats.activeCompanies} isInView={isInView} duration={slowDuration} />
      ),
      label: t("whyItExists.statCompaniesLabel"),
      body: t("whyItExists.statCompaniesBody"),
      invert: false,
    },
    {
      stat: (
        <Counter target={stats.casesResolved} isInView={isInView} duration={slowDuration} />
      ),
      label: t("whyItExists.statResolvedLabel"),
      body: t("whyItExists.statResolvedBody"),
      invert: true,
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
          <div className="inline-block">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-sindicato-warm-white uppercase font-[family-name:var(--font-barlow)] tracking-wide leading-tight">
              {t("whyItExists.title")}
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
                  ? "bg-sindicato-bordeaux text-sindicato-warm-white shadow-sm"
                  : "bg-white/10 text-sindicato-warm-white/60 hover:bg-white/20"
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
                  <div className="text-6xl sm:text-7xl lg:text-8xl font-bold text-sindicato-warm-white font-[family-name:var(--font-barlow)] leading-none">
                    {row.stat}
                  </div>
                  <div className="text-sindicato-warm-white/40 text-xs uppercase tracking-widest mt-2 font-[family-name:var(--font-jetbrains)]">
                    {row.label}
                  </div>
                </div>
                <div className={`flex items-center ${
                  row.invert ? "order-1 md:order-1" : "order-1 md:order-2"
                }`}>
                  <p className="text-sindicato-warm-white/65 text-sm sm:text-base leading-relaxed">
                    {row.body}
                  </p>
                </div>
              </motion.div>
            </div>
          ))}
        </div>

          <div className="-mx-4 sm:-mx-6 lg:-mx-8 mt-10 sm:mt-12 bg-sindicato-charcoal px-4 sm:px-6 lg:px-8 pt-[15px] pb-[100px]">
            <div className="w-12 h-0.5 bg-white/20 mx-auto mb-6" />
            <h3 className="text-xl sm:text-2xl font-bold text-sindicato-warm-white uppercase text-center mb-8 font-[family-name:var(--font-barlow)] tracking-wide">
              {t("whyItExists.commitmentTitle")}
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
                          <Check className="w-3 h-3 text-sindicato-warm-white/80" />
                        </span>
                        <div>
                          <p className="text-sindicato-warm-white text-sm sm:text-base font-bold mb-1">
                            {item.title}
                          </p>
                          <p className="text-sindicato-warm-white/60 text-xs sm:text-sm leading-relaxed">
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
