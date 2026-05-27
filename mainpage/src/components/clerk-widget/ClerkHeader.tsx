"use client";

import { ArrowLeft, X, Minus, Maximize2 } from "lucide-react";
import { useClerkWidget, type ClerkMode } from "./ClerkWidgetProvider";
import { useT } from "@/lib/i18n";

type ClerkHeaderProps = {
  onExpand?: () => void;
};

export function ClerkHeader({ onExpand }: ClerkHeaderProps) {
  const { activeMode, setActiveMode, closeWidget } = useClerkWidget();
  const t = useT();

  const showBack = activeMode !== "home";

  const modeTitles: Record<ClerkMode, string> = {
    home: t("clerk.header.titleHome"),
    "kb-chat": t("clerk.header.titleKb"),
    "query-chat": t("clerk.header.titleQuery"),
    contact: t("clerk.header.titleContact"),
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-sindicato-smoked-charcoal/80 backdrop-blur-xl shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        {showBack ? (
          <button
            onClick={() => setActiveMode("home")}
            className="size-7 rounded-full flex items-center justify-center text-sindicato-warm-white/60 hover:text-sindicato-warm-white hover:bg-white/10 transition-colors shrink-0"
          >
            <ArrowLeft size={16} />
          </button>
        ) : (
          <div className="size-7 rounded-full bg-sindicato-bordeaux flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-sindicato-warm-white font-[family-name:var(--font-barlow)]">
              S
            </span>
          </div>
        )}
        <h2 className="text-sm font-medium text-sindicato-warm-white truncate font-[family-name:var(--font-barlow)] tracking-wide">
          {modeTitles[activeMode]}
        </h2>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {activeMode === "query-chat" && onExpand && (
          <button
            onClick={onExpand}
            className="size-7 rounded-full flex items-center justify-center text-sindicato-warm-white/40 hover:text-sindicato-warm-white hover:bg-white/10 transition-colors"
            title={t("clerk.header.expand")}
          >
            <Maximize2 size={14} />
          </button>
        )}
        <button
          onClick={closeWidget}
          className="size-7 rounded-full flex items-center justify-center text-sindicato-warm-white/40 hover:text-sindicato-warm-white hover:bg-white/10 transition-colors"
          title={t("clerk.header.minimize")}
        >
          <Minus size={14} />
        </button>
        <button
          onClick={closeWidget}
          className="size-7 rounded-full flex items-center justify-center text-sindicato-warm-white/40 hover:text-sindicato-warm-white hover:bg-white/10 transition-colors"
          title={t("clerk.header.close")}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
