import crypto from "crypto";
import { NextRequest } from "next/server";
import { db } from "@/lib/db/client";
import { verificationTokens } from "@/lib/db/schema";
import { eq, and, isNull, gt } from "drizzle-orm";
import { rateLimit } from "@/lib/auth/rate-limit";
import { sendTemplateEmail } from "@/lib/email/send";
import VerificationCodeEmail from "@/lib/email/templates/verification-code";
import { emailSchema } from "@/lib/utils/schemas";
import { success, error, getClientIp } from "@/lib/utils/api";

function generateCode(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed, retryAfterMs } = await rateLimit(`send-code:${ip}`);
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

  const { allowed: emailAllowed } = await rateLimit(`send-code-email:${email}`);
  if (!emailAllowed) {
    return error("Too many requests", 429);
  }

  // Delete any existing unexpired tokens so we always send a fresh code
  await db
    .delete(verificationTokens)
    .where(
      and(
        eq(verificationTokens.email, email),
        isNull(verificationTokens.usedAt),
        gt(verificationTokens.expiresAt, new Date())
      )
    );

  const code = generateCode();
  const codeHash = crypto.createHash("sha256").update(code).digest("hex");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await db.insert(verificationTokens).values({ email, codeHash, expiresAt });

  try {
    await sendTemplateEmail(
      email,
      "Your Sindicato verification code",
      VerificationCodeEmail,
      {
        code,
        loginUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/en/auth/verify`,
      }
    );
  } catch (err) {
    console.error("Failed to send verification email:", err);
    return error("Failed to send verification email. Please try again.", 500);
  }

  return success({ message: "If an account exists, a code has been sent." });
}
