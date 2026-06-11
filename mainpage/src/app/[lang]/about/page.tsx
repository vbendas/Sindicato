"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../sections/Footer";
import { useT } from "@/lib/i18n";

interface Section {
  title: string;
  paragraphs: string[];
  list?: string[];
  closing?: string[];
}

export default function AboutPage() {
  const t = useT();

  const sections: Section[] = [
    {
      title: t("about.sectionHowStarted"),
      paragraphs: [
        t("about.howStartedP1"),
        t("about.howStartedP2"),
        t("about.howStartedP3"),
      ],
    },
    {
      title: t("about.sectionCase001"),
      paragraphs: [
        "I am a senior machine learning engineer. In 2024 and 2025, I contracted with Alignerr, a platform operated by Labelbox Inc, to perform quality review and AI model evaluation work across three projects: CC Review, CHP Claude Code, and NEXT. I did the work. I logged my hours through Hubstaff time tracking. I passed the AutoQA quality checks. I followed the pinned Discord policies to the letter.",
        "Then payment was withheld. No valid reason given.",
        "I did what you are supposed to do. I assembled the evidence: Hubstaff logs, AutoQA scores, Discord policy screenshots. I documented the retaliation sequence that followed my escalation — the account deactivation, the project removals, the platform lockout. I packaged everything methodically and escalated formally, all the way to Labelbox's C-suite and Chief Legal Officer. I gave them five business days to resolve it.",
        "The deadline passed. The silence continued.",
        "This is Case #001. It is documented, timestamped, and active. It is the case that built this platform.",
      ],
    },
    {
      title: t("about.sectionThePattern"),
      paragraphs: [
        t("about.patternP1"),
        t("about.patternP2"),
        t("about.patternP3"),
        t("about.patternP4"),
      ],
    },
    {
      title: t("about.sectionTheModel"),
      paragraphs: [
        t("about.modelP1"),
        t("about.modelP2"),
        t("about.modelP3"),
        t("about.modelP4"),
        t("about.modelP5"),
      ],
    },
    {
      title: t("about.sectionHowWorks"),
      paragraphs: [
        "Sindicato is a digital labor rights platform. Workers self-publish their cases — their own words, their own evidence, their own attestation. The platform aggregates individual reports into collective dashboards per company, quantifying the total number of affected workers, unpaid hours, and monetary debt owed.",
        "It operates as a modern worker syndicate:",
        "Workers submit their case. It appears publicly on the Cases Wall — name partially redacted, story fully visible. Numbers aggregate on the company dashboard. Automated notifications inform the company each time a new case is filed. The totals grow. The pressure compounds.",
        "Companies that want to reach workers and resolve cases pay an access fee before receiving any contact information. Workers are notified immediately each time their case is viewed. Contact details are never shared without worker consent. Labor law firms can access opted-in worker clusters for class action intake. No intermediation. Firms contact workers directly. Workers own their claims. Sindicato provides the platform, not the verdict.",
        "Sindicato takes no money from investors, advertisers, companies listed on the platform, or attorneys. It runs on the voluntary support of workers, attorneys, journalists, and anyone who believes wage theft should have consequences. All surplus beyond operational costs goes to the Worker Support Fund: small claims filing fees covered, legal consultations provided, psychological support sessions funded. Workers pay nothing. Ever.",
        "Sindicato never verifies, endorses, or asserts individual claims. Workers attest to their own words under their own legal responsibility. The platform is the bulletin board. Workers publish. Sindicato displays.",
      ],
    },
    {
      title: t("about.sectionNeverDo"),
      paragraphs: [t("about.neverDoIntro")],
      list: [
        t("about.neverDo1"),
        t("about.neverDo2"),
        t("about.neverDo3"),
        t("about.neverDo4"),
        t("about.neverDo5"),
        t("about.neverDo6"),
        t("about.neverDo7"),
        t("about.neverDo8"),
        t("about.neverDo9"),
        t("about.neverDo10"),
        t("about.neverDo11"),
      ],
      closing: [
        t("about.neverDoClosing"),
      ],
    },
    {
      title: t("about.sectionFileCase"),
      paragraphs: [
        t("about.fileCaseP1"),
        t("about.fileCaseP2"),
        t("about.fileCaseP3"),
        t("about.fileCaseP4"),
      ],
    },
  ];

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-[60] grain-overlay" style={{ opacity: 0.45 }} />
      <Header />
      <main className="bg-sindicato-bordeaux min-h-screen">
        <section className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <div className="w-12 h-0.5 bg-white/20 mb-6 mx-auto" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-sindicato-warm-white uppercase font-[family-name:var(--font-barlow)] tracking-tight mb-2">
              {t("about.title")}
            </h1>
            <p className="text-sindicato-warm-white/40 text-sm font-[family-name:var(--font-jetbrains)]">
              {t("about.subtitle")}
            </p>
          </motion.div>

          <div className="space-y-16">
            {sections.map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.6 }}
              >
                <h2 className="text-xs uppercase tracking-widest text-sindicato-warm-white/30 font-[family-name:var(--font-barlow)] font-bold mb-6">
                  {section.title}
                </h2>

                <div className="space-y-5">
                  {section.paragraphs.map((p, j) => (
                    <p
                      key={j}
                      className="text-sindicato-warm-white/75 text-sm sm:text-base leading-relaxed"
                    >
                      {p}
                    </p>
                  ))}

                  {section.list && (
                    <div className="border-l-2 border-white/20 pl-6 space-y-3 my-6">
                      {section.list.map((item, j) => (
                        <p
                          key={j}
                          className="text-sindicato-warm-white/70 text-sm sm:text-base leading-relaxed"
                        >
                          {item}
                        </p>
                      ))}
                    </div>
                  )}

                  {section.closing?.map((p, j) => (
                    <p
                      key={j}
                      className="text-sindicato-warm-white/75 text-sm sm:text-base leading-relaxed"
                    >
                      {p}
                    </p>
                  ))}
                </div>

                {i < sections.length - 1 && (
                  <div className="w-12 h-0.5 bg-white/10 mt-16" />
                )}
              </motion.div>
            ))}

            <div className="pt-8 border-t border-white/10">
              <p className="text-sindicato-warm-white/30 text-xs font-[family-name:var(--font-jetbrains)]">
                {t("about.footerBrand")}
              </p>
              <p className="text-sindicato-warm-white/20 text-xs mt-1 font-[family-name:var(--font-jetbrains)]">
                {t("about.footerTagline")}
              </p>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    </>
  );
}
