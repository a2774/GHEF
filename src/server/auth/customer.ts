import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { db, withDbRetry } from "@/server/db";
import { accounts, users, verificationTokens } from "@/server/db/schema";

import { verifyPassword } from "./password";

export const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  trustHost: true,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const email = String(credentials.email ?? "").trim().toLowerCase();
        const password = String(credentials.password ?? "");
        if (!email || !password) return null;

        const [user] = await withDbRetry(async () =>
          db.select().from(users).where(eq(users.email, email)).limit(1),
        );
        if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
          return null;
        }
        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
    ...(googleEnabled ? [Google] : []),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      // A valid cookie can outlive a deleted account, so confirm the user still exists.
      const userId = token.sub;
      const [user] = userId
        ? await withDbRetry(async () =>
            db.select({ id: users.id }).from(users).where(eq(users.id, userId)),
          )
        : [];
      if (!user) return { expires: session.expires } as typeof session;

      session.user.id = user.id;
      return session;
    },
  },
});
