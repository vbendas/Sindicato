export function redactName(fullName: string): string {
  if (!fullName) return "***";
  return fullName
    .split(" ")
    .map((w) => w[0] + "***")
    .join(" ");
}

export function formatCaseType(caseType: string): string {
  return caseType
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function redactEmail(email: string): string {
  if (!email) return "";
  const [local, domain] = email.split("@");
  if (!domain) return "";
  const domainParts = domain.split(".");
  const domainName = domainParts[0];
  const tld = domainParts.slice(1).join(".");
  return local[0] + "*****@" + domainName[0] + "***." + tld;
}
