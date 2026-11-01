import { NextResponse } from "next/server";

import { subscribeToNewsletter } from "@/server/services/newsletter";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : "";

  if (email.length > 254 || !emailPattern.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  await subscribeToNewsletter(email);
  return NextResponse.json({ subscribed: true });
}
