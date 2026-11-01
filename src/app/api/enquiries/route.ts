import { NextResponse } from "next/server";

import { consumeAttempt } from "@/server/auth/admin-session";
import { createEnquiry } from "@/server/services/enquiries";

const phonePattern = /^\+?[0-9 ()-]{7,20}$/;

function cleanText(value: unknown, maxLength: number) {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length <= maxLength ? text : "";
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!(await consumeAttempt(`enquiry:${ip}`, 10))) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const type = body?.type;
  const name = cleanText(body?.name, 120);
  const phone = cleanText(body?.phone, 20);
  const message = cleanText(body?.message, 2000);

  if ((type !== "custom" && type !== "bulk") || !name || !phonePattern.test(phone) || !message) {
    return NextResponse.json(
      { error: "Add your name, phone number and a short message." },
      { status: 400 },
    );
  }

  await createEnquiry({ type, name, phone, message });
  return NextResponse.json({ received: true });
}
