import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Heading,
  Button,
  Hr,
} from "@react-email/components";

interface PerCaseFollowUpProps {
  companyName: string;
  caseType: string;
  displayName: string;
  amountOwed: string;
  currency: string;
  storyPreview: string;
  daysSinceFiled: number;
  caseUrl: string;
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
}: PerCaseFollowUpProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#faf9f6", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
          <Heading style={{ color: "#1a1a1a", fontSize: 24 }}>
            Open Case Follow-Up — Sindicato
          </Heading>
          <Text style={{ fontSize: 16, color: "#333" }}>
            Dear {companyName} team,
          </Text>
          <Text style={{ fontSize: 16, color: "#333" }}>
            This is a follow-up regarding an open case filed against your
            company through Sindicato. The case has been active for{" "}
            {daysSinceFiled} days without resolution.
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
              <strong>Case Type:</strong> {caseType}
            </Text>
            <Text style={{ margin: "4px 0", fontSize: 14, color: "#555" }}>
              <strong>Worker:</strong> {displayName}
            </Text>
            <Text style={{ margin: "4px 0", fontSize: 14, color: "#555" }}>
              <strong>Amount Owed:</strong> {currency} {amountOwed}
            </Text>
            <Text style={{ margin: "4px 0", fontSize: 14, color: "#555" }}>
              <strong>Days Open:</strong> {daysSinceFiled}
            </Text>
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
          </Container>
          <Text style={{ fontSize: 16, color: "#333" }}>
            Resolving this case promptly demonstrates good faith and helps
            avoid escalation. We are here to facilitate a fair resolution for
            all parties.
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
          <Hr style={{ margin: "32px 0" }} />
          <Text style={{ fontSize: 12, color: "#999" }}>
            Sindicato — Collective action for workers worldwide.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
