"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { useClerkWidget } from "./ClerkWidgetProvider";
import { cn } from "@/lib/utils";

export function ClerkBubble() {
  const { isOpen, toggleWidget, showProactive, dismissProactive, openWidget } =
    useClerkWidget();

  return (
    <>
      <AnimatePresence>
        {showProactive && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed bottom-24 left-6 z-[70] max-w-[280px]"
          >
            <div className="relative bg-sindicato-smoked-charcoal border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 shadow-xl">
              <button
                onClick={dismissProactive}
                className="absolute -top-2 -right-2 size-5 rounded-full bg-sindicato-charcoal border border-white/20 flex items-center justify-center text-white/50 hover:text-white transition-colors"
              >
                <X size={10} />
              </button>
              <p className="text-sm text-sindicato-warm-white/90 leading-snug">
                Hi! I'm the Sindicato Clerk. Ask me anything or explore our data.
              </p>
              <button
                onClick={openWidget}
                className="mt-2 text-xs text-sindicato-warm-white/50 hover:text-sindicato-warm-white transition-colors"
              >
                Open chat
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={toggleWidget}
        className={cn(
          "fixed bottom-6 left-6 z-[70] size-14 rounded-full",
          "bg-sindicato-bordeaux text-sindicato-warm-white",
          "shadow-lg shadow-black/20",
          "flex items-center justify-center",
          "hover:shadow-xl hover:shadow-black/30",
          "focus:outline-none focus-visible:ring-3 focus-visible:ring-sindicato-bordeaux/50"
        )}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={22} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle size={22} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
