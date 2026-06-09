import { Text, Button } from "@react-email/components";
import type { TagSeverity } from "@/lib/ai/tag-taxonomy";
import EmailLayout from "../components/EmailLayout";
import DetailCard, { DetailRow } from "../components/DetailCard";
import TagPill from "../components/TagPill";

interface PerCaseFollowUpProps {
  companyName: string;
  caseType: string;
  displayName: string;
  amountOwed: string;
  currency: string;
  storyPreview: string;
  daysSinceFiled: number;
  caseUrl: string;
  showAmount: boolean;
  tags: Array<{ tagName: string; severity: TagSeverity }>;
}

export default function PerCaseFollowUp({
  companyName,
  caseType,
  displayName,
  amountOwed,
  currency,
  storyPreview,
  daysSinceFiled,
  caseUrl,
  showAmount,
  tags,
}: PerCaseFollowUpProps) {
  const positiveTags = tags.filter((t) => t.severity === "green");
  const concernTags = tags.filter((t) => t.severity !== "green");

  return (
    <EmailLayout
      preview={`Open case follow-up: ${caseType} — ${companyName}`}
    >
      <Text style={{ fontSize: 16, color: "#333" }}>
        Dear {companyName} team,
      </Text>
      <Text style={{ fontSize: 16, color: "#333" }}>
        This is a follow-up regarding an open case filed against your company
        through Sindicato. The case has been active for {daysSinceFiled} days
        without resolution.
      </Text>

      <DetailCard>
        <DetailRow label="Case Type">{caseType}</DetailRow>
        <DetailRow label="Worker">{displayName}</DetailRow>
        {showAmount && (
          <DetailRow label="Amount Owed">
            {currency} {amountOwed}
          </DetailRow>
        )}
        <DetailRow label="Days Open">{daysSinceFiled}</DetailRow>
        {storyPreview && (
          <Text
            style={{
              margin: "12px 0 4px",
              fontSize: 14,
              color: "#555",
              fontStyle: "italic",
              borderLeft: "3px solid #e5e5e5",
              paddingLeft: 12,
            }}
          >
            &ldquo;{storyPreview}&rdquo;
          </Text>
        )}
      </DetailCard>

      {concernTags.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 13, color: "#666", margin: "0 0 8px" }}>
            <strong>Detected patterns:</strong>
          </Text>
          <div style={{ lineHeight: 2 }}>
            {concernTags.map((tag) => (
              <TagPill
                key={tag.tagName}
                name={tag.tagName}
                severity={tag.severity}
              />
            ))}
          </div>
        </div>
      )}

      {positiveTags.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 13, color: "#666", margin: "0 0 8px" }}>
            <strong>Positive indicators:</strong>
          </Text>
          <div style={{ lineHeight: 2 }}>
            {positiveTags.map((tag) => (
              <TagPill
                key={tag.tagName}
                name={tag.tagName}
                severity={tag.severity}
              />
            ))}
          </div>
        </div>
      )}

      <Text style={{ fontSize: 16, color: "#333" }}>
        Resolving this case promptly demonstrates good faith and helps avoid
        escalation. We are here to facilitate a fair resolution for all parties.
      </Text>

      <Button
        href={caseUrl}
        style={{
          backgroundColor: "#c53030",
          color: "#fff",
          padding: "12px 24px",
          borderRadius: 6,
          textDecoration: "none",
          display: "inline-block",
          fontSize: 16,
        }}
      >
        View Case Details
      </Button>
    </EmailLayout>
  );
}
