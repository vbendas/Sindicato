import { Text, Button } from "@react-email/components";
import EmailLayout from "../components/EmailLayout";
import DetailCard, { DetailRow } from "../components/DetailCard";

interface ResolutionFollowUpProps {
  companyName: string;
  caseCount: number;
  totalUnpaid: string;
  currency: string;
  dashboardUrl: string;
}

export default function ResolutionFollowUp({
  companyName,
  caseCount,
  totalUnpaid,
  currency,
  dashboardUrl,
}: ResolutionFollowUpProps) {
  return (
    <EmailLayout preview={`Outstanding cases reminder — ${companyName}`}>
      <Text style={{ fontSize: 16, color: "#333" }}>
        Dear {companyName} team,
      </Text>
      <Text style={{ fontSize: 16, color: "#333" }}>
        This is a follow-up regarding open cases filed against your company
        through Sindicato. These cases have been active for over 30 days
        without resolution.
      </Text>

      <DetailCard>
        <DetailRow label="Open Cases">{caseCount}</DetailRow>
        <DetailRow label="Total Unpaid Amount">
          {currency} {totalUnpaid}
        </DetailRow>
      </DetailCard>

      <Text style={{ fontSize: 16, color: "#333" }}>
        Resolving these cases promptly demonstrates good faith and helps
        avoid escalation. We are here to facilitate a fair resolution for all
        parties.
      </Text>

      <Button
        href={dashboardUrl}
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
        Start Resolution Process
      </Button>
    </EmailLayout>
  );
}
