"use server";

import { eq, not } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { after } from "next/server";
import { z } from "zod";

import { isSafePath } from "@/lib/safe-path";
import { logAdminAction, requireAdmin } from "@/server/auth/admin-session";
import { hashPassword } from "@/server/auth/password";
import { db, withDbRetry } from "@/server/db";
import { adminUsers, banners, productVariants, reviews } from "@/server/db/schema";
import { productTabMaxLength, saveStoreSettings } from "@/server/services/settings";
import { sendBackInStockAlerts } from "@/server/services/stock-alerts";

const percent = z.coerce.number().min(0).max(90);
const optionalText = (max: number) => z.string().trim().max(max).optional().default("");

const settingsSchema = z.object({
  announcement: z.string().trim().max(160),
  brandName: optionalText(60),
  shipping: z.coerce.number().min(0).max(100_000),
  codEnabled: z.string().optional(),
  readyDispatchDays: z.coerce.number().int().min(0).max(30),
  madeToOrderDays: z.coerce.number().int().min(0).max(90),
  transitDays: z.coerce.number().int().min(0).max(30),
  bundle1Items: z.coerce.number().int().min(2).max(50),
  bundle1Percent: percent,
  bundle2Items: z.coerce.number().int().min(2).max(50),
  bundle2Percent: percent,
  valueMin: z.coerce.number().min(0).max(10_000_000),
  valuePercent: percent,
  prepaidPercent: z.coerce.number().min(0).max(50),
  maxDiscountPercent: percent,
  phone: optionalText(40),
  whatsapp: optionalText(40),
  address: optionalText(300),
  hours: optionalText(120),
  mapUrl: optionalText(500).refine((value) => !value || value.startsWith("https://"), "Use an https link."),
  instagram: optionalText(200).refine((value) => !value || value.startsWith("https://"), "Use an https link."),
  youtube: optionalText(200).refine((value) => !value || value.startsWith("https://"), "Use an https link."),
  tabShipping: optionalText(productTabMaxLength),
  tabReturns: optionalText(productTabMaxLength),
  tabCare: optionalText(productTabMaxLength),
});

export async function updateSettings(form: FormData) {
  const admin = await requireAdmin("owner");

  const parsed = settingsSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return;
  const data = parsed.data;

  await saveStoreSettings({
    announcement: data.announcement,
    brandName: data.brandName,
    codEnabled: data.codEnabled === "on",
    shippingPaise: Math.round(data.shipping * 100),
    readyDispatchDays: data.readyDispatchDays,
    madeToOrderDays: data.madeToOrderDays,
    transitDays: data.transitDays,
    offers: {
      bundleTiers: [
        { minItems: data.bundle1Items, percent: data.bundle1Percent },
        { minItems: data.bundle2Items, percent: data.bundle2Percent },
      ],
      valueTiers: [{ minPaise: Math.round(data.valueMin * 100), percent: data.valuePercent }],
      prepaidPercent: data.prepaidPercent,
      maxDiscountPercent: data.maxDiscountPercent,
    },
    store: {
      phone: data.phone,
      whatsapp: data.whatsapp,
      address: data.address,
      hours: data.hours,
      mapUrl: data.mapUrl,
      instagram: data.instagram,
      youtube: data.youtube,
    },
    productTabs: {
      shipping: data.tabShipping,
      returns: data.tabReturns,
      care: data.tabCare,
    },
  });
  await logAdminAction(admin, "update", "settings");
  updateTag("storefront");
  updateTag("products");
  updateTag("admin");
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
  updateTag("admin");
  revalidatePath("/admin/banners");
}

export async function toggleBanner(id: number) {
  const admin = await requireAdmin("admin");
  await withDbRetry(async () =>
    db.update(banners).set({ isActive: not(banners.isActive) }).where(eq(banners.id, id)),
  );
  await logAdminAction(admin, "toggle", "banner", id);
  updateTag("storefront");
  updateTag("admin");
  revalidatePath("/admin/banners");
}

export async function deleteBanner(id: number) {
  const admin = await requireAdmin("admin");
  await withDbRetry(async () => db.delete(banners).where(eq(banners.id, id)));
  await logAdminAction(admin, "delete", "banner", id);
  updateTag("storefront");
  updateTag("admin");
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
  if (stock.data > 0) after(() => sendBackInStockAlerts([variantId]));
  updateTag("products");
  updateTag("admin");
  revalidatePath("/admin/inventory");
}

export async function moderateReview(id: number, status: "approved" | "rejected") {
  const admin = await requireAdmin("staff");
  await withDbRetry(async () => db.update(reviews).set({ status }).where(eq(reviews.id, id)));
  await logAdminAction(admin, status, "review", id);
  updateTag("products");
  updateTag("admin");
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
  updateTag("admin");
  revalidatePath("/admin/team");
  return null;
}

export async function toggleTeamMember(id: number) {
  const admin = await requireAdmin("owner");
  await withDbRetry(async () =>
    db.update(adminUsers).set({ isActive: not(adminUsers.isActive) }).where(eq(adminUsers.id, id)),
  );
  await logAdminAction(admin, "toggle", "admin-user", id);
  updateTag("admin");
  revalidatePath("/admin/team");
}
