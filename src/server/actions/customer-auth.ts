"use server";

import { eq } from "drizzle-orm";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { isSafePath } from "@/lib/safe-path";
import { clearAttempts, consumeAttempt } from "@/server/auth/admin-session";
import { auth, googleEnabled, signIn, signOut } from "@/server/auth/customer";
import { hashPassword } from "@/server/auth/password";
import { db, withDbRetry } from "@/server/db";
import { users } from "@/server/db/schema";

export type AuthResult = { ok: true } | { ok: false; error: string };

const phoneSchema = z
  .string()
  .trim()
  .regex(/^(\+91[ -]?)?[6-9]\d{9}$/, "Enter a valid Indian mobile number.");

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name.").max(120),
    email: z.email("Enter a valid email address.").trim().toLowerCase().max(254),
    phone: phoneSchema,
    password: z.string().min(8, "Use at least 8 characters.").max(128),
    confirmPassword: z.string(),
    consent: z.literal("on", { error: "Accept the policies to continue." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords do not match.",
  });

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "").slice(-10);
}

async function clientKey(scope: string) {
  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return `${scope}:${ip}`;
}

function isUniqueViolation(error: unknown) {
  const cause = (error as { cause?: { code?: string } })?.cause ?? error;
  return (cause as { code?: string }).code === "23505";
}

async function signInWithPassword(email: string, password: string): Promise<AuthResult> {
  try {
    await signIn("credentials", { email, password, redirect: false });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) return { ok: false, error: "Incorrect email or password." };
    throw error;
  }
}

export async function loginCustomer(form: FormData): Promise<AuthResult> {
  const key = await clientKey("customer-login");
  if (!(await consumeAttempt(key, 10))) {
    return { ok: false, error: "Too many attempts. Try again in 15 minutes." };
  }

  const result = await signInWithPassword(
    String(form.get("email") ?? ""),
    String(form.get("password") ?? ""),
  );
  if (result.ok) await clearAttempts(key);
  return result;
}

export async function registerCustomer(form: FormData): Promise<AuthResult> {
  if (!(await consumeAttempt(await clientKey("customer-register"), 10))) {
    return { ok: false, error: "Too many attempts. Try again in 15 minutes." };
  }

  const parsed = registerSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const { name, email, phone, password } = parsed.data;
  try {
    const passwordHash = await hashPassword(password);
    await withDbRetry(async () =>
      db.insert(users).values({ name, email, phone: normalizePhone(phone), passwordHash }),
    );
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, error: "That email or mobile number is already registered." };
    }
    throw error;
  }

  return signInWithPassword(email, password);
}

export async function isGoogleEnabled() {
  return googleEnabled;
}

export async function loginWithGoogle(returnTo: string) {
  if (!googleEnabled) return;
  await signIn("google", { redirectTo: isSafePath(returnTo) ? returnTo : "/" });
}

export async function logoutCustomer() {
  await signOut({ redirectTo: "/" });
}

const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(120),
  phone: phoneSchema,
});

export async function updateProfile(_previous: AuthResult | null, form: FormData): Promise<AuthResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Log in to continue." };
  const userId = session.user.id;

  const parsed = profileSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const phone = normalizePhone(parsed.data.phone);
  try {
    await withDbRetry(async () => {
      const [current] = await db.select({ phone: users.phone }).from(users).where(eq(users.id, userId));
      await db
        .update(users)
        .set({
          name: parsed.data.name,
          phone,
          // A changed number has to be verified again.
          ...(current?.phone === phone ? {} : { phoneVerified: null }),
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    });
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, error: "That mobile number is already registered." };
    throw error;
  }

  revalidatePath("/account");
  return { ok: true };
}
