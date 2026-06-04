"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useClerkWidget } from "./ClerkWidgetProvider";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

export function ClerkBubble() {
  const { isOpen, toggleWidget, showProactive, dismissProactive, openWidget } =
    useClerkWidget();
  const pathname = usePathname();
  const t = useT();

  if (pathname === "/clerk") return null;

  return (
    <>
      <AnimatePresence>
        {showProactive && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed bottom-24 right-6 z-[70] max-w-[280px]"
          >
            <div className="relative bg-sindicato-smoked-charcoal/90 backdrop-blur-2xl border border-white/10 rounded-3xl px-4 py-3 shadow-2xl shadow-black/30">
              <button
                onClick={dismissProactive}
                className="absolute -top-2 -right-2 size-5 rounded-full bg-sindicato-charcoal border border-white/20 flex items-center justify-center text-white/50 hover:text-white transition-colors"
              >
                <X size={10} />
              </button>
              <p className="text-sm text-sindicato-warm-white/90 leading-snug">
                {t("clerk.bubble.proactive", { name: t("clerk.name") })}
              </p>
              <button
                onClick={openWidget}
                className="mt-2 text-xs text-sindicato-warm-white/50 hover:text-sindicato-warm-white transition-colors"
              >
                {t("clerk.bubble.openChat")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={toggleWidget}
        className={cn(
          "fixed bottom-6 right-6 z-[70] size-16 rounded-full",
          "bg-sindicato-bordeaux border-4 border-black",
          "shadow-xl shadow-black/30",
          "flex items-center justify-center overflow-hidden",
          "hover:shadow-2xl hover:shadow-bordeaux/30",
          "focus:outline-none focus-visible:ring-3 focus-visible:ring-sindicato-bordeaux/50",
          "transition-shadow duration-200"
        )}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? t("common.close") : t("clerk.bubble.openChat")}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center text-sindicato-warm-white"
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative size-full overflow-hidden"
            >
              <div className="absolute top-0 -left-3.5 -right-4.5 h-[calc(100%+32px)]" style={{ marginLeft: '-1px' }}>
                <Image
                  src="/clerk.png"
                  alt={t("clerk.name")}
                  fill
                  className="object-contain"
                  sizes="64px"
                />
              </div>
              <div className="absolute inset-0 pointer-events-none grain-overlay opacity-40" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
