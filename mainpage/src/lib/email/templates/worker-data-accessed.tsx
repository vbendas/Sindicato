import { Text, Button } from "@react-email/components";
import EmailLayout from "../components/EmailLayout";
import DetailCard, { DetailRow } from "../components/DetailCard";

interface WorkerDataAccessedProps {
  companyName: string;
  accessorRole: string;
  caseUrl: string;
  accessedAt: string;
}

export default function WorkerDataAccessed({
  companyName,
  accessorRole,
  caseUrl,
  accessedAt,
}: WorkerDataAccessedProps) {
  const date = new Date(accessedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <EmailLayout preview="Your case data was accessed">
      <Text style={{ fontSize: 16, color: "#333" }}>
        A representative of <strong>{companyName}</strong> ({accessorRole})
        accessed your case data on <strong>{date}</strong>.
      </Text>
      <Text style={{ fontSize: 16, color: "#333" }}>
        This access is part of the resolution process. Your identity and
        personal information remain private unless you choose to share them.
        Any form of retaliation violates our terms of service and your public
        case on Sindicato serves as timestamped evidence that can be used in
        legal proceedings.
      </Text>

      <DetailCard>
        <DetailRow label="Company">{companyName}</DetailRow>
        <DetailRow label="Accessed By">{accessorRole}</DetailRow>
        <DetailRow label="Date">{date}</DetailRow>
      </DetailCard>

      <Text style={{ fontSize: 16, color: "#333" }}>
        You can view your case status at any time:
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
        View Your Case
      </Button>

      <Text style={{ fontSize: 14, color: "#666", marginTop: 24 }}>
        If you did not expect this notification, please contact us immediately.
      </Text>
    </EmailLayout>
  );
}
