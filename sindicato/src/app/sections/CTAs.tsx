"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface CTAsProps {
  onRelateCase: () => void;
}

const ctaData = [
  {
    id: "workers",
    icon: "/images/hand.png",
    headline: "Were you not paid?",
    body: "Report wage theft, unpaid work, unfair practices, and contractor exploitation. Your voice, your claim, your power.",
    cta: "Relate a case",
    accentColor: "bg-sindicato-red",
    textColor: "text-sindicato-cream",
    borderColor: "border-sindicato-red/40",
  },
  {
    id: "lawyers",
    icon: "/images/pen.png",
    headline: "Labor attorneys: Workers need you",
    body: "Workers who report cases can choose to share their contact with attorneys. You get direct access to potential class action members. They get representation they could never afford alone. Everyone wins — except exploitative companies.",
    cta: "View case listings",
    accentColor: "bg-sindicato-cream",
    textColor: "text-sindicato-black",
    borderColor: "border-sindicato-cream/20",
  },
  {
    id: "companies",
    icon: "/images/helmet.png",
    headline: "Companies: Resolve before it grows",
    body: "Get in contact with workers to address the reported cases directly. Workers can mark cases resolved and leave feedback — building your reputation for cooperation. Non-retaliation agreement required.",
    cta: "Start resolution",
    accentColor: "bg-sindicato-cream",
    textColor: "text-sindicato-black",
    borderColor: "border-sindicato-cream/20",
  },
];

export default function CTAs({ onRelateCase }: CTAsProps) {
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
          Who Are You?
        </h2>
        <p className="text-sindicato-cream/60 text-sm sm:text-base lg:text-lg">
          Choose your path
        </p>
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center h-full">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {ctaData.map((cta, index) => (
            <motion.div
              key={cta.id}
              id={cta.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              className={`relative border ${cta.borderColor} bg-sindicato-black/40 p-6 sm:p-8 flex flex-col`}
            >
              <div className="mb-4 sm:mb-6">
                <Image
                  src={cta.icon}
                  alt={cta.headline}
                  width={60}
                  height={60}
                  className="invert opacity-80 w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16"
                />
              </div>

              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-sindicato-cream mb-3 sm:mb-4">
                {cta.headline}
              </h3>

              <p className="text-sindicato-cream/70 text-sm sm:text-base mb-6 sm:mb-8 flex-grow">
                {cta.body}
              </p>

              <button
                onClick={() => {
                  if (cta.id === "workers") {
                    onRelateCase();
                  } else {
                    alert(`Coming soon: ${cta.cta}`);
                  }
                }}
                className={`w-full ${cta.accentColor} ${cta.textColor} py-3 sm:py-4 text-sm sm:text-base font-bold uppercase tracking-wider hover:opacity-90 transition-opacity torn-edge font-button`}
              >
                {cta.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
