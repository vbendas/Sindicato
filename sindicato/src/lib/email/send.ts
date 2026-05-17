export async function sendEmail(_opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  throw new Error("Not implemented");
}
