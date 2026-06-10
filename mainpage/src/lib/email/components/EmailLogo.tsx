import { Text } from "@react-email/components";

interface EmailLogoProps {
  baseUrl?: string;
}

export default function EmailLogo({
  baseUrl = "https://www.sindicato.report",
}: EmailLogoProps) {
  return (
    <div style={{ textAlign: "center", marginBottom: 32 }}>
      <Text
        style={{
          fontFamily: "'Barlow Condensed', Arial, Helvetica, sans-serif",
          fontSize: 28,
          fontWeight: 700,
          color: "#1a1a2e",
          margin: 0,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          lineHeight: 1,
        }}
      >
        Sindicato
      </Text>
      <Text
        style={{
          fontSize: 12,
          color: "#999",
          margin: "8px 0 0",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
        }}
      >
        {baseUrl.replace("https://", "")}
      </Text>
    </div>
  );
}
