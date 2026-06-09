import { Html, Head, Body, Container, Preview } from "@react-email/components";
import EmailLogo from "./EmailLogo";
import EmailFooter from "./EmailFooter";

interface EmailLayoutProps {
  children: React.ReactNode;
  preview?: string;
}

export default function EmailLayout({ children, preview }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      {preview && <Preview>{preview}</Preview>}
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <EmailLogo />
          {children}
          <EmailFooter />
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle = {
  backgroundColor: "#faf9f6",
  fontFamily: "sans-serif",
  margin: 0,
  padding: 0,
};

const containerStyle = {
  maxWidth: 600,
  margin: "0 auto",
  padding: 24,
};
