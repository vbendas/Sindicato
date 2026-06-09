import { Text } from "@react-email/components";
import EmailLayout from "../components/EmailLayout";
import DetailCard, { DetailRow } from "../components/DetailCard";

const CATEGORY_LABELS: Record<string, string> = {
  general: "General Inquiry",
  legal: "Legal",
  press: "Press / Media",
  partnership: "Partnership",
  bug: "Report a Bug",
  other: "Other",
};

interface ContactNotificationProps {
  name: string;
  email: string;
  category: string;
  caseRef: string;
  message: string;
  hasAttachment: boolean;
  submittedAt: string;
}

export default function ContactNotification({
  name,
  email,
  category,
  caseRef,
  message,
  hasAttachment,
  submittedAt,
}: ContactNotificationProps) {
  return (
    <EmailLayout preview={`New contact message from ${name}`}>
      <Text style={{ fontSize: 14, color: "#666" }}>
        Received: {submittedAt}
      </Text>

      <DetailCard>
        <DetailRow label="From">
          {name} ({email})
        </DetailRow>
        <DetailRow label="Category">
          {CATEGORY_LABELS[category] || category}
        </DetailRow>
        {caseRef && <DetailRow label="Case Reference">{caseRef}</DetailRow>}
        {hasAttachment && (
          <DetailRow label="Attachment">Yes (see email attachment)</DetailRow>
        )}
      </DetailCard>

      <DetailCard>
        <Text
          style={{
            margin: 0,
            fontSize: 14,
            color: "#333",
            whiteSpace: "pre-wrap",
          }}
        >
          {message}
        </Text>
      </DetailCard>
    </EmailLayout>
  );
}
