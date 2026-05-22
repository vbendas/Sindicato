"use client";

import { useRef, useEffect } from "react";
import { PromptSuggestion } from "@/components/ui/prompt-suggestion";
import type { SuggestionGroup, SuggestionItem } from "./suggestions";

interface SuggestionPanelProps {
  groups: SuggestionGroup[];
  searchQuery: string;
  onSelect: (suggestion: SuggestionItem) => void;
  onClose: () => void;
}

export default function SuggestionPanel({ groups, searchQuery, onSelect, onClose }: SuggestionPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      className="absolute left-0 right-0 bottom-full mb-1 z-50 bg-sindicato-smoked-charcoal border border-white/10 shadow-xl rounded-[0.75rem] overflow-hidden"
    >
      <div className="max-h-80 overflow-y-auto py-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:!bg-sindicato-moss-green [&::-webkit-scrollbar-track]:bg-transparent" style={{ scrollbarColor: '#4a5c3a transparent', scrollbarWidth: 'thin' }}>
        {groups.map((group) => (
          <div key={group.name}>
            <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-sindicato-cream/40 font-medium">
              {group.name}
            </div>
            {group.suggestions.map((s) =>
              searchQuery.trim() ? (
                <PromptSuggestion
                  key={s.id}
                  highlight={searchQuery}
                  onClick={() => onSelect(s)}
                  className="text-sindicato-cream/70 hover:text-sindicato-cream hover:bg-white/10"
                >
                  {s.label}
                </PromptSuggestion>
              ) : (
                <button
                  key={s.id}
                  onClick={() => onSelect(s)}
                  className="w-full text-left px-3 py-2 text-sm text-sindicato-cream/70 hover:text-sindicato-cream hover:bg-white/10 transition-colors cursor-pointer"
                >
                  {s.label}
                </button>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
