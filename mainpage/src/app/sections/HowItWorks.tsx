"use client";

import { motion } from "framer-motion";
import { FileText, ShieldCheck, Eye } from "lucide-react";

const steps = [
  {
    number: 1,
    title: "Document",
    icon: FileText,
    description: "What happened, when, and what you were owed. Names, dates, amounts. Whatever you remember. We never edit your words. They stay yours.",
  },
  {
    number: 2,
    title: "Report",
    icon: ShieldCheck,
    description: "Your story joins others from the same company. On the public record, visible to everyone. One complaint is a whisper. A stack of them becomes a pattern no one can ignore.",
  },
  {
    number: 3,
    title: "Expose",
    icon: Eye,
    description: "Patterns go public. Attorneys review the cases. When a collective action takes shape, workers present their evidence directly. The platform connects. The workers decide.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-sindicato-bordeaux py-28 sm:py-32 lg:py-36">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white uppercase text-center mb-4 font-[family-name:var(--font-barlow)] tracking-wide"
        >
          How It Works
        </motion.h2>
        <p className="text-white/45 text-sm sm:text-base text-center mb-16 sm:mb-20 font-[family-name:var(--font-jetbrains)] tracking-wider uppercase">
          Three steps. Your terms, your timeline.
        </p>

        {/* Desktop: horizontal stepped layout */}
        <div className="hidden md:flex items-start justify-between gap-0 relative">
          {steps.map((step, index) => (
            <div key={step.number} className="flex-1 relative">
              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div className="absolute top-6 left-[calc(50%+1.5rem)] right-0 h-[1px] bg-sindicato-gold/30" />
              )}

              {/* Step circle + icon */}
              <div className="flex flex-col items-center text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.5 }}
                  className="w-12 h-12 rounded-full bg-sindicato-warm-white flex items-center justify-center shadow-md mb-5 relative z-10"
                >
                  <step.icon className="w-5 h-5 text-sindicato-bordeaux" />
                </motion.div>

                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 + 0.1, duration: 0.5 }}
                  className="text-lg font-bold text-white uppercase tracking-wider font-[family-name:var(--font-barlow)] mb-3"
                >
                  {step.title}
                </motion.span>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 + 0.2, duration: 0.5 }}
                  className="text-white/60 text-sm leading-relaxed max-w-[260px] mx-auto"
                >
                  {step.description}
                </motion.p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: vertical stepped layout */}
        <div className="flex md:hidden flex-col gap-8 relative">
          {/* Vertical connecting line */}
          <div className="absolute left-[22px] top-0 bottom-0 w-[1px] bg-sindicato-gold/30" />

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              className="flex items-start gap-5 relative"
            >
              <div className="w-11 h-11 rounded-full bg-sindicato-warm-white flex items-center justify-center shrink-0 shadow-md relative z-10">
                <step.icon className="w-4 h-4 text-sindicato-bordeaux" />
              </div>
              <div className="pt-1.5">
                <span className="text-base font-bold text-white uppercase tracking-wider font-[family-name:var(--font-barlow)] block mb-1.5">
                  {step.title}
                </span>
                <p className="text-white/60 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
