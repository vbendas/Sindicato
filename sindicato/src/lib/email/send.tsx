import { render } from "@react-email/components";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const { error } = await resend.emails.send({
    from: "Sindicato <noreply@sindicato.ai>",
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
