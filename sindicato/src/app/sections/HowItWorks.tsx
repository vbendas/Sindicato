"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const steps = [
  {
    icon: "/images/pen.png",
    title: "Report",
    description: "Workers document their case with details about wage theft, unpaid work, or unfair practices.",
  },
  {
    icon: "/images/megaphone.png",
    title: "Expose",
    description: "Cases become visible and collective, building pressure through public transparency.",
  },
  {
    icon: "/images/hand.png",
    title: "Resolve",
    description: "Companies engage to address cases, or face growing pressure as numbers accumulate.",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative w-full h-full bg-transparent">
      <div className="absolute inset-0 grain-overlay" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="absolute top-11 sm:top-14 left-0 right-0 z-20 text-center"
      >
        <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-sindicato-cream mb-3 sm:mb-4">
          How It Works
        </h2>
        <p className="text-sindicato-cream/60 text-sm sm:text-base lg:text-lg">
          Three simple steps to collective power
        </p>
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center h-full">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="relative"
            >
              {/* Connector line (desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-sindicato-red/30" />
              )}

              <div className="text-center">
                <div className="relative inline-block mb-4 sm:mb-6">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 mx-auto bg-sindicato-cream/5 rounded-full flex items-center justify-center border-2 border-sindicato-red/30">
                    <Image
                      src={step.icon}
                      alt={step.title}
                      width={50}
                      height={50}
                      className="invert w-8 h-8 sm:w-10 sm:h-10 lg:w-[60px] lg:h-[60px]"
                    />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 bg-sindicato-red rounded-full flex items-center justify-center text-sindicato-cream font-bold text-sm sm:text-base">
                    {index + 1}
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-sindicato-cream mb-2 sm:mb-4">
                  {step.title}
                </h3>
                <p className="text-sindicato-cream/70 text-sm sm:text-base max-w-xs mx-auto">
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
