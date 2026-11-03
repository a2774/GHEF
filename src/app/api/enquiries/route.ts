import { NextResponse } from "next/server";

import { isEnquiryType } from "@/lib/catalog-taxonomy";
import { consumeAttempt } from "@/server/auth/admin-session";
import { createEnquiry } from "@/server/services/enquiries";
import { markAdminDataChanged } from "@/server/services/admin-cache";

const phonePattern = /^\+?[0-9 ()-]{7,20}$/;

function cleanText(value: unknown, maxLength: number) {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length <= maxLength ? text : "";
}

export async function POST(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for") ?? "local";
  const ip = forwardedFor.split(",")[0].trim();
  const allowed = await consumeAttempt(`enquiry:${ip}`, 10);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const type = body?.type;
  const name = cleanText(body?.name, 120);
  const phone = cleanText(body?.phone, 20);
  const message = cleanText(body?.message, 2000);

  if (!isEnquiryType(type) || !name || !phonePattern.test(phone) || !message) {
    return NextResponse.json(
      { error: "Add your name, phone number and a short message." },
      { status: 400 },
    );
  }

  try {
    await createEnquiry({ type, name, phone, message });
    markAdminDataChanged();
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Failed to create enquiry:", error);
    return NextResponse.json(
      { error: "Failed to process enquiry. Please try again." },
      { status: 500 },
    );
  }
}
