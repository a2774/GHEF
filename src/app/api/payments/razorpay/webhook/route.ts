import { NextResponse } from "next/server";

import { markPaymentFailed, markPaymentPaid } from "@/server/services/orders";
import { signatureMatches } from "@/server/services/razorpay";
import { markAdminDataChanged } from "@/server/services/admin-cache";

type WebhookEvent = {
  event?: string;
  payload?: { payment?: { entity?: { id?: string; order_id?: string } } };
};

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });

  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  if (!signatureMatches(body, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let event: WebhookEvent;
  try {
    event = JSON.parse(body) as WebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const payment = event.payload?.payment?.entity;
  if (payment?.id && payment.order_id) {
    if (event.event === "payment.captured") await markPaymentPaid(payment.order_id, payment.id);
    if (event.event === "payment.failed") await markPaymentFailed(payment.order_id);
    markAdminDataChanged();
  }
  return NextResponse.json({ received: true });
}
