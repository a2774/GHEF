import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

import { and, eq, gt, lt, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { db, withDbRetry } from "@/server/db";
import { adminSessions, authAttempts } from "@/server/db/schema";

const cookieName = "ghe_admin_session";
const sessionMs = 8 * 60 * 60 * 1000;
const attemptWindowMs = 15 * 60 * 1000;

function sha256(value: string) {
  return createHash("sha256").update(value).digest();
}

function safeEqual(left: string, right: string) {
  return timingSafeEqual(sha256(left), sha256(right));
}

export function credentialsMatch(email: string, password: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) return false;

  const emailMatches = safeEqual(email.trim().toLowerCase(), adminEmail.trim().toLowerCase());
  const passwordMatches = safeEqual(password, adminPassword);
  return emailMatches && passwordMatches;
}

// Returns false once the key has used its attempts inside the current window.
export async function consumeAttempt(key: string, limit: number) {
  const windowStart = new Date(Date.now() - attemptWindowMs);
  const [attempt] = await withDbRetry(async () =>
    db
      .insert(authAttempts)
      .values({ key, count: 1, windowStartedAt: new Date() })
      .onConflictDoUpdate({
        target: authAttempts.key,
        set: {
          count: sql`case when ${authAttempts.windowStartedAt} < ${windowStart.toISOString()} then 1 else ${authAttempts.count} + 1 end`,
          windowStartedAt: sql`case when ${authAttempts.windowStartedAt} < ${windowStart.toISOString()} then now() else ${authAttempts.windowStartedAt} end`,
        },
      })
      .returning({ count: authAttempts.count }),
  );
  return attempt.count <= limit;
}

export async function clearAttempts(key: string) {
  await withDbRetry(async () => db.delete(authAttempts).where(eq(authAttempts.key, key)));
}

export async function createAdminSession() {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + sessionMs);

  await withDbRetry(async () => {
    await db.delete(adminSessions).where(lt(adminSessions.expiresAt, new Date()));
    await db.insert(adminSessions).values({ tokenHash: sha256(token).toString("hex"), expiresAt });
  });

  const cookieStore = await cookies();
  cookieStore.set(cookieName, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

async function hasActiveSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;
  if (!token) return false;

  const [session] = await withDbRetry(async () =>
    db
      .select({ tokenHash: adminSessions.tokenHash })
      .from(adminSessions)
      .where(
        and(
          eq(adminSessions.tokenHash, sha256(token).toString("hex")),
          gt(adminSessions.expiresAt, sql`now()`),
        ),
      ),
  );
  return Boolean(session);
}

export async function requireAdmin() {
  if (!(await hasActiveSession())) redirect("/admin/login");
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;
  if (token) {
    await withDbRetry(async () =>
      db.delete(adminSessions).where(eq(adminSessions.tokenHash, sha256(token).toString("hex"))),
    );
  }
  cookieStore.delete(cookieName);
}
