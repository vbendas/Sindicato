import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Heading,
  Hr,
} from "@react-email/components";

interface ContactNotificationProps {
  name: string;
  email: string;
  category: string;
  caseRef: string;
  message: string;
  hasAttachment: boolean;
  submittedAt: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  general: "General Inquiry",
  legal: "Legal",
  press: "Press / Media",
  partnership: "Partnership",
  bug: "Report a Bug",
  other: "Other",
};

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
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#faf9f6", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
          <Heading style={{ color: "#1a1a1a", fontSize: 24 }}>
            New Contact Message — Sindicato
          </Heading>
          <Text style={{ fontSize: 14, color: "#666" }}>
            Received: {submittedAt}
          </Text>
          <Container
            style={{
              backgroundColor: "#fff",
              border: "1px solid #e5e5e5",
              borderRadius: 8,
              padding: 20,
              marginBottom: 20,
            }}
          >
            <Text style={{ margin: "4px 0", fontSize: 14, color: "#555" }}>
              <strong>From:</strong> {name} ({email})
            </Text>
            <Text style={{ margin: "4px 0", fontSize: 14, color: "#555" }}>
              <strong>Category:</strong> {CATEGORY_LABELS[category] || category}
            </Text>
            {caseRef && (
              <Text style={{ margin: "4px 0", fontSize: 14, color: "#555" }}>
                <strong>Case Reference:</strong> {caseRef}
              </Text>
            )}
            {hasAttachment && (
              <Text style={{ margin: "4px 0", fontSize: 14, color: "#555" }}>
                <strong>Attachment:</strong> Yes (see email attachment)
              </Text>
            )}
          </Container>
          <Container
            style={{
              backgroundColor: "#fff",
              border: "1px solid #e5e5e5",
              borderRadius: 8,
              padding: 20,
            }}
          >
            <Text style={{ margin: 0, fontSize: 14, color: "#333", whiteSpace: "pre-wrap" }}>
              {message}
            </Text>
          </Container>
          <Hr style={{ margin: "32px 0" }} />
          <Text style={{ fontSize: 12, color: "#999" }}>
            Sindicato — Collective action for workers worldwide.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
