"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useClerkWidget } from "./ClerkWidgetProvider";
import { ClerkHeader } from "./ClerkHeader";
import { ClerkHome } from "./ClerkHome";
import { ClerkKBChat } from "./ClerkKBChat";
import { ClerkQueryChat } from "./ClerkQueryChat";
import { ClerkContactForm } from "./ClerkContactForm";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function ClerkPanel() {
  const { isOpen, activeMode } = useClerkWidget();
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useLocale();

  if (pathname.endsWith("/clerk") || pathname.includes("/presentation-workers")) return null;

  const handleExpand = () => {
    router.push(`/${locale}/clerk`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[65] bg-black/20 md:hidden"
            onClick={() => {}}
          />

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={cn(
              "fixed z-[70] flex flex-col overflow-hidden",
              "bg-sindicato-charcoal/95 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50",
              "bottom-24 right-6 w-[380px] h-[560px] rounded-3xl",
              "max-md:inset-0 max-md:w-auto max-md:h-auto max-md:bottom-0 max-md:right-0 max-md:rounded-none max-md:border-0"
            )}
          >
            <div className="absolute inset-0 pointer-events-none grain-overlay opacity-30 z-10" />
            <ClerkHeader onExpand={handleExpand} />

            <div className="flex-1 overflow-hidden relative">
              <AnimatePresence mode="wait">
                {activeMode === "home" && (
                  <motion.div
                    key="home"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0"
                  >
                    <ClerkHome />
                  </motion.div>
                )}
                {activeMode === "kb-chat" && (
                  <motion.div
                    key="kb-chat"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0"
                  >
                    <ClerkKBChat />
                  </motion.div>
                )}
                {activeMode === "query-chat" && (
                  <motion.div
                    key="query-chat"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0"
                  >
                    <ClerkQueryChat />
                  </motion.div>
                )}
                {activeMode === "contact" && (
                  <motion.div
                    key="contact"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0"
                  >
                    <ClerkContactForm />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
