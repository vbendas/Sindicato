"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ResolutionFeedbackProps {
  caseId: string;
  existingFeedback?: string | null;
  onSaved?: (feedback: string) => void;
}

export function ResolutionFeedback({ caseId, existingFeedback, onSaved }: ResolutionFeedbackProps) {
  const [feedback, setFeedback] = useState(existingFeedback ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!feedback.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/cases/${caseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolutionFeedback: feedback }),
      });
      const json = await res.json();
      if (res.ok) {
        setSaved(true);
        onSaved?.(feedback);
      } else {
        setError(json.error || "Failed to save feedback");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 p-4 mt-4">
      <p className="text-sindicato-warm-white/50 text-xs uppercase tracking-wider mb-2 font-[family-name:var(--font-jetbrains)]">
        Resolution Feedback
      </p>
      <p className="text-sindicato-warm-white/40 text-xs mb-3">
        Share your experience with how this case was resolved to help other workers.
      </p>
      <Textarea
        value={feedback}
        onChange={(e) => { setFeedback(e.target.value); setSaved(false); }}
        placeholder="Describe how the resolution went..."
        className="bg-white/5 border-white/10 text-sindicato-warm-white text-sm min-h-[100px] resize-y mb-3"
      />
      {error && <p className="text-amber-400/70 text-[11px] mb-2">{error}</p>}
      {saved && <p className="text-green-400/70 text-[11px] mb-2">Feedback saved.</p>}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving || !feedback.trim()}
          className="bg-sindicato-bordeaux hover:bg-sindicato-bordeaux/80 text-sindicato-warm-white text-xs"
        >
          {saving ? "Saving..." : "Save Feedback"}
        </Button>
      </div>
    </div>
  );
}
