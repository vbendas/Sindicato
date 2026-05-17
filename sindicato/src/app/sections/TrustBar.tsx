"use client";

import { motion } from "framer-motion";

const trustItems = [
  "Workers pay nothing. Ever.",
  "Non-profit. Full financial transparency.",
  "Workers own their claims. We amplify their voices so they can be heard.",
  "Every company contact requires a signed non-retaliation agreement.",
];

export default function TrustBar() {
  return (
    <section className="relative py-12 sm:py-20 lg:py-24 bg-white/95">
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sindicato-black mb-2">
            Our Commitment
          </h2>
          <div className="w-24 h-1 bg-sindicato-red mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {trustItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 bg-sindicato-black/5 torn-edge"
            >
              <div className="w-2 h-2 bg-sindicato-red rounded-full mt-1.5 sm:mt-2 flex-shrink-0" />
              <p className="text-sindicato-black font-medium text-sm sm:text-base">{item}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
