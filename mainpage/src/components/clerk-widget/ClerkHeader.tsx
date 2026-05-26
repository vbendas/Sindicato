"use client";

import { ArrowLeft, X, Minus, Maximize2 } from "lucide-react";
import { useClerkWidget, type ClerkMode } from "./ClerkWidgetProvider";
import { cn } from "@/lib/utils";

const MODE_TITLES: Record<ClerkMode, string> = {
  home: "Sindicato Clerk",
  "kb-chat": "Ask a Question",
  "query-chat": "Query Data",
  contact: "Contact Sindicato",
};

type ClerkHeaderProps = {
  onExpand?: () => void;
};

export function ClerkHeader({ onExpand }: ClerkHeaderProps) {
  const { activeMode, setActiveMode, closeWidget } = useClerkWidget();

  const showBack = activeMode !== "home";

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-sindicato-smoked-charcoal shrink-0">
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
          {MODE_TITLES[activeMode]}
        </h2>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {activeMode === "query-chat" && onExpand && (
          <button
            onClick={onExpand}
            className="size-7 rounded-full flex items-center justify-center text-sindicato-warm-white/40 hover:text-sindicato-warm-white hover:bg-white/10 transition-colors"
            title="Open in full page"
          >
            <Maximize2 size={14} />
          </button>
        )}
        <button
          onClick={closeWidget}
          className="size-7 rounded-full flex items-center justify-center text-sindicato-warm-white/40 hover:text-sindicato-warm-white hover:bg-white/10 transition-colors"
          title="Minimize"
        >
          <Minus size={14} />
        </button>
        <button
          onClick={closeWidget}
          className="size-7 rounded-full flex items-center justify-center text-sindicato-warm-white/40 hover:text-sindicato-warm-white hover:bg-white/10 transition-colors"
          title="Close"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
