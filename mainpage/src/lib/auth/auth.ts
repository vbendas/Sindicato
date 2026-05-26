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

        if (process.env.NODE_ENV === 'development') {
          console.log('[Auth] Authorize - checking platform account for:', email);
          console.log('[Auth] Authorize - platformAccount found:', !!platformAccount);
        }

        if (platformAccount) {
          if (process.env.NODE_ENV === 'development') {
            console.log('[Auth] Authorize - treating as platform account');
          }
          
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

          const user = {
            id: platformAccount.id,
            email: platformAccount.email,
            name: platformAccount.displayName,
            role: platformAccount.role,
            approvalStatus: platformAccount.approvalStatus,
            companyId: platformAccount.companyId || undefined,
            companyName,
          };

          if (process.env.NODE_ENV === 'development') {
            console.log('[Auth] Authorize - returning platform user:', {
              id: user.id,
              email: user.email,
              role: user.role,
              approvalStatus: user.approvalStatus,
              companyId: user.companyId,
              companyName: user.companyName
            });
          }

          return user;
        }

        let [worker] = await db
          .select()
          .from(workers)
          .where(eq(workers.email, email))
          .limit(1);

        if (process.env.NODE_ENV === 'development') {
          console.log('[Auth] Authorize - worker found:', !!worker);
        }

        if (!worker) {
          if (process.env.NODE_ENV === 'development') {
            console.log('[Auth] Authorize - creating new worker');
          }
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

        const user = {
          id: worker.id,
          email: worker.email,
          name: worker.displayName,
        };

        if (process.env.NODE_ENV === 'development') {
          console.log('[Auth] Authorize - returning worker:', user);
        }

        return user;
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
      if (process.env.NODE_ENV === 'development') {
        console.log('[Auth] JWT callback - user:', user ? { id: user.id, email: user.email, role: user.role } : null);
        console.log('[Auth] JWT callback - token before:', { id: token.id, email: token.email, role: token.role, companyId: token.companyId });
      }
      
      if (user) {
        token.id = user.id;
        token.email = user.email;
        if (user.role) token.role = user.role;
        if (user.approvalStatus) token.approvalStatus = user.approvalStatus;
        if (user.companyId) token.companyId = user.companyId;
        if (user.companyName) token.companyName = user.companyName;
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[Auth] JWT callback - token after:', { id: token.id, email: token.email, role: token.role, companyId: token.companyId, companyName: token.companyName });
      }
      
      return token;
    },
    async session({ session, token }) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Auth] Session callback - token:', {
          id: token.id,
          email: token.email,
          role: token.role,
          approvalStatus: token.approvalStatus,
          companyId: token.companyId,
          companyName: token.companyName
        });
      }
      
      if (session.user) {
        session.user.id = token.id as string;
        if (token.role) session.user.role = token.role as "lawyer" | "company" | "media";
        if (token.approvalStatus) session.user.approvalStatus = token.approvalStatus as "pending" | "approved" | "rejected";
        
        // Fetch companyId from database if not in token (for existing sessions)
        let companyId = token.companyId as string | undefined;
        if (!companyId && token.id) {
          if (process.env.NODE_ENV === 'development') {
            console.log('[Auth] Fetching companyId from database for user:', token.id);
          }
          const [account] = await db
            .select({ companyId: platformAccounts.companyId })
            .from(platformAccounts)
            .where(eq(platformAccounts.id, token.id as string))
            .limit(1);
          companyId = account?.companyId || undefined;
          if (process.env.NODE_ENV === 'development') {
            console.log('[Auth] Fetched companyId:', companyId);
          }
        }
        
        if (companyId) {
          session.user.companyId = companyId;
          // Fetch companyName from database
          const [company] = await db
            .select({ name: companies.name })
            .from(companies)
            .where(eq(companies.id, companyId))
            .limit(1);
          if (company) {
            session.user.companyName = company.name;
            if (process.env.NODE_ENV === 'development') {
              console.log('[Auth] Fetched companyName:', company.name);
            }
          }
        }
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[Auth] Final session.user:', {
            id: session.user.id,
            email: session.user.email,
            role: session.user.role,
            approvalStatus: session.user.approvalStatus,
            companyId: session.user.companyId,
            companyName: session.user.companyName
          });
        }
      }
      return session;
    },
  },
});
