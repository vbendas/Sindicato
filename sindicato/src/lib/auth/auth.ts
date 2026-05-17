import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db/client";
import { workers, verificationTokens } from "@/lib/db/schema";
import { eq, and, gt, isNull, desc } from "drizzle-orm";
import { rateLimit } from "./rate-limit";

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

        const { allowed } = rateLimit(`verify:${email}`);
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
    maxAge: 30 * 24 * 60 * 60,
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
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
