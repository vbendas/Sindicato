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

interface WeeklyCompanyReportProps {
  companyName: string;
  totalCases: number;
  newThisWeek: number;
  totalUnpaid: string;
  currency: string;
  unresolvedCount: number;
  reportUrl: string;
}

export default function WeeklyCompanyReport({
  companyName,
  totalCases,
  newThisWeek,
  totalUnpaid,
  currency,
  unresolvedCount,
  reportUrl,
}: WeeklyCompanyReportProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#faf9f6", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
          <Heading style={{ color: "#1a1a1a", fontSize: 24 }}>
            Weekly Case Report — Sindicato
          </Heading>
          <Text style={{ fontSize: 16, color: "#333" }}>
            Dear {companyName} team,
          </Text>
          <Text style={{ fontSize: 16, color: "#333" }}>
            Here is your weekly summary of case activity on the Sindicato
            platform.
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
              <strong>Total Cases:</strong> {totalCases}
            </Text>
            <Text style={{ margin: "4px 0", fontSize: 14, color: "#555" }}>
              <strong>New This Week:</strong> {newThisWeek}
            </Text>
            <Text style={{ margin: "4px 0", fontSize: 14, color: "#555" }}>
              <strong>Total Unpaid:</strong> {currency} {totalUnpaid}
            </Text>
            <Text style={{ margin: "4px 0", fontSize: 14, color: "#555" }}>
              <strong>Unresolved:</strong> {unresolvedCount}
            </Text>
          </Container>
          <Text style={{ fontSize: 16, color: "#333" }}>
            You can view the full report and take action on outstanding cases
            from your dashboard.
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
          <Hr style={{ margin: "32px 0" }} />
          <Text style={{ fontSize: 12, color: "#999" }}>
            Sindicato — Collective action for workers worldwide.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
