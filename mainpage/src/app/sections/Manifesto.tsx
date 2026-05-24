"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface Company {
  name: string;
  caseCount: number;
  totalUnpaid: number;
  wageClaims: number;
  unfairPracticeClaims: number;
  retaliationClaims: number;
  otherClaims: number;
  vertical?: string;
}

interface ManifestoProps {
  companies: Company[];
  activeVertical: string;
  onVerticalChange: (vertical: string) => void;
}

const manifestoLines = [
  { text: "Individual complaints get ignored.", red: false },
  { text: "Isolated workers have no leverage.", red: false },
  { text: "Together, our voices become impossible to silence.", red: true },
];

const tabs = [
  { label: "All Verticals", value: "all" },
  { label: "Remote", value: "remote" },
  { label: "Gig", value: "gig" },
];

export default function Manifesto({ companies, activeVertical, onVerticalChange }: ManifestoProps) {
  const filteredCompanies =
    activeVertical === "all"
      ? companies
      : companies.filter((c) => c.vertical === activeVertical);

  return (
    <section className="relative w-full h-full bg-transparent">

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="absolute top-11 sm:top-14 left-0 right-0 z-20 text-center px-4"
      >
        <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-sindicato-warm-white mb-3 sm:mb-4">
          The Wall
        </h2>
        <p className="text-sindicato-warm-white/60 text-sm sm:text-base lg:text-lg">
          Companies ranked by reported cases
        </p>
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col h-full">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="relative w-full flex-1 flex flex-col min-h-0">
            <div className="absolute left-[-75px] top-[-265px] hidden xl:block z-0 pointer-events-none">
              <div className="rotate-[39deg]">
                <div>
                  <Image
                    src="/images/hand2.png"
                    alt="Raised fist"
                    width={262}
                    height={262}
                    className="opacity-80 w-full h-auto"
                    style={{ maxWidth: "262px" }}
                    priority
                  />
                </div>
              </div>
            </div>

            <div className="max-w-5xl mx-auto w-full flex flex-col min-h-0">
              {/* Vertical filter tabs */}
              <div className="flex gap-2 mb-6 justify-center">
                {tabs.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => onVerticalChange(tab.value)}
                    className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors torn-edge font-button ${
                      activeVertical === tab.value
                        ? "bg-sindicato-red text-sindicato-warm-white"
                        : "bg-sindicato-warm-white/10 text-sindicato-warm-white/60 hover:bg-sindicato-warm-white/20"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="space-y-3 sm:space-y-4 overflow-y-auto min-h-0">
                {filteredCompanies.length > 0 ? (
                  filteredCompanies.map((company, index) => (
                    <motion.div
                      key={company.name}
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.15, duration: 0.6 }}
                      className={`flex items-center gap-4 sm:gap-6 p-4 sm:p-6 torn-edge ${
                        index === 0
                          ? "bg-sindicato-red/90"
                          : "bg-sindicato-black/80"
                      }`}
                    >
                      <span className="text-4xl sm:text-5xl lg:text-6xl font-bold text-sindicato-warm-white/30 min-w-[60px] sm:min-w-[80px] text-center">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-sindicato-warm-white truncate">
                          {company.name}
                        </h3>
                      </div>
                      <div className="hidden sm:flex items-center gap-4 lg:gap-6 shrink-0">
                        <div className="text-right">
                          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-sindicato-warm-white">
                            {company.totalUnpaid > 0 ? `€${company.totalUnpaid.toLocaleString()}` : "—"}
                          </div>
                          <div className="text-sindicato-warm-white/50 text-xs sm:text-sm uppercase tracking-wider">
                            unpaid
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-sindicato-warm-white">
                            {company.unfairPracticeClaims > 0 ? company.unfairPracticeClaims : "—"}
                          </div>
                          <div className="text-sindicato-warm-white/50 text-xs sm:text-sm uppercase tracking-wider">
                            unfair
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-sindicato-warm-white">
                            {company.retaliationClaims > 0 ? company.retaliationClaims : "—"}
                          </div>
                          <div className="text-sindicato-warm-white/50 text-xs sm:text-sm uppercase tracking-wider">
                            retaliation
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-sindicato-warm-white">
                            {company.otherClaims > 0 ? company.otherClaims : "—"}
                          </div>
                          <div className="text-sindicato-warm-white/50 text-xs sm:text-sm uppercase tracking-wider">
                            other
                          </div>
                        </div>
                      </div>
                      <div className="sm:hidden text-right shrink-0">
                        <div className="text-xl font-bold text-sindicato-warm-white">
                          {company.caseCount}
                        </div>
                        <div className="text-sindicato-warm-white/50 text-xs uppercase tracking-wider">
                          cases
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="bg-sindicato-black/60 torn-edge p-8 sm:p-12 text-center"
                  >
                    <p className="text-sindicato-warm-white/50 text-lg sm:text-xl">
                      No cases reported yet. Be the first.
                    </p>
                  </motion.div>
                )}

                {filteredCompanies.length > 0 && filteredCompanies.length < 3 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 0.4 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="border-2 border-dashed border-sindicato-warm-white/20 rounded-sm p-4 sm:p-6 text-center"
                  >
                    <p className="text-sindicato-warm-white/30 text-sm sm:text-base">
                      More companies will appear as workers report cases
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 sm:pt-8 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 max-w-5xl mx-auto">
            {manifestoLines.map((line, index) => (
              <motion.div
                key={line.text}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className={`torn-edge p-2 sm:p-3 ${
                  line.red
                    ? "bg-sindicato-red/90"
                    : "bg-sindicato-black/80"
                }`}
              >
                <p className="text-xs sm:text-sm lg:text-base font-bold text-sindicato-warm-white text-center leading-snug">
                  {line.text}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-sindicato-warm-white/30 text-xs sm:text-sm">
              Data reflects self-reported claims from individual workers and has not been independently verified.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
