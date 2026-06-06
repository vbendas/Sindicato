"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useT, useLocale } from "@/lib/i18n";

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

export default function VerticalNetworkCards({ verticals }: VerticalNetworkCardsProps) {
  const t = useT();
  const { locale } = useLocale();

  const verticalConfig = {
    remote: {
      title: t("network.remoteTitle"),
      description: t("network.remoteDescription"),
      href: `/${locale}/workers`,
    },
    gig: {
      title: t("network.gigTitle"),
      description: t("network.gigDescription"),
      href: `/${locale}/gig`,
    },
  };

  const hasData = verticals && typeof verticals.remote !== "undefined";

  if (!hasData) {
    return (
      <section className="bg-sindicato-bordeaux py-24 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sindicato-warm-white/40">{t("network.loading")}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-sindicato-bordeaux py-24 sm:py-28 lg:py-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-sindicato-warm-white uppercase text-center mb-14 font-[family-name:var(--font-barlow)] tracking-wide"
        >
          {t("network.title")}
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
                    className="block border border-white/20 p-6 sm:p-8 transition-all duration-200 hover:border-white/30 group"
                  >
                    <h3 className="text-xl sm:text-2xl font-bold text-sindicato-warm-white mb-2 uppercase tracking-wider font-[family-name:var(--font-barlow)]">
                      {config.title}
                    </h3>
                    <p className="text-sindicato-warm-white/65 text-sm sm:text-base mb-6">
                      {config.description}
                    </p>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl sm:text-3xl font-bold text-sindicato-warm-white font-[family-name:var(--font-barlow)]">
                          {stats?.totalCases ?? 0}
                        </div>
                        <div className="text-sindicato-warm-white/40 text-xs uppercase tracking-wider font-[family-name:var(--font-jetbrains)]">
                          {t("network.statCases")}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl sm:text-3xl font-bold text-sindicato-warm-white font-[family-name:var(--font-barlow)]">
                          &euro;{(stats?.totalUnpaid ?? 0).toLocaleString()}
                        </div>
                        <div className="text-sindicato-warm-white/40 text-xs uppercase tracking-wider font-[family-name:var(--font-jetbrains)]">
                          {t("network.statUnpaid")}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl sm:text-3xl font-bold text-sindicato-warm-white font-[family-name:var(--font-barlow)]">
                          {stats?.activeCompanies ?? 0}
                        </div>
                        <div className="text-sindicato-warm-white/40 text-xs uppercase tracking-wider font-[family-name:var(--font-jetbrains)]">
                          {t("network.statCompanies")}
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <span className="inline-block border border-white/30 text-sindicato-warm-white px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition-all hover:bg-white/10 font-[family-name:var(--font-barlow)]">
                        {t("network.enterHub", { title: config.title })} &rarr;
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
