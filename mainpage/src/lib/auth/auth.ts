import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db/client";
import { workers, verificationTokens, platformAccounts, companies } from "@/lib/db/schema";
import { eq, and, gt, isNull, desc } from "drizzle-orm";
import { rateLimit } from "./rate-limit";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role?: "lawyer" | "company" | "media";
      approvalStatus?: "pending" | "approved" | "rejected";
      companyId?: string;
      companyName?: string;
    };
  }
  interface User {
    role?: string;
    approvalStatus?: string;
    companyId?: string;
    companyName?: string;
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "email-code",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials.email as string;
        const code = credentials.code as string;

        if (!email || !code) return null;

        const { allowed } = await rateLimit(`verify:${email}`);
        if (!allowed) return null;

        const [token] = await db
          .select()
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

        if (!token) return null;

        await db
          .update(verificationTokens)
          .set({ usedAt: new Date() })
          .where(eq(verificationTokens.id, token.id));

        const [platformAccount] = await db
          .select()
          .from(platformAccounts)
          .where(eq(platformAccounts.email, email))
          .limit(1);

        if (platformAccount) {
          await db
            .update(platformAccounts)
            .set({ emailVerified: true, updatedAt: new Date() })
            .where(eq(platformAccounts.id, platformAccount.id));

          let companyName: string | undefined;
          if (platformAccount.companyId) {
            const [company] = await db
              .select({ name: companies.name })
              .from(companies)
              .where(eq(companies.id, platformAccount.companyId))
              .limit(1);
            companyName = company?.name;
          }

          return {
            id: platformAccount.id,
            email: platformAccount.email,
            name: platformAccount.displayName,
            role: platformAccount.role,
            approvalStatus: platformAccount.approvalStatus,
            companyId: platformAccount.companyId || undefined,
            companyName,
          };
        }

        let [worker] = await db
          .select()
          .from(workers)
          .where(eq(workers.email, email))
          .limit(1);

        if (!worker) {
          [worker] = await db
            .insert(workers)
            .values({
              email,
              displayName: email.split("@")[0],
              emailVerified: true,
            })
            .returning();
        } else {
          await db
            .update(workers)
            .set({ emailVerified: true, updatedAt: new Date() })
            .where(eq(workers.id, worker.id));
        }

        return {
          id: worker.id,
          email: worker.email,
          name: worker.displayName,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/auth/verify",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        if (user.role) token.role = user.role;
        if (user.approvalStatus) token.approvalStatus = user.approvalStatus;
        if (user.companyId) token.companyId = user.companyId;
        if (user.companyName) token.companyName = user.companyName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        if (token.role) session.user.role = token.role as "lawyer" | "company" | "media";
        if (token.approvalStatus) session.user.approvalStatus = token.approvalStatus as "pending" | "approved" | "rejected";
        if (token.companyId) session.user.companyId = token.companyId as string;
        if (token.companyName) session.user.companyName = token.companyName as string;
      }
      return session;
    },
  },
});
