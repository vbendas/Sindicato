"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../sections/Footer";

const paragraphs = [
  "For most of the twentieth century, workers shared physical space with the people who depended on the same wages, answered to the same foreman, and walked out the same factory gate. Organising was not a strategy you planned. It happened because you could not avoid the people your employer was also exploiting. You saw them every morning. Grievances spread fast because the conditions were shared and the people were present.",
  "That proximity was never neutral. It was power.",
  "Corporations understood this long before workers named it. Decades of subcontracting, outsourcing, and fragmentation were attempts to thin out that density. Then globalisation and the internet finished the job.",
  "A team of fifty people doing the same work might now be spread across twelve countries, in different time zones, communicating through channels the company controls. They may never speak.",
  "They may not even know the others exist.",
  "When one of them stops getting paid, they assume it is their problem. Most of the time it is not. But there is no infrastructure to let them find out.",
  "The platforms built on top of this model did not create that isolation. They found it ready-made and formalised it. Independent contractor status. Mandatory arbitration clauses that make collective legal action impossible. Terms of service that waive the right to public dispute. Communication routed through company channels, where it can be monitored, deleted, or simply ignored.",
  "The factory floor gave workers one thing the remote platform deliberately withholds: the ability to look sideways and see who else was being treated the same way.",
  "Sindicato gives that back.",
];

export default function ManifestoPage() {
  return (
    <>
      <Header />
      <main className="bg-sindicato-bordeaux min-h-screen">
        <section className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <Link
              href="/"
              className="text-white/40 hover:text-white text-xs uppercase tracking-wider transition-colors mb-8 inline-block font-[family-name:var(--font-barlow)] font-bold"
            >
              &larr; Back
            </Link>
            <div className="w-12 h-0.5 bg-white/20 mb-6" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white uppercase font-[family-name:var(--font-barlow)] tracking-tight mb-2">
              Sindicato Manifesto
            </h1>
            <p className="text-white/40 text-sm font-[family-name:var(--font-jetbrains)]">
              sindicato.report
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-5"
          >
            {paragraphs.map((p, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
                className="text-white/75 text-sm sm:text-base leading-relaxed"
              >
                {p}
              </motion.p>
            ))}
          </motion.div>

          <div className="pt-16 border-t border-white/10 mt-16">
            <p className="text-white/30 text-xs font-[family-name:var(--font-jetbrains)]">
              Sindicato — sindicato.report
            </p>
          </div>
        </section>
        <Footer />
      </main>
    </>
  );
}
