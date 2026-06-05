import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface DonationReceiptEmailProps {
  donorName?: string;
  amountFormatted: string;
  date: string;
  receiptUrl?: string;
}

export default function DonationReceiptEmail({
  donorName,
  amountFormatted,
  date,
  receiptUrl,
}: DonationReceiptEmailProps) {
  const greeting = donorName ? `Hi ${donorName},` : "Hi,";

  return (
    <Html>
      <Head />
      <Preview>Thank you for supporting Sindicato</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Sindicato</Heading>
          <Section style={divider} />

          <Text style={text}>{greeting}</Text>

          <Text style={text}>
            Thank you. Your donation of <strong>{amountFormatted}</strong> on{" "}
            {date} keeps this platform running with no investors, no
            advertisers, and no company money behind it.
          </Text>

          <Text style={text}>
            Every euro beyond operational costs goes to the Worker Support Fund
            — covering small claims filing fees, legal consultations, and
            psychological support for workers who need it.
          </Text>

          <Text style={text}>
            Your support is the reason this exists. Visibility is the defense of
            everyone else.
          </Text>

          {receiptUrl ? (
            <Text style={text}>
              Stripe will email you an official receipt. You can also download
              it directly from{" "}
              <a href={receiptUrl} style={link}>
                your Stripe receipt
              </a>
              .
            </Text>
          ) : (
            <Text style={text}>
              Stripe will email you an official receipt for your records.
            </Text>
          )}

          <Section style={divider} />
          <Text style={footer}>Sindicato — sindicato.report</Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#f6f5f1",
  fontFamily: "Helvetica, Arial, sans-serif",
  margin: 0,
  padding: 0,
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 32px",
  maxWidth: "560px",
};

const heading = {
  color: "#5a1a1a",
  fontSize: "20px",
  fontWeight: 700,
  letterSpacing: "0.18em",
  margin: 0,
  textTransform: "uppercase" as const,
};

const divider = {
  borderTop: "1px solid #ece9e1",
  margin: "24px 0",
};

const text = {
  color: "#1a1a1a",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "12px 0",
};

const link = {
  color: "#5a1a1a",
  textDecoration: "underline",
};

const footer = {
  color: "#888888",
  fontSize: "12px",
  margin: 0,
  textAlign: "center" as const,
};
