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
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#faf9f6", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
          <Heading style={{ color: "#1a1a1a", fontSize: 24 }}>
            Your Case Data Was Accessed — Sindicato
          </Heading>
          <Text style={{ fontSize: 16, color: "#333" }}>
            A representative of <strong>{companyName}</strong> (
            {accessorRole}) accessed your case data on{" "}
            <strong>{date}</strong>.
          </Text>
          <Text style={{ fontSize: 16, color: "#333" }}>
            This access is part of the resolution process. Your identity and
            personal information remain private unless you choose to share
            them. Any form of retaliation violates our terms of service and
            your public case on Sindicato serves as timestamped evidence that
            can be used in legal proceedings.
          </Text>
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
          <Hr style={{ margin: "32px 0" }} />
          <Text style={{ fontSize: 12, color: "#999" }}>
            Sindicato — Collective action for workers worldwide. If you did not
            expect this notification, please contact us immediately.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
