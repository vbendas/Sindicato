"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../sections/Footer";
import { useT } from "@/lib/i18n";

export default function ManifestoPage() {
  const t = useT();
  
  const paragraphs = [
    t("manifesto.p1"),
    t("manifesto.p2"),
    t("manifesto.p3"),
    t("manifesto.p4"),
    t("manifesto.p5"),
    t("manifesto.p6"),
    t("manifesto.p7"),
    t("manifesto.p8"),
    t("manifesto.p9"),
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
              {t("manifesto.title")}
            </h1>
            <p className="text-sindicato-warm-white/40 text-sm font-[family-name:var(--font-jetbrains)]">
              {t("manifesto.subtitle")}
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
                className="text-sindicato-warm-white/75 text-sm sm:text-base leading-relaxed"
              >
                {p}
              </motion.p>
            ))}
          </motion.div>

          <div className="pt-16 border-t border-white/10 mt-16">
            <p className="text-sindicato-warm-white/30 text-xs font-[family-name:var(--font-jetbrains)]">
              {t("manifesto.footer")}
            </p>
          </div>
        </section>
        <Footer />
      </main>
    </>
  );
}
