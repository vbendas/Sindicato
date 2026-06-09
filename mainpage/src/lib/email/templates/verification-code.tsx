import { Text, Button } from "@react-email/components";
import EmailLayout from "../components/EmailLayout";

interface VerificationCodeEmailProps {
  code: string;
  loginUrl: string;
}

export default function VerificationCodeEmail({
  code,
  loginUrl,
}: VerificationCodeEmailProps) {
  return (
    <EmailLayout preview={`Your Sindicato verification code: ${code}`}>
      <Text style={{ fontSize: 16, color: "#333" }}>
        You requested a verification code to access your Sindicato account.
      </Text>

      <div
        style={{
          textAlign: "center" as const,
          margin: "32px 0",
          padding: "24px 0",
          backgroundColor: "#fff",
          border: "1px solid #e5e5e5",
          borderRadius: 8,
        }}
      >
        <Text
          style={{
            fontSize: 40,
            fontWeight: 700,
            color: "#1a1a1a",
            letterSpacing: "0.15em",
            fontFamily: "monospace",
            margin: 0,
          }}
        >
          {code}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: "#999",
            margin: "8px 0 0",
          }}
        >
          Expires in 10 minutes
        </Text>
      </div>

      <Button
        href={loginUrl}
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
        Verify Your Email
      </Button>

      <Text style={{ fontSize: 14, color: "#666", marginTop: 24 }}>
        If you didn&apos;t request this code, you can safely ignore this email.
      </Text>
    </EmailLayout>
  );
}
