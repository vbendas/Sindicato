import { render } from "@react-email/components";
import { Resend } from "resend";

let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (!resendInstance) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  // Sandbox mode: redirect all emails to a single verified recipient (Resend account owner)
  const sandboxRecipient = process.env.RESEND_SANDBOX_RECIPIENT;
  if (sandboxRecipient) {
    const { error } = await getResend().emails.send({
      from: "Sindicato <onboarding@resend.dev>",
      to: sandboxRecipient,
      subject: `[→ ${opts.to}] ${opts.subject}`,
      html: `<p style="color:#999;font-size:12px">Originally to: ${opts.to}</p><hr/>${opts.html}`,
    });
    if (error) throw new Error(`Resend error: ${error.message}`);
    return;
  }

  // Dev fallback: log to console when no domain is configured
  if (!process.env.EMAIL_FROM) {
    console.log(`\n📧 [DEV EMAIL] To: ${opts.to}\nSubject: ${opts.subject}\n${opts.html.replace(/<[^>]+>/g, "").trim()}\n`);
    return;
  }

  const { error } = await getResend().emails.send({
    from: process.env.EMAIL_FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
  if (error) throw new Error(`Resend error: ${error.message}`);
}

export async function sendTemplateEmail<T extends Record<string, unknown>>(
  to: string,
  subject: string,
  Template: (props: T) => React.JSX.Element,
  props: T
): Promise<void> {
  const html = await render(<Template {...props} />);
  await sendEmail({ to, subject, html });
}
