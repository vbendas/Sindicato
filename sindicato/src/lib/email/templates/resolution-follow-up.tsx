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
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#faf9f6", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
          <Heading style={{ color: "#1a1a1a", fontSize: 24 }}>
            Outstanding Cases Reminder — Sindicato
          </Heading>
          <Text style={{ fontSize: 16, color: "#333" }}>
            Dear {companyName} team,
          </Text>
          <Text style={{ fontSize: 16, color: "#333" }}>
            This is a follow-up regarding open cases filed against your company
            through Sindicato. These cases have been active for over 30 days
            without resolution.
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
              <strong>Open Cases:</strong> {caseCount}
            </Text>
            <Text style={{ margin: "4px 0", fontSize: 14, color: "#555" }}>
              <strong>Total Unpaid Amount:</strong> {currency} {totalUnpaid}
            </Text>
          </Container>
          <Text style={{ fontSize: 16, color: "#333" }}>
            Resolving these cases promptly demonstrates good faith and helps
            avoid escalation. We are here to facilitate a fair resolution for
            all parties.
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
          <Hr style={{ margin: "32px 0" }} />
          <Text style={{ fontSize: 12, color: "#999" }}>
            Sindicato — Collective action for workers worldwide.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
