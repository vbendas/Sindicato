import { Text } from "@react-email/components";
import EmailLayout from "../components/EmailLayout";
import DetailCard, { DetailRow } from "../components/DetailCard";

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
    <EmailLayout preview="Thank you for supporting Sindicato">
      <Text style={text}>{greeting}</Text>

      <Text style={text}>
        Thank you. Your donation of <strong>{amountFormatted}</strong> on{" "}
        {date} keeps this platform running with no investors, no advertisers,
        and no company money behind it.
      </Text>

      <DetailCard>
        <DetailRow label="Amount">{amountFormatted}</DetailRow>
        <DetailRow label="Date">{date}</DetailRow>
      </DetailCard>

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
          Stripe will email you an official receipt. You can also download it
          directly from{" "}
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
    </EmailLayout>
  );
}

const text = {
  color: "#1a1a1a",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "12px 0",
};

const link = {
  color: "#c53030",
  textDecoration: "underline",
};
