import { NextResponse } from "next/server";

import { consumeAttempt } from "@/server/auth/admin-session";
import { subscribeToNewsletter } from "@/server/services/newsletter";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for") ?? "local";
  const ip = forwardedFor.split(",")[0].trim();
  const allowed = await consumeAttempt(`newsletter:${ip}`, 10);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : "";

  if (email.length > 254 || !emailPattern.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  try {
    await subscribeToNewsletter(email);
    return NextResponse.json({ subscribed: true });
  } catch (error) {
    console.error("Failed to subscribe to newsletter:", error);
    return NextResponse.json(
      { error: "Failed to process subscription. Please try again." },
      { status: 500 },
    );
  }
}
