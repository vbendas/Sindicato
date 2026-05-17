import crypto from "crypto";
import { NextRequest } from "next/server";
import { db } from "@/lib/db/client";
import { verificationTokens } from "@/lib/db/schema";
import { eq, and, isNull, gt } from "drizzle-orm";
import { rateLimit } from "@/lib/auth/rate-limit";
import { sendEmail } from "@/lib/email/send";
import { emailSchema } from "@/lib/utils/schemas";
import { success, error, getClientIp } from "@/lib/utils/api";

function generateCode(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed, retryAfterMs } = rateLimit(`send-code:${ip}`);
  if (!allowed) {
    return error("Too many requests", 429, { retryAfterMs });
  }

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON", 400);
  }

  const parsed = emailSchema.safeParse(body.email);
  if (!parsed.success) {
    return error("Invalid email address", 400);
  }

  const email = parsed.data;

  const { allowed: emailAllowed } = rateLimit(`send-code-email:${email}`);
  if (!emailAllowed) {
    return error("Too many requests", 429);
  }

  const recent = await db
    .select()
    .from(verificationTokens)
    .where(
      and(
        eq(verificationTokens.email, email),
        isNull(verificationTokens.usedAt),
        gt(verificationTokens.expiresAt, new Date())
      )
    )
    .limit(1);

  if (recent.length > 0) {
    return success({ message: "If an account exists, a code has been sent." });
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await db.insert(verificationTokens).values({ email, code, expiresAt });

  try {
    await sendEmail({
      to: email,
      subject: "Your Sindicato verification code",
      html: `<p>Your verification code is: <strong>${code}</strong></p><p>It expires in 10 minutes.</p>`,
    });
  } catch (err) {
    console.error("Failed to send verification email:", err);
    return error("Failed to send verification email. Please try again.", 500);
  }

  return success({ message: "If an account exists, a code has been sent." });
}
