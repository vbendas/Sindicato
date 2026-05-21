"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface HeaderProps {
  onRelateCase?: () => void;
  scrolledBg?: string;
  clerkBg?: string;
}

export default function Header({ onRelateCase, scrolledBg = "bg-sindicato-bordeaux/70 backdrop-blur-md border-white/10", clerkBg = "bg-sindicato-charcoal" }: HeaderProps) {
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
          ? scrolledBg
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 relative">
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link
              href="/"
              className="text-white/70 hover:text-white transition-colors uppercase tracking-wider text-xs lg:text-sm font-[family-name:var(--font-barlow)] font-bold relative after:absolute after:bottom-[-2px] after:left-0 after:h-[1px] after:w-0 after:bg-white/50 after:transition-all hover:after:w-full"
            >
              Home
            </Link>
            <Link
              href="/manifesto"
              className="text-white/70 hover:text-white transition-colors uppercase tracking-wider text-xs lg:text-sm font-[family-name:var(--font-barlow)] font-bold relative after:absolute after:bottom-[-2px] after:left-0 after:h-[1px] after:w-0 after:bg-white/50 after:transition-all hover:after:w-full"
            >
              Manifesto
            </Link>
            <Link
              href="/about"
              className="text-white/70 hover:text-white transition-colors uppercase tracking-wider text-xs lg:text-sm font-[family-name:var(--font-barlow)] font-bold relative after:absolute after:bottom-[-2px] after:left-0 after:h-[1px] after:w-0 after:bg-white/50 after:transition-all hover:after:w-full"
            >
              About Us
            </Link>
          </nav>

          <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 shrink-0">
            <span className="text-lg sm:text-xl lg:text-2xl font-bold tracking-widest text-white uppercase font-[family-name:var(--font-labor-union)]">
              SINDICATO
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <button
              onClick={onRelateCase}
              className="text-white/70 hover:text-white transition-colors uppercase tracking-wider text-xs lg:text-sm font-[family-name:var(--font-barlow)] font-bold relative after:absolute after:bottom-[-2px] after:left-0 after:h-[1px] after:w-0 after:bg-white/50 after:transition-all hover:after:w-full"
            >
              Report a Case
            </button>
            <Link
              href="/cases"
              className="text-white/70 hover:text-white transition-colors uppercase tracking-wider text-xs lg:text-sm font-[family-name:var(--font-barlow)] font-bold relative after:absolute after:bottom-[-2px] after:left-0 after:h-[1px] after:w-0 after:bg-white/50 after:transition-all hover:after:w-full"
            >
              View Cases
            </Link>
            <button className={`${clerkBg} text-white px-4 lg:px-5 py-1.5 lg:py-2 text-xs lg:text-sm font-bold uppercase tracking-wider hover:opacity-80 transition-all font-[family-name:var(--font-barlow)] shadow-sm`}>
              Clerk
            </button>
          </div>

          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={onRelateCase}
              className="bg-sindicato-charcoal text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider font-[family-name:var(--font-barlow)]"
            >
              Report
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
