import { NextRequest } from "next/server";
import { db } from "@/lib/db/client";
import { verificationTokens } from "@/lib/db/schema";
import { eq, and, gt, isNull, desc } from "drizzle-orm";
import { rateLimit } from "@/lib/auth/rate-limit";
import { emailSchema } from "@/lib/utils/schemas";
import { success, error, getClientIp } from "@/lib/utils/api";
import { z } from "zod";

const verifyCodeSchema = z.object({
  email: emailSchema,
  code: z.string().length(6).regex(/^\d{6}$/),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed } = rateLimit(`verify-code:${ip}`);
  if (!allowed) {
    return error("Too many requests", 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON", 400);
  }

  const parsed = verifyCodeSchema.safeParse(body);
  if (!parsed.success) {
    return error("Invalid email or code format", 400);
  }

  const { email, code } = parsed.data;

  const { allowed: emailAllowed } = rateLimit(`verify-code-email:${email}`);
  if (!emailAllowed) {
    return error("Too many attempts. Please request a new code.", 429);
  }

  // Validate without consuming — signIn() will consume and create the session
  const [token] = await db
    .select({ id: verificationTokens.id })
    .from(verificationTokens)
    .where(
      and(
        eq(verificationTokens.email, email),
        eq(verificationTokens.code, code),
        gt(verificationTokens.expiresAt, new Date()),
        isNull(verificationTokens.usedAt)
      )
    )
    .orderBy(desc(verificationTokens.createdAt))
    .limit(1);

  if (!token) {
    return error("Invalid or expired code", 401);
  }

  return success({ email });
}
