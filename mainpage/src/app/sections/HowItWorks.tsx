"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Document",
    description: "You describe what happened — dates, projects, amounts, contact attempts. Your words, your story, unedited.",
  },
  {
    number: "02",
    title: "Report",
    description: "Your case is added to the public record alongside others from the same company. Patterns emerge. Pressure builds.",
  },
  {
    number: "03",
    title: "Expose",
    description: "Collective cases become impossible to ignore. Attorneys opt in. Companies negotiate. Workers win.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-sindicato-bordeaux py-20 sm:py-24 lg:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white uppercase text-center mb-16 sm:mb-20 font-[family-name:var(--font-barlow)] tracking-wide"
        >
          How It Works
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              className="relative border border-white/25 p-6 sm:p-8 flex flex-col transition-all duration-300 hover:border-white/40 hover:-translate-y-0.5 overflow-hidden"
            >
              <span
                className="absolute -top-4 -left-2 text-[10rem] sm:text-[12rem] leading-none font-bold text-white/[0.06] font-[family-name:var(--font-jetbrains)] pointer-events-none select-none"
                aria-hidden="true"
              >
                {step.number}
              </span>
              <span className="relative z-10 text-lg sm:text-xl font-bold text-white mb-3 uppercase tracking-wider font-[family-name:var(--font-barlow)]">
                {step.title}
              </span>
              <p className="relative z-10 text-white/65 text-sm sm:text-base leading-relaxed flex-1">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
