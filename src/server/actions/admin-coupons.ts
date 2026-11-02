"use server";

import { eq, not } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { logAdminAction, requireAdmin } from "@/server/auth/admin-session";
import { db, withDbRetry } from "@/server/db";
import { coupons } from "@/server/db/schema";

const couponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9-]{3,40}$/, "Code must be 3-40 alphanumeric characters or hyphens."),
    type: z.enum(["percent", "fixed"]),
    value: z.coerce.number().positive("Discount value must be greater than 0."),
    minCart: z.coerce.number().min(0).default(0),
    maxUses: z.preprocess((value) => value || undefined, z.coerce.number().int().positive().optional()),
    endsAt: z.preprocess((value) => value || undefined, z.coerce.date().optional()),
  })
  .refine(
    ({ type, value }) => type !== "percent" || value <= 100,
    { message: "Percentage discount cannot exceed 100%.", path: ["value"] }
  );

export async function createCoupon(
  previousOrForm: string | null | FormData,
  maybeForm?: FormData
) {
  const admin = await requireAdmin("admin");
  const form = maybeForm instanceof FormData ? maybeForm : (previousOrForm as FormData);

  const raw = Object.fromEntries(form.entries());
  const parsed = couponSchema.safeParse(raw);
  if (!parsed.success) {
    return parsed.error.issues[0]?.message || "Check the code, value and limits.";
  }

  const { code, type, value, minCart, maxUses, endsAt } = parsed.data;
  const inserted = await withDbRetry(async () =>
    db
      .insert(coupons)
      .values({
        code,
        type,
        value: type === "percent" ? Math.round(value) : Math.round(value * 100),
        minCartPaise: Math.round(minCart * 100),
        maxUses,
        endsAt,
      })
      .onConflictDoNothing()
      .returning({ id: coupons.id, code: coupons.code }),
  );
  if (inserted.length === 0) return "That coupon code already exists. Please choose another code.";

  await logAdminAction(admin, "create", "coupon", inserted[0].id, code);
  revalidatePath("/admin/coupons");
  return null;
}

export async function toggleCoupon(id: number) {
  const admin = await requireAdmin("admin");
  const [updated] = await withDbRetry(async () =>
    db
      .update(coupons)
      .set({ isActive: not(coupons.isActive) })
      .where(eq(coupons.id, id))
      .returning({ id: coupons.id, isActive: coupons.isActive, code: coupons.code }),
  );
  await logAdminAction(admin, "toggle", "coupon", id);
  revalidatePath("/admin/coupons");
  return updated;
}

export async function deleteCoupon(id: number) {
  const admin = await requireAdmin("admin");
  await withDbRetry(async () => db.delete(coupons).where(eq(coupons.id, id)));
  await logAdminAction(admin, "delete", "coupon", id);
  revalidatePath("/admin/coupons");
  return { success: true };
}
