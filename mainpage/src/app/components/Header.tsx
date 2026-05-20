"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface HeaderProps {
  onRelateCase?: () => void;
}

export default function Header({ onRelateCase }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? "bg-sindicato-bordeaux/70 backdrop-blur-md border-white/10"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-lg sm:text-xl lg:text-2xl font-bold tracking-widest text-white uppercase font-[family-name:var(--font-labor-union)]">
              SINDICATO
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link
              href="/manifesto"
              className="text-white/70 hover:text-white transition-colors uppercase tracking-wider text-xs lg:text-sm font-[family-name:var(--font-barlow)] font-bold relative after:absolute after:bottom-[-2px] after:left-0 after:h-[1px] after:w-0 after:bg-white/50 after:transition-all hover:after:w-full"
            >
              Manifesto
            </Link>
            <Link
              href="#"
              className="text-white/70 hover:text-white transition-colors uppercase tracking-wider text-xs lg:text-sm font-[family-name:var(--font-barlow)] font-bold relative after:absolute after:bottom-[-2px] after:left-0 after:h-[1px] after:w-0 after:bg-white/50 after:transition-all hover:after:w-full"
            >
              About
            </Link>
            <button
              onClick={onRelateCase}
              className="text-white/70 hover:text-white transition-colors uppercase tracking-wider text-xs lg:text-sm font-[family-name:var(--font-barlow)] font-bold"
            >
              Report a Case
            </button>
            <button className="text-white/70 hover:text-white transition-colors uppercase tracking-wider text-xs lg:text-sm font-[family-name:var(--font-barlow)] font-bold">
              Sign In
            </button>
            <Link
              href="/cases"
              className="bg-sindicato-warm-white text-sindicato-bordeaux px-4 lg:px-5 py-1.5 lg:py-2 text-xs lg:text-sm font-bold uppercase tracking-wider hover:bg-sindicato-warm-white/90 transition-all font-[family-name:var(--font-barlow)] shadow-sm"
            >
              View Cases
            </Link>
          </nav>

          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={onRelateCase}
              className="bg-sindicato-warm-white text-sindicato-bordeaux px-3 py-1.5 text-xs font-bold uppercase tracking-wider font-[family-name:var(--font-barlow)]"
            >
              Report
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
