"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface VerticalStats {
  totalCases: number;
  totalUnpaid: number;
  activeCompanies: number;
}

interface VerticalNetworkCardsProps {
  verticals: {
    remote: VerticalStats;
    gig: VerticalStats;
  };
}

const verticalConfig = {
  remote: {
    title: "Remote Platform",
    description: "Data annotators, translators, freelancers, and remote platform workers",
    href: "/remote",
    color: "border-sindicato-bordeaux/30 hover:border-sindicato-bordeaux",
  },
  gig: {
    title: "Gig Delivery",
    description: "Delivery workers from Uber, Glovo, DoorDash, Just Eat, and other platforms",
    href: "/gig",
    color: "border-sindicato-bordeaux/30 hover:border-sindicato-bordeaux",
  },
};

export default function VerticalNetworkCards({ verticals }: VerticalNetworkCardsProps) {
  const hasData = verticals && typeof verticals.remote !== "undefined";

  if (!hasData) {
    return (
      <section className="bg-sindicato-parchment py-20 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sindicato-charcoal/40">Loading networks...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-sindicato-parchment py-20 sm:py-24 lg:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-sindicato-bordeaux uppercase text-center mb-14 font-[family-name:var(--font-barlow)] tracking-wide"
        >
          The Network
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {(Object.entries(verticalConfig) as [string, typeof verticalConfig.remote][]).map(
            ([key, config], index) => {
              const stats = verticals[key as keyof typeof verticals];
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.6 }}
                >
                  <Link
                    href={config.href}
                    className={`block border-2 ${config.color} p-6 sm:p-8 transition-all duration-300 group bg-sindicato-warm-white shadow-sm hover:shadow-md hover:-translate-y-0.5`}
                  >
                    <h3 className="text-xl sm:text-2xl font-bold text-sindicato-bordeaux mb-2 uppercase tracking-wider font-[family-name:var(--font-barlow)]">
                      {config.title}
                    </h3>
                    <p className="text-sindicato-charcoal/60 text-sm sm:text-base mb-6">
                      {config.description}
                    </p>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl sm:text-3xl font-bold text-sindicato-charcoal font-[family-name:var(--font-barlow)]">
                          {stats?.totalCases ?? 0}
                        </div>
                        <div className="text-sindicato-charcoal/40 text-xs uppercase tracking-wider font-[family-name:var(--font-jetbrains)]">
                          Cases
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl sm:text-3xl font-bold text-sindicato-charcoal font-[family-name:var(--font-barlow)]">
                          &euro;{(stats?.totalUnpaid ?? 0).toLocaleString()}
                        </div>
                        <div className="text-sindicato-charcoal/40 text-xs uppercase tracking-wider font-[family-name:var(--font-jetbrains)]">
                          Unpaid
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl sm:text-3xl font-bold text-sindicato-charcoal font-[family-name:var(--font-barlow)]">
                          {stats?.activeCompanies ?? 0}
                        </div>
                        <div className="text-sindicato-charcoal/40 text-xs uppercase tracking-wider font-[family-name:var(--font-jetbrains)]">
                          Companies
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <span className="inline-block bg-sindicato-bordeaux text-white px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition-all group-hover:bg-sindicato-bordeaux-dark shadow-sm font-[family-name:var(--font-barlow)]">
                        Enter {config.title} Hub &rarr;
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
}
