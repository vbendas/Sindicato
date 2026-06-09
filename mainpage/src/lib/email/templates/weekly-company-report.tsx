import { Text, Button } from "@react-email/components";
import type { TagSeverity } from "@/lib/ai/tag-taxonomy";
import EmailLayout from "../components/EmailLayout";
import DetailCard, { DetailRow } from "../components/DetailCard";
import TagPill from "../components/TagPill";

const ENGAGEMENT_LABELS: Record<string, string> = {
  ignoring: "No response to cases",
  slow_response: "Slow response pattern",
  retaliation: "Retaliation pattern detected",
  engaged: "Actively engaging with cases",
  no_response: "No response yet",
};

interface WeeklyCompanyReportProps {
  companyName: string;
  totalCases: number;
  newThisWeek: number;
  totalUnpaid: string;
  currency: string;
  unresolvedCount: number;
  resolvedCount: number;
  oldestCaseDays: number;
  keyInsight: string | null;
  engagementPattern: string | null;
  companyTags: Array<{ tagName: string; severity: TagSeverity; count: number }>;
  reportUrl: string;
}

export default function WeeklyCompanyReport({
  companyName,
  totalCases,
  newThisWeek,
  totalUnpaid,
  currency,
  unresolvedCount,
  resolvedCount,
  oldestCaseDays,
  keyInsight,
  engagementPattern,
  companyTags,
  reportUrl,
}: WeeklyCompanyReportProps) {
  const positiveTags = companyTags.filter((t) => t.severity === "green");
  const concernTags = companyTags.filter((t) => t.severity !== "green");

  return (
    <EmailLayout preview={`Weekly case report — ${companyName}`}>
      <Text style={{ fontSize: 16, color: "#333" }}>
        Dear {companyName} team,
      </Text>
      <Text style={{ fontSize: 16, color: "#333" }}>
        Here is your weekly summary of case activity on the Sindicato
        platform.
      </Text>

      <DetailCard>
        <DetailRow label="Total Cases">{totalCases}</DetailRow>
        <DetailRow label="New This Week">{newThisWeek}</DetailRow>
        <DetailRow label="Unresolved">{unresolvedCount}</DetailRow>
        <DetailRow label="Resolved">{resolvedCount}</DetailRow>
        <DetailRow label="Total Owed">
          {currency} {totalUnpaid}
        </DetailRow>
        <DetailRow label="Oldest Open Case">
          {oldestCaseDays} days
        </DetailRow>
      </DetailCard>

      {engagementPattern && ENGAGEMENT_LABELS[engagementPattern] && (
        <Text style={{ fontSize: 14, color: "#666", margin: "0 0 16px" }}>
          <strong>Engagement:</strong>{" "}
          {ENGAGEMENT_LABELS[engagementPattern]}
        </Text>
      )}

      {keyInsight && (
        <div
          style={{
            margin: "0 0 20px",
            padding: "12px 16px",
            backgroundColor: "#f0fdf4",
            borderLeft: "3px solid #22c55e",
            borderRadius: 4,
          }}
        >
          <Text
            style={{ fontSize: 14, color: "#166534", margin: 0, fontStyle: "italic" }}
          >
            {keyInsight}
          </Text>
        </div>
      )}

      {concernTags.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 13, color: "#666", margin: "0 0 8px" }}>
            <strong>Detected patterns across cases:</strong>
          </Text>
          <div style={{ lineHeight: 2 }}>
            {concernTags.map((tag) => (
              <TagPill
                key={tag.tagName}
                name={tag.tagName}
                severity={tag.severity}
                count={tag.count}
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
                count={tag.count}
              />
            ))}
          </div>
        </div>
      )}

      <Text style={{ fontSize: 16, color: "#333" }}>
        You can view the full report and take action on outstanding cases from
        your dashboard.
      </Text>

      <Button
        href={reportUrl}
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
        View Full Report
      </Button>
    </EmailLayout>
  );
}
