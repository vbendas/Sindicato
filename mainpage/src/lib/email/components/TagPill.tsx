import type { TagSeverity } from "@/lib/ai/tag-taxonomy";

const SEVERITY_COLORS: Record<
  TagSeverity,
  { bg: string; text: string; border: string }
> = {
  green: { bg: "#ecfdf5", text: "#059669", border: "#a7f3d0" },
  yellow: { bg: "#fffbeb", text: "#d97706", border: "#fde68a" },
  orange: { bg: "#fff7ed", text: "#ea580c", border: "#fed7aa" },
  red: { bg: "#fff1f2", text: "#e11d48", border: "#fecdd3" },
};

interface TagPillProps {
  name: string;
  severity: TagSeverity;
  count?: number;
}

export default function TagPill({ name, severity, count }: TagPillProps) {
  const colors = SEVERITY_COLORS[severity] || SEVERITY_COLORS.yellow;

  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase" as const,
        letterSpacing: "0.05em",
        padding: "3px 8px",
        margin: "2px 4px 2px 0",
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        borderRadius: 4,
        lineHeight: "1.4",
      }}
    >
      {name}
      {count !== undefined && count > 1 && (
        <span style={{ fontWeight: 400, marginLeft: 4, opacity: 0.7 }}>
          ×{count}
        </span>
      )}
    </span>
  );
}
