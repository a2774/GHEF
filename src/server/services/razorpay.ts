import { createHmac, timingSafeEqual } from "node:crypto";

const apiBase = "https://api.razorpay.com/v1";

export function razorpayEnabled() {
  return Boolean(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

function authHeader() {
  const credentials = `${process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`;
  return `Basic ${Buffer.from(credentials).toString("base64")}`;
}

export function signatureMatches(payload: string, signature: string, secret: string) {
  const expected = Buffer.from(createHmac("sha256", secret).update(payload).digest("hex"));
  const received = Buffer.from(signature);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export async function createRazorpayOrder(amountPaise: number, receipt: string) {
  const response = await fetch(`${apiBase}/orders`, {
    method: "POST",
    headers: { Authorization: authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify({ amount: amountPaise, currency: "INR", receipt }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`Razorpay order failed with status ${response.status}.`);
  return (await response.json()) as { id: string };
}

export async function fetchRazorpayPayment(paymentId: string) {
  const response = await fetch(`${apiBase}/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: authHeader() },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`Razorpay payment lookup failed with status ${response.status}.`);
  return (await response.json()) as { status: string; order_id: string; amount: number };
}
