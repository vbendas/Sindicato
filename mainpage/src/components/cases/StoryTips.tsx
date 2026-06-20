"use client";

import { useState, useCallback } from "react";

interface ChecklistItem {
  name: string;
  passed: boolean;
  note: string;
}

interface StoryTipsProps {
  displayName: string;
  country: string;
  project: string;
  dateRange: string;
  amountOwed: string;
  currency: string;
  story: string;
}

export function StoryTips({ displayName, country, project, dateRange, amountOwed, currency, story }: StoryTipsProps) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [error, setError] = useState(false);

  const analyze = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/ai/case-checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          country,
          project,
          dateRange,
          amountOwed,
          currency,
          contactAttempts: 0,
          story,
        }),
      });
      const data = await res.json();
      if (data.ok && data.data) {
        setItems(data.data.items || []);
        setSummary(data.data.summary || "");
        setAnalyzed(true);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    }
    setLoading(false);
  }, [displayName, country, project, dateRange, amountOwed, currency, story]);

  if (!analyzed && !loading) {
    return (
      <button
        type="button"
        onClick={analyze}
        className="mt-3 w-full border border-white/10 bg-white/5 px-4 py-2.5 text-left text-xs text-sindicato-warm-white/60 hover:border-white/20 hover:text-sindicato-warm-white/80 transition-colors"
      >
        <span className="font-medium uppercase tracking-wider">Get tips to strengthen your story</span>
        <span className="block mt-1 text-sindicato-warm-white/40">
          AI will check for missing details that could help your case
        </span>
      </button>
    );
  }

  if (loading) {
    return (
      <div className="mt-3 border border-white/10 bg-white/5 px-4 py-3">
        <div className="flex items-center gap-2 text-sindicato-warm-white/60 text-xs">
          <div className="w-3 h-3 border-2 border-white/30 border-t-white/60 rounded-full animate-spin" />
          Analyzing your story...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-3 border border-white/10 bg-white/5 px-4 py-3">
        <p className="text-xs text-sindicato-warm-white/50">Could not analyze your story.</p>
        <button type="button" onClick={analyze} className="mt-1 text-xs text-sindicato-warm-white/60 underline hover:text-sindicato-warm-white/80">
          Try again
        </button>
      </div>
    );
  }

  const passed = items.filter((i) => i.passed).length;
  const total = items.length;

  return (
    <div className="mt-3 border border-white/10 bg-white/5 px-4 py-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-sindicato-warm-white/70">
          Story tips
        </span>
        <span className={`text-xs font-medium ${passed === total ? "text-green-400" : "text-sindicato-warm-white/50"}`}>
          {passed}/{total} complete
        </span>
      </div>

      <div className="space-y-1.5">
        {items.map((item) => (
          <div key={item.name} className="flex items-start gap-2 text-xs">
            <span className={item.passed ? "text-green-400 flex-shrink-0" : "text-sindicato-warm-white/40 flex-shrink-0"}>
              {item.passed ? "✓" : "•"}
            </span>
            <div>
              <span className={item.passed ? "text-sindicato-warm-white/50" : "text-sindicato-warm-white/80"}>
                {item.name}
              </span>
              {!item.passed && item.note && (
                <span className="text-sindicato-warm-white/40 ml-1">— {item.note}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {summary && (
        <p className="text-xs text-sindicato-warm-white/50 italic border-t border-white/10 pt-2">
          {summary}
        </p>
      )}

      <button
        type="button"
        onClick={analyze}
        className="text-xs text-sindicato-warm-white/40 hover:text-sindicato-warm-white/60 underline"
      >
        Re-analyze
      </button>
    </div>
  );
}
