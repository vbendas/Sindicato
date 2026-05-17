export function redactName(fullName: string): string {
  if (!fullName || fullName.length < 3) return "***";
  return fullName.substring(0, 3) + "*****";
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
