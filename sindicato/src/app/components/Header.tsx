"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderProps {
  onRelateCase: () => void;
}

export default function Header({ onRelateCase }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-sindicato-black/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="Sindicato"
              width={40}
              height={40}
              className="invert"
              priority
            />
            <span className="text-2xl font-bold tracking-wider text-sindicato-cream">
              SINDICATO
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("workers")}
              className="text-sindicato-cream/80 hover:text-sindicato-cream transition-colors uppercase tracking-wide text-sm"
            >
              Workers
            </button>
            <button
              onClick={() => scrollToSection("lawyers")}
              className="text-sindicato-cream/80 hover:text-sindicato-cream transition-colors uppercase tracking-wide text-sm"
            >
              Lawyers
            </button>
            <button
              onClick={() => scrollToSection("companies")}
              className="text-sindicato-cream/80 hover:text-sindicato-cream transition-colors uppercase tracking-wide text-sm"
            >
              Companies
            </button>
            <button
              onClick={onRelateCase}
              className="bg-sindicato-red text-sindicato-cream px-6 py-2 font-bold uppercase tracking-wider hover:bg-sindicato-red/90 transition-colors torn-edge"
            >
              Relate a Case
            </button>
          </nav>

          {/* Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2"
            aria-label="Toggle menu"
          >
            <motion.span
              animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              className="block w-6 h-0.5 bg-sindicato-cream"
            />
            <motion.span
              animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
              className="block w-6 h-0.5 bg-sindicato-cream"
            />
            <motion.span
              animate={isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              className="block w-6 h-0.5 bg-sindicato-cream"
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-sindicato-black border-t border-sindicato-cream/10"
          >
            <div className="px-4 py-6 space-y-4">
              <button
                onClick={() => scrollToSection("workers")}
                className="block w-full text-left text-sindicato-cream/80 hover:text-sindicato-cream py-2 uppercase tracking-wide"
              >
                Workers
              </button>
              <button
                onClick={() => scrollToSection("lawyers")}
                className="block w-full text-left text-sindicato-cream/80 hover:text-sindicato-cream py-2 uppercase tracking-wide"
              >
                Lawyers
              </button>
              <button
                onClick={() => scrollToSection("companies")}
                className="block w-full text-left text-sindicato-cream/80 hover:text-sindicato-cream py-2 uppercase tracking-wide"
              >
                Companies
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onRelateCase();
                }}
                className="w-full bg-sindicato-red text-sindicato-cream px-6 py-3 font-bold uppercase tracking-wider torn-edge mt-4"
              >
                Relate a Case
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
