"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  clearAttempts,
  consumeAttempt,
  createAdminSession,
  destroyAdminSession,
  findAdmin,
  logAdminAction,
} from "@/server/auth/admin-session";

const accountKey = "admin-login:account";

export async function login(_previous: string | null, form: FormData) {
  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipKey = `admin-login:ip:${ip}`;

  const ipAllowed = await consumeAttempt(ipKey, 5);
  const accountAllowed = await consumeAttempt(accountKey, 25);
  if (!ipAllowed || !accountAllowed) {
    return "Too many attempts. Try again in 15 minutes.";
  }

  const admin = await findAdmin(String(form.get("email") ?? ""), String(form.get("password") ?? ""));
  if (!admin) return "Incorrect email or password.";

  await Promise.all([clearAttempts(ipKey), clearAttempts(accountKey)]);
  await createAdminSession(admin);
  await logAdminAction(admin, "login", "session");
  redirect("/admin");
}

export async function logout() {
  await destroyAdminSession();
  redirect("/admin/login");
}
