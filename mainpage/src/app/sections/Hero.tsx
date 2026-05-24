"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

interface HeroProps {
  caseCount?: number;
  companyCount?: number;
}

export default function Hero({ caseCount = 0, companyCount = 0 }: HeroProps) {
  const { scrollYProgress } = useScroll();
  const fistOpacity = useTransform(scrollYProgress, [0, 0.4], [0.65, 0]);
  const fistY = useTransform(scrollYProgress, [0, 0.4], [225, 625]);
  const fistTransform = useTransform(fistY, (y) => `translate(-25px, ${y}px)`);

  return (
    <section className="relative min-h-screen bg-sindicato-bordeaux overflow-hidden">
      {/* Radial gradient overlay for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.06)_0%,_transparent_70%)] z-[1]" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[6fr_4fr] min-h-screen">
        {/* Left column — text */}
        <div className="flex flex-col justify-center px-4 sm:px-6 lg:px-12 xl:px-16 py-20 -mt-10 sm:-mt-14">
          <div className="mb-4 sm:mb-6">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-sindicato-warm-white/30 text-xs sm:text-sm font-bold tracking-[0.3em] uppercase font-[family-name:var(--font-jetbrains)]"
            >
              Sindicato Case #001
            </motion.span>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <span className="text-6xl sm:text-7xl md:text-8xl lg:text-[8rem] xl:text-[9rem] font-black text-sindicato-warm-white uppercase leading-[0.85] font-[family-name:var(--font-barlow)] tracking-wide block">
              Wage Theft
            </span>
            <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-sindicato-warm-white/90 uppercase leading-[1.1] font-[family-name:var(--font-barlow)] tracking-wider mt-2 sm:mt-3 block">
              Is Not a Mistake. <span className="text-sindicato-warm-white text-outline">It&apos;s a Policy.</span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="text-base sm:text-lg md:text-xl text-sindicato-warm-white/65 mt-6 sm:mt-8 leading-relaxed text-center"
          >
            One worker was exploited. One case became a platform.<br />
            Dozens of voices are about to become impossible to ignore.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-8 sm:mt-10"
          >
            <Link
              href="/file"
              className="bg-sindicato-charcoal text-sindicato-warm-white px-10 sm:px-12 py-3.5 sm:py-4 text-base sm:text-lg font-bold uppercase tracking-wider hover:bg-sindicato-charcoal/80 transition-all font-[family-name:var(--font-barlow)] shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              File a Report
            </Link>
            <Link
              href="#feed"
              className="text-sindicato-warm-white/65 hover:text-sindicato-warm-white transition-colors text-base sm:text-lg uppercase tracking-wider font-[family-name:var(--font-barlow)] font-bold"
            >
              See the Record &rarr;
            </Link>
          </motion.div>
        </div>

        {/* Right column — hand image */}
        <div className="hidden lg:flex items-end justify-center overflow-visible relative pb-12">
          <motion.div
            className="w-[129%] h-[116%] -ml-[15%] pointer-events-none select-none"
            style={{
              transform: fistTransform,
              backgroundImage: 'linear-gradient(#6B0F1A, #6B0F1A), url(/images/handfinal.png)',
              backgroundBlendMode: 'multiply, normal',
              backgroundSize: 'cover, contain',
              backgroundPosition: 'center, bottom',
              backgroundRepeat: 'no-repeat, no-repeat',
              opacity: fistOpacity,
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 3%, black 100%), linear-gradient(to right, transparent 0%, black 20%, black 100%)',
              maskComposite: 'intersect',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 3%, black 100%), linear-gradient(to right, transparent 0%, black 20%, black 100%)',
              WebkitMaskComposite: 'source-in',
            }}
          />
        </div>
      </div>

      {/* Bottom stats bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute bottom-8 sm:bottom-10 left-0 right-0 z-10 text-center"
      >
        <p className="text-sindicato-warm-white/45 text-xs sm:text-sm font-[family-name:var(--font-jetbrains)] tracking-widest">
          #{String(caseCount).padStart(3, "0")} CASES FILED &middot; {companyCount}{" "}COMPANIES EXPOSED &middot; ALL WORKER-REPORTED
        </p>
      </motion.div>
    </section>
  );
}
