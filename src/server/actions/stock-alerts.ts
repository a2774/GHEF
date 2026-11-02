"use server";

import { headers } from "next/headers";
import { z } from "zod";

import { consumeAttempt } from "@/server/auth/admin-session";
import { addStockAlert } from "@/server/services/stock-alerts";

const schema = z.object({
  variantId: z.number().int().positive(),
  email: z.email().max(200),
});

export async function requestStockAlert(input: { variantId: number; email: string }) {
  const parsed = schema.safeParse({ ...input, email: input.email?.trim().toLowerCase() });
  if (!parsed.success) return { ok: false as const, error: "Enter a valid email address." };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  if (!(await consumeAttempt(`stock-alert:${ip}`, 10))) {
    return { ok: false as const, error: "Too many requests. Try again later." };
  }

  const saved = await addStockAlert(parsed.data.variantId, parsed.data.email);
  return saved
    ? { ok: true as const }
    : { ok: false as const, error: "This item is no longer available." };
}
