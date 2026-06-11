"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useT, useLocale } from "@/lib/i18n";
import { getTagSeverity, TAG_SEVERITY_COLORS } from "@/lib/ai/tag-taxonomy";
import { TAG_I18N_MAP } from "@/components/CaseTag";

interface TopTag {
  tagName: string;
  severity: "green" | "yellow" | "orange" | "red";
  count: number;
}

interface Stats {
  totalCases: number;
  totalUnpaid: number;
  activeCompanies: number;
  workersLegal: number;
  casesResolved: number;
  topTags: TopTag[];
}

interface PlatformOverviewProps {
  stats: Stats;
}

export default function PlatformOverview({ stats }: PlatformOverviewProps) {
  const t = useT();
  const { locale } = useLocale();

  return (
    <section className="bg-sindicato-charcoal py-16 sm:py-20 lg:py-24 lg:section-diagonal-bottom">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8 text-center sm:text-left">
          <span className="text-sindicato-warm-white/30 text-xs font-bold tracking-[0.25em] uppercase font-[family-name:var(--font-jetbrains)]">
            {t("platformOverview.label")}
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="border border-white/15 p-8 sm:p-10 lg:p-12 transition-all duration-300 hover:border-white/30"
        >
          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mb-8">
            {stats.totalCases > 0 && (
              <div>
                <span className="block text-sindicato-warm-white/40 text-xs uppercase tracking-wider mb-1 font-[family-name:var(--font-jetbrains)]">
                  {t("platformOverview.casesFiledLabel")}
                </span>
                <span className="text-sindicato-warm-white text-2xl sm:text-3xl font-bold font-[family-name:var(--font-jetbrains)]">
                  {stats.totalCases}
                </span>
              </div>
            )}
            <div>
              <span className="block text-sindicato-warm-white/40 text-xs uppercase tracking-wider mb-1 font-[family-name:var(--font-jetbrains)]">
                {t("platformOverview.companiesNotifiedLabel")}
              </span>
              <span className="text-sindicato-warm-white text-2xl sm:text-3xl font-bold font-[family-name:var(--font-jetbrains)]">
                {stats.activeCompanies}
              </span>
            </div>
            {stats.totalUnpaid > 0 && (
              <div>
                <span className="block text-sindicato-warm-white/40 text-xs uppercase tracking-wider mb-1 font-[family-name:var(--font-jetbrains)]">
                  {t("platformOverview.totalUnpaidLabel")}
                </span>
                <span className="text-sindicato-warm-white text-2xl sm:text-3xl font-bold font-[family-name:var(--font-jetbrains)]">
                  ${stats.totalUnpaid.toLocaleString()}
                </span>
              </div>
            )}
            {stats.casesResolved > 0 && (
              <div>
                <span className="block text-sindicato-warm-white/40 text-xs uppercase tracking-wider mb-1 font-[family-name:var(--font-jetbrains)]">
                  {t("platformOverview.resolvedLabel")}
                </span>
                <span className="text-sindicato-warm-white text-2xl sm:text-3xl font-bold font-[family-name:var(--font-jetbrains)]">
                  {stats.casesResolved}
                </span>
              </div>
            )}
          </div>

          {/* Top tags */}
          {stats.topTags && stats.topTags.length > 0 && (
            <div className="border-t border-white/10 pt-6 mb-6">
              <span className="block text-sindicato-warm-white/40 text-xs uppercase tracking-wider mb-3 font-[family-name:var(--font-jetbrains)]">
                {t("platformOverview.topTagsLabel")}
              </span>
              <div className="flex flex-wrap gap-2">
                {stats.topTags.map((tag) => {
                  const severity = getTagSeverity(tag.tagName);
                  const colors = TAG_SEVERITY_COLORS[severity];
                  const i18nKey = TAG_I18N_MAP[tag.tagName];
                  const label = i18nKey ? t(i18nKey) : tag.tagName;
                  return (
                    <span
                      key={tag.tagName}
                      className={`text-[10px] px-2 py-0.5 border font-[family-name:var(--font-jetbrains)] ${colors.bg} ${colors.text} ${colors.border}`}
                    >
                      {label} <span className="opacity-50">({tag.count})</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Description + CTA */}
          <div className="border-t border-white/10 pt-6">
            <p className="text-sindicato-warm-white/65 text-sm sm:text-base leading-relaxed mb-6 max-w-3xl">
              {t("platformOverview.description")}
            </p>

            <Link
              href={`/${locale}/cases`}
              className="inline-flex items-center gap-2 text-sindicato-warm-white font-bold uppercase tracking-wider text-sm hover:text-sindicato-warm-white/80 transition-colors font-[family-name:var(--font-barlow)] group"
            >
              {t("platformOverview.viewAll")}
              <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
