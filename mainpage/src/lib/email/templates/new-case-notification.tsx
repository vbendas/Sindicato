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

interface NewCaseNotificationProps {
  companyName: string;
  workerName: string;
  country: string;
  amountOwed: string;
  currency: string;
  claimTypes: string[];
  caseUrl: string;
}

export default function NewCaseNotification({
  companyName,
  workerName,
  country,
  amountOwed,
  currency,
  claimTypes,
  caseUrl,
}: NewCaseNotificationProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#faf9f6", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
          <Heading style={{ color: "#1a1a1a", fontSize: 24 }}>
            New Case Reported — Sindicato
          </Heading>
          <Text style={{ fontSize: 16, color: "#333" }}>
            Dear {companyName} team,
          </Text>
          <Text style={{ fontSize: 16, color: "#333" }}>
            A new case has been reported against your company through the
            Sindicato platform. Below is a summary of the claim:
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
              <strong>Worker:</strong> {workerName}
            </Text>
            <Text style={{ margin: "4px 0", fontSize: 14, color: "#555" }}>
              <strong>Country:</strong> {country}
            </Text>
            <Text style={{ margin: "4px 0", fontSize: 14, color: "#555" }}>
              <strong>Amount Owed:</strong> {currency} {amountOwed}
            </Text>
            <Text style={{ margin: "4px 0", fontSize: 14, color: "#555" }}>
              <strong>Claim Types:</strong> {claimTypes.join(", ")}
            </Text>
          </Container>
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
          <Hr style={{ margin: "32px 0" }} />
          <Text style={{ fontSize: 12, color: "#999" }}>
            Sindicato — Collective action for workers worldwide.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
