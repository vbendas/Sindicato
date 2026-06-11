"use client";

import { motion } from "framer-motion";
import { Shield, Mail, Eye, UserCheck, FileCheck } from "lucide-react";
import { useT } from "@/lib/i18n";

const icons = [Shield, Mail, Eye, UserCheck, FileCheck];

export default function DataProtection() {
  const t = useT();

  const points = [
    t("dataProtection.point1"),
    t("dataProtection.point2"),
    t("dataProtection.point3"),
    t("dataProtection.point4"),
    t("dataProtection.point5"),
  ];

  return (
    <section className="bg-sindicato-parchment py-20 sm:py-24 lg:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-12 h-0.5 bg-sindicato-charcoal/20 mx-auto mb-4" />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-sindicato-charcoal uppercase font-[family-name:var(--font-barlow)] tracking-wide mb-3">
            {t("dataProtection.title")}
          </h2>
          <p className="text-sindicato-charcoal/50 text-sm sm:text-base font-[family-name:var(--font-jetbrains)] tracking-wider uppercase">
            {t("dataProtection.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {points.map((point, i) => {
            const Icon = icons[i];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-white/60 border border-sindicato-charcoal/10 p-6 flex items-start gap-4 transition-all duration-300 hover:border-sindicato-charcoal/25"
              >
                <span className="w-10 h-10 rounded-full bg-sindicato-bordeaux/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-sindicato-bordeaux" />
                </span>
                <p className="text-sindicato-charcoal/75 text-sm leading-relaxed">
                  {point}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
