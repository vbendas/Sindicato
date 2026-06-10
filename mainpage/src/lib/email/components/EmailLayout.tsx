import { Html, Head, Body, Container, Preview, Font } from "@react-email/components";
import EmailLogo from "./EmailLogo";
import EmailFooter from "./EmailFooter";

interface EmailLayoutProps {
  children: React.ReactNode;
  preview?: string;
}

export default function EmailLayout({ children, preview }: EmailLayoutProps) {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Barlow Condensed"
          fallbackFontFamily="Arial, Helvetica, sans-serif"
          webFont={{
            url: "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700&display=swap",
            format: "woff2",
          }}
          fontWeight={700}
          fontStyle="normal"
        />
      </Head>
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
