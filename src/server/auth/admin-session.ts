import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

import { and, eq, gt, lt, sql } from "drizzle-orm";
import { cacheLife } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { db, withDbRetry } from "@/server/db";
import { adminSessions, adminUsers, auditLogs, authAttempts } from "@/server/db/schema";

import { verifyPassword } from "./password";

const cookieName = "ghe_admin_session";
const sessionMs = 8 * 60 * 60 * 1000;
const attemptWindowMs = 15 * 60 * 1000;

function sha256(value: string) {
  return createHash("sha256").update(value).digest();
}

function safeEqual(left: string, right: string) {
  return timingSafeEqual(sha256(left), sha256(right));
}

export type AdminRole = "owner" | "admin" | "staff";
export type AdminIdentity = { email: string; role: AdminRole };

const roleRank: Record<AdminRole, number> = { staff: 1, admin: 2, owner: 3 };

export function hasRole(admin: AdminIdentity, required: AdminRole) {
  return roleRank[admin.role] >= roleRank[required];
}

// The env login is the owner. Team members added in the panel log in from the database.
export async function findAdmin(email: string, password: string): Promise<AdminIdentity | null> {
  const normalized = email.trim().toLowerCase();
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    const emailMatches = safeEqual(normalized, adminEmail.trim().toLowerCase());
    const passwordMatches = safeEqual(password, adminPassword);
    if (emailMatches && passwordMatches) return { email: normalized, role: "owner" };
  }

  const [user] = await withDbRetry(async () =>
    db.select().from(adminUsers).where(eq(adminUsers.email, normalized)).limit(1),
  );
  if (!user?.isActive || !(await verifyPassword(password, user.passwordHash))) return null;
  return { email: user.email, role: user.role };
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

export async function createAdminSession(admin: AdminIdentity) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + sessionMs);

  await withDbRetry(async () => {
    await db.delete(adminSessions).where(lt(adminSessions.expiresAt, new Date()));
    await db
      .insert(adminSessions)
      .values({ tokenHash: sha256(token).toString("hex"), expiresAt, ...admin });
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

// Reads the session cookie, so it uses a private cache: the result lives only in this
// admin's browser, which lets admin links prefetch the whole page before the click.
// On the server it is still checked on every request.
async function lookupAdmin(): Promise<AdminIdentity | null> {
  "use cache: private";
  cacheLife({ stale: 300 });
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;
  if (!token) return null;

  const [session] = await withDbRetry(async () =>
    db
      .select({ email: adminSessions.email, role: adminSessions.role })
      .from(adminSessions)
      .where(
        and(
          eq(adminSessions.tokenHash, sha256(token).toString("hex")),
          gt(adminSessions.expiresAt, sql`now()`),
        ),
      ),
  );
  return session ?? null;
}

// The admin layout, sidebar and page all ask for the admin. cache() makes that one lookup per request.
export const getAdmin = cache(lookupAdmin);

export async function requireAdmin(required: AdminRole = "staff") {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  if (!hasRole(admin, required)) redirect("/admin");
  return admin;
}

export async function logAdminAction(
  admin: AdminIdentity,
  action: string,
  entity: string,
  entityId?: string | number,
  details?: string,
) {
  await withDbRetry(async () =>
    db.insert(auditLogs).values({
      actor: admin.email,
      action,
      entity,
      entityId: entityId === undefined ? null : String(entityId),
      details,
    }),
  );
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
