import { Text, Button } from "@react-email/components";
import EmailLayout from "../components/EmailLayout";
import DetailCard, { DetailRow } from "../components/DetailCard";

interface NewCaseNotificationProps {
  companyName: string;
  workerName: string;
  country: string;
  amountOwed: string;
  currency: string;
  caseUrl: string;
}

export default function NewCaseNotification({
  companyName,
  workerName,
  country,
  amountOwed,
  currency,
  caseUrl,
}: NewCaseNotificationProps) {
  return (
    <EmailLayout preview={`New case reported against ${companyName}`}>
      <Text style={{ fontSize: 16, color: "#333" }}>
        Dear {companyName} team,
      </Text>
      <Text style={{ fontSize: 16, color: "#333" }}>
        A new case has been reported against your company through the
        Sindicato platform. Below is a summary of the claim:
      </Text>

      <DetailCard>
        <DetailRow label="Worker">{workerName}</DetailRow>
        <DetailRow label="Country">{country}</DetailRow>
        <DetailRow label="Amount Owed">
          {currency} {amountOwed}
        </DetailRow>
      </DetailCard>

      <Text style={{ fontSize: 16, color: "#333" }}>
        We encourage you to review this case promptly and engage in the
        resolution process. Timely resolution benefits all parties involved.
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
        View Case on Sindicato
      </Button>
    </EmailLayout>
  );
}
