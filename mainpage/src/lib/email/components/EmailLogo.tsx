import { Img, Text } from "@react-email/components";

interface EmailLogoProps {
  baseUrl?: string;
}

export default function EmailLogo({
  baseUrl = "https://www.sindicato.report",
}: EmailLogoProps) {
  return (
    <div style={{ textAlign: "center", marginBottom: 32 }}>
      <Img
        src={`${baseUrl}/images/logo.png`}
        alt="Sindicato"
        width={120}
        style={{ display: "inline-block" }}
      />
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
