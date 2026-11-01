"use server";

import { eq, not } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";

import { isSafePath } from "@/lib/safe-path";
import { logAdminAction, requireAdmin } from "@/server/auth/admin-session";
import { hashPassword } from "@/server/auth/password";
import { db, withDbRetry } from "@/server/db";
import { adminUsers, banners, productVariants, reviews } from "@/server/db/schema";
import { saveStoreSettings } from "@/server/services/settings";

const settingsSchema = z.object({
  announcement: z.string().trim().max(160),
  shipping: z.coerce.number().min(0).max(100_000),
  codEnabled: z.string().optional(),
});

export async function updateSettings(form: FormData) {
  const admin = await requireAdmin("owner");

  const parsed = settingsSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return;

  await saveStoreSettings({
    announcement: parsed.data.announcement,
    codEnabled: parsed.data.codEnabled === "on",
    shippingPaise: Math.round(parsed.data.shipping * 100),
  });
  await logAdminAction(admin, "update", "settings");
  updateTag("storefront");
  revalidatePath("/admin/settings");
}

const bannerSchema = z.object({
  title: z.string().trim().min(2).max(80),
  subtitle: z.string().trim().max(160).optional(),
  linkUrl: z.string().trim().refine(isSafePath),
  position: z.coerce.number().int().min(0).max(999).default(0),
});

export async function createBanner(form: FormData) {
  const admin = await requireAdmin("admin");

  const parsed = bannerSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return;

  const [banner] = await withDbRetry(async () =>
    db.insert(banners).values(parsed.data).returning({ id: banners.id }),
  );
  await logAdminAction(admin, "create", "banner", banner.id);
  updateTag("storefront");
  revalidatePath("/admin/banners");
}

export async function toggleBanner(id: number) {
  const admin = await requireAdmin("admin");
  await withDbRetry(async () =>
    db.update(banners).set({ isActive: not(banners.isActive) }).where(eq(banners.id, id)),
  );
  await logAdminAction(admin, "toggle", "banner", id);
  updateTag("storefront");
  revalidatePath("/admin/banners");
}

export async function deleteBanner(id: number) {
  const admin = await requireAdmin("admin");
  await withDbRetry(async () => db.delete(banners).where(eq(banners.id, id)));
  await logAdminAction(admin, "delete", "banner", id);
  updateTag("storefront");
  revalidatePath("/admin/banners");
}

export async function updateStock(variantId: number, form: FormData) {
  const admin = await requireAdmin("staff");

  const stock = z.coerce.number().int().min(0).max(100_000).safeParse(form.get("stock"));
  if (!stock.success) return;

  await withDbRetry(async () =>
    db.update(productVariants).set({ stock: stock.data }).where(eq(productVariants.id, variantId)),
  );
  await logAdminAction(admin, "update-stock", "variant", variantId, String(stock.data));
  updateTag("products");
  revalidatePath("/admin/inventory");
}

export async function moderateReview(id: number, status: "approved" | "rejected") {
  const admin = await requireAdmin("staff");
  await withDbRetry(async () => db.update(reviews).set({ status }).where(eq(reviews.id, id)));
  await logAdminAction(admin, status, "review", id);
  updateTag("products");
  revalidatePath("/admin/reviews");
}

const teamSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().trim().toLowerCase(),
  password: z.string().min(12).max(128),
  role: z.enum(["admin", "staff"]),
});

export async function createTeamMember(_previous: string | null, form: FormData) {
  const admin = await requireAdmin("owner");

  const parsed = teamSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return "Check the details. The password needs at least 12 characters.";

  const { password, ...member } = parsed.data;
  const passwordHash = await hashPassword(password);
  const inserted = await withDbRetry(async () =>
    db
      .insert(adminUsers)
      .values({ ...member, passwordHash })
      .onConflictDoNothing()
      .returning({ id: adminUsers.id }),
  );
  if (inserted.length === 0) return "That email already has an admin account.";

  await logAdminAction(admin, "create", "admin-user", inserted[0].id, member.role);
  revalidatePath("/admin/team");
  return null;
}

export async function toggleTeamMember(id: number) {
  const admin = await requireAdmin("owner");
  await withDbRetry(async () =>
    db.update(adminUsers).set({ isActive: not(adminUsers.isActive) }).where(eq(adminUsers.id, id)),
  );
  await logAdminAction(admin, "toggle", "admin-user", id);
  revalidatePath("/admin/team");
}
