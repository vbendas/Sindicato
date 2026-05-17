"use client";

import Image from "next/image";
import { motion } from "framer-motion";
interface HeroProps {
  onRelateCase: () => void;
}

export default function Hero({ onRelateCase }: HeroProps) {
  return (
    <section className="relative w-full h-full flex flex-col items-center justify-center overflow-visible">
      {/* Fixed Background - Parallax */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: "url(/images/bg/bg_black_red.png)" }}
      />
      <div className="fixed inset-0 bg-black/40 z-0" />
      <div className="fixed inset-0 grain-overlay z-0" />

      {/* Logo absolute at top */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="absolute top-11 sm:top-14 left-0 right-0 z-10 flex items-center justify-center gap-2 sm:gap-3 px-4"
      >
        <Image
          src="/images/logo.png"
          alt="Sindicato"
          width={42}
          height={42}
          className="invert w-8 h-8 sm:w-10 sm:h-10 lg:w-[42px] lg:h-[42px]"
          priority
        />
        <span className="text-2xl sm:text-3xl lg:text-5xl font-bold tracking-wider text-sindicato-cream font-button">
          SINDICATO
        </span>
      </motion.div>

      {/* Megaphone - absolute right, decorative */}
      <div
        className="absolute right-[25px] top-[calc(50%+130px)] -translate-y-1/2 z-[1] hidden lg:block"
      >
        <Image
          src="/images/megaphone_red.png"
          alt="Megaphone"
          width={725}
          height={725}
          className="opacity-90"
          style={{ maxWidth: '60vw', height: 'auto' }}
          priority
        />
      </div>

      {/* Content - left side */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-[50px]">
        <div className="text-center lg:text-left lg:max-w-[65%] px-2 sm:px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-sindicato-cream mb-4 sm:mb-6 leading-tight uppercase"
          >
            Make exploitation expensive.
            <br />
            <span className="text-sindicato-red">Make workers unstoppable.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-base sm:text-lg md:text-xl text-sindicato-cream/80 mb-6 sm:mb-10 max-w-2xl mx-auto lg:mx-0"
          >
            One worker was exploited. One case became a platform. Thousands of voices
            are about to become impossible to ignore.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            onClick={onRelateCase}
            className="bg-sindicato-red text-sindicato-cream px-6 sm:px-10 py-3 sm:py-4 text-base sm:text-lg lg:text-xl font-bold uppercase tracking-wider hover:bg-sindicato-red/90 transition-colors torn-edge font-button"
          >
            Relate Your Case
          </motion.button>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 border-2 border-sindicato-cream/50 rounded-full flex justify-center pt-2"
        >
          <motion.div className="w-1.5 h-1.5 bg-sindicato-cream/80 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
