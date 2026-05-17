"use client";

import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative py-8 sm:py-12 lg:py-16 bg-transparent">
      <div className="absolute inset-0 grain-overlay" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <Image
              src="/images/logo.png"
              alt="Sindicato"
              width={32}
              height={32}
              className="invert w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10"
            />
            <span className="text-base sm:text-lg lg:text-xl font-bold tracking-wider text-sindicato-cream font-button">
              SINDICATO
            </span>
          </div>

          <div className="text-center md:text-right">
            <p className="text-sindicato-cream/60 text-xs sm:text-sm mb-1 sm:mb-2">
              &copy; 2026 Sindicato. All rights reserved.
            </p>
            <p className="text-sindicato-cream/40 text-[10px] sm:text-xs">
              Workers own their claims. We provide the platform, not the verdict.
            </p>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-sindicato-cream/10 text-center">
          <p className="text-sindicato-cream/40 text-[10px] sm:text-xs max-w-2xl mx-auto leading-relaxed">
            Disclaimer: All cases are self-reported by individual workers. Sindicato is a reporting
            and aggregation platform, not a legal entity making these claims. We do not verify,
            endorse, or assert individual claims.
          </p>
        </div>
      </div>
    </footer>
  );
}
