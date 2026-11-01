import { NextResponse } from "next/server";

import { consumeAttempt } from "@/server/auth/admin-session";
import { subscribeToNewsletter } from "@/server/services/newsletter";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!(await consumeAttempt(`newsletter:${ip}`, 10))) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : "";

  if (email.length > 254 || !emailPattern.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  await subscribeToNewsletter(email);
  return NextResponse.json({ subscribed: true });
}
