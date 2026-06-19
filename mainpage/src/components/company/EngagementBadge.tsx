"use client";

const BADGES: Record<string, { label: string; cls: string }> = {
  ignoring: { label: "Ignoring Reports", cls: "bg-red-500/10 border-red-500/30 text-red-400" },
  engaged: { label: "Engaged", cls: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400" },
  resolved: { label: "Resolving Cases", cls: "bg-green-500/10 border-green-500/30 text-green-400" },
  responsive: { label: "Responsive", cls: "bg-blue-500/10 border-blue-500/30 text-blue-400" },
};

const DEFAULT = { label: "New", cls: "bg-white/10 border-white/20 text-white/60" };

export function EngagementBadge({ pattern }: { pattern?: string | null }) {
  const s = pattern && BADGES[pattern] ? BADGES[pattern] : DEFAULT;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${s.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
      {s.label}
    </span>
  );
}
