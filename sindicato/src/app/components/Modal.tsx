"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CaseForm from "./CaseForm";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Modal({ isOpen, onClose }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 sm:inset-8 md:inset-16 lg:inset-24 bg-sindicato-black border border-sindicato-cream/20 z-50 overflow-hidden flex flex-col torn-edge"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-sindicato-cream/10">
              <h2 className="text-2xl sm:text-3xl font-bold text-sindicato-cream">
                Relate Your Case
              </h2>
              <button
                onClick={onClose}
                className="text-sindicato-cream/60 hover:text-sindicato-cream transition-colors text-3xl"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto p-6">
              <CaseForm onSuccess={onClose} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
