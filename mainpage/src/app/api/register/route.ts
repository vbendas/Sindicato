import { NextRequest } from "next/server";
import { db } from "@/lib/db/client";
import { platformAccounts, verificationTokens } from "@/lib/db/schema";
import { eq, and, gt, isNull, desc } from "drizzle-orm";
import { rateLimit } from "@/lib/auth/rate-limit";
import { sendEmail } from "@/lib/email/send";
import { emailSchema } from "@/lib/utils/schemas";
import { success, error, getClientIp } from "@/lib/utils/api";
import { z } from "zod";

const registerSchema = z.object({
  email: emailSchema,
  code: z.string().length(6).regex(/^\d{6}$/),
  role: z.enum(["lawyer", "company", "media"]),
  displayName: z.string().min(1).max(255),
  organization: z.string().max(255).optional(),
  tosVersion: z.string().default("1.0"),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed } = rateLimit(`register:${ip}`);
  if (!allowed) {
    return error("Too many requests", 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON", 400);
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return error("Invalid input", 400, parsed.error.flatten());
  }

  const { email, code, role, displayName, organization, tosVersion } = parsed.data;

  const { allowed: emailAllowed } = rateLimit(`register-email:${email}`);
  if (!emailAllowed) {
    return error("Too many attempts. Please request a new code.", 429);
  }

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

  await db
    .update(verificationTokens)
    .set({ usedAt: new Date() })
    .where(eq(verificationTokens.id, token.id));

  const [existing] = await db
    .select()
    .from(platformAccounts)
    .where(eq(platformAccounts.email, email))
    .limit(1);

  if (existing) {
    if (existing.role === role) {
      if (existing.approvalStatus === "approved") {
        return success({ message: "Account already exists and is approved", redirect: "/clerk" });
      }
      if (existing.approvalStatus === "pending") {
        return success({ message: "Account already exists and is pending approval", redirect: "/pending-approval" });
      }
      return error("Account has been rejected. Contact support.", 403);
    }
    return error(`This email is already registered as a ${existing.role}. Use a different email or role.`, 409);
  }

  const [account] = await db
    .insert(platformAccounts)
    .values({
      email,
      role,
      displayName,
      organization: organization || null,
      approvalStatus: "pending",
      tosAcceptedAt: new Date(),
      tosVersion,
      emailVerified: true,
    })
    .returning();

  try {
    await sendEmail({
      to: process.env.ADMIN_EMAIL || email,
      subject: `New ${role} registration: ${email}`,
      html: `
        <h1>New Platform Registration</h1>
        <p><strong>Role:</strong> ${role}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Name:</strong> ${displayName}</p>
        ${organization ? `<p><strong>Organization:</strong> ${organization}</p>` : ""}
        <p><strong>TOS Version:</strong> ${tosVersion}</p>
        <p><strong>IP:</strong> ${ip}</p>
        <p>To approve, set <code>approval_status = 'approved'</code> in the <code>platform_accounts</code> table for id: ${account.id}</p>
      `,
    });
  } catch (err) {
    console.error("Failed to send admin notification:", err);
  }

  return success({
    message: "Registration submitted. Your account is pending approval.",
    redirect: "/pending-approval",
  });
}
