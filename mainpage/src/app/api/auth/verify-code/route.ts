import crypto from "crypto";
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
  const { allowed } = await rateLimit(`verify-code:${ip}`);
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
    return error("Invalid or expired code.", 400);
  }

  const { email, code } = parsed.data;

  const { allowed: emailAllowed } = await rateLimit(`verify-code-email:${email}`);
  if (!emailAllowed) {
    return error("Too many attempts. Please request a new code.", 429);
  }

  // Fetch candidates by email + expiry, then compare hash in JS
  const candidates = await db
    .select({ id: verificationTokens.id, codeHash: verificationTokens.codeHash })
    .from(verificationTokens)
    .where(
      and(
        eq(verificationTokens.email, email),
        gt(verificationTokens.expiresAt, new Date()),
        isNull(verificationTokens.usedAt)
      )
    )
    .orderBy(desc(verificationTokens.createdAt))
    .limit(5);

  const codeHash = crypto.createHash("sha256").update(code).digest("hex");
  const token = candidates.find((c) => {
    if (!c.codeHash) return false;
    try {
      return crypto.timingSafeEqual(
        Buffer.from(c.codeHash, "hex"),
        Buffer.from(codeHash, "hex")
      );
    } catch {
      return false;
    }
  });

  if (!token) {
    return error("Invalid or expired code.", 401);
  }

  await db
    .update(verificationTokens)
    .set({ usedAt: new Date() })
    .where(eq(verificationTokens.id, token.id));

  return success({ email });
}
