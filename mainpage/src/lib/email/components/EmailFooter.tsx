import { Hr, Text } from "@react-email/components";

export default function EmailFooter() {
  return (
    <>
      <Hr style={{ margin: "32px 0" }} />
      <Text style={{ fontSize: 12, color: "#999", textAlign: "center" }}>
        Sindicato — Collective action for workers worldwide.
      </Text>
      <Text style={{ fontSize: 11, color: "#bbb", textAlign: "center", margin: "4px 0 0" }}>
        <a
          href="https://www.sindicato.report"
          style={{ color: "#bbb", textDecoration: "underline" }}
        >
          sindicato.report
        </a>
      </Text>
    </>
  );
}
