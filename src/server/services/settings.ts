import { asc, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { db, withDbRetry } from "@/server/db";
import { banners, storeSettings } from "@/server/db/schema";

import { defaultOfferSettings, type OfferSettings } from "./pricing";

export type StoreInfo = {
  phone: string;
  whatsapp: string;
  address: string;
  hours: string;
  mapUrl: string;
  instagram: string;
  youtube: string;
};

/** Text for the tabs under every product. A blank field falls back to the automatic text. */
export type ProductTabsText = {
  shipping: string;
  returns: string;
  care: string;
};

export type StoreSettings = {
  announcement: string;
  /** Shown as "Brand: …" under product titles. Blank means the site name. */
  brandName: string;
  codEnabled: boolean;
  shippingPaise: number;
  /** Working days to dispatch ready stock and made-to-order pieces. */
  readyDispatchDays: number;
  madeToOrderDays: number;
  transitDays: number;
  offers: OfferSettings;
  store: StoreInfo;
  productTabs: ProductTabsText;
};

const emptyStore: StoreInfo = {
  phone: "",
  whatsapp: "",
  address: "",
  hours: "",
  mapUrl: "",
  instagram: "",
  youtube: "",
};

/** Most characters an owner can write in each product tab box. */
export const productTabMaxLength = 120;

const emptyProductTabs: ProductTabsText = { shipping: "", returns: "", care: "" };

const productTabsSchema = z.object({
  shipping: z.string().max(5000),
  returns: z.string().max(5000),
  care: z.string().max(5000),
});

const offerSchema = z.object({
  bundleTiers: z
    .array(z.object({ minItems: z.number().int().min(2).max(50), percent: z.number().min(0).max(90) }))
    .max(5),
  valueTiers: z
    .array(z.object({ minPaise: z.number().int().min(0), percent: z.number().min(0).max(90) }))
    .max(5),
  prepaidPercent: z.number().min(0).max(50),
  maxDiscountPercent: z.number().min(0).max(90),
});

const storeSchema = z.object({
  phone: z.string().max(40),
  whatsapp: z.string().max(40),
  address: z.string().max(300),
  hours: z.string().max(120),
  mapUrl: z.string().max(500),
  instagram: z.string().max(200),
  youtube: z.string().max(200),
});

function parseJson<T>(raw: string | undefined, schema: z.ZodType<T>, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = schema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : fallback;
  } catch {
    return fallback;
  }
}

function positiveInt(raw: string | undefined, fallback: number) {
  const value = Number(raw);
  return Number.isInteger(value) && value >= 0 ? value : fallback;
}

// Text saved before the limit existed is cut to fit, so the admin form can be saved again.
function limitTabs(tabs: ProductTabsText): ProductTabsText {
  return {
    shipping: tabs.shipping.slice(0, productTabMaxLength),
    returns: tabs.returns.slice(0, productTabMaxLength),
    care: tabs.care.slice(0, productTabMaxLength),
  };
}

const keys = [
  "announcement",
  "brandName",
  "codEnabled",
  "shippingPaise",
  "readyDispatchDays",
  "madeToOrderDays",
  "transitDays",
  "offers",
  "store",
  "productTabs",
];

export async function getStoreSettings(): Promise<StoreSettings> {
  const rows = await withDbRetry(async () =>
    db.select().from(storeSettings).where(inArray(storeSettings.key, keys)),
  );
  const values = new Map(rows.map(({ key, value }) => [key, value]));
  return {
    announcement: values.get("announcement") ?? "",
    brandName: values.get("brandName") ?? "",
    codEnabled: values.get("codEnabled") !== "false",
    shippingPaise: Number(values.get("shippingPaise") ?? 0),
    readyDispatchDays: positiveInt(values.get("readyDispatchDays"), 1),
    madeToOrderDays: positiveInt(values.get("madeToOrderDays"), 6),
    transitDays: positiveInt(values.get("transitDays"), 5),
    offers: parseJson(values.get("offers"), offerSchema, defaultOfferSettings),
    store: { ...emptyStore, ...parseJson(values.get("store"), storeSchema.partial(), {}) },
    productTabs: limitTabs({
      ...emptyProductTabs,
      ...parseJson(values.get("productTabs"), productTabsSchema.partial(), {}),
    }),
  };
}

export async function saveStoreSettings(settings: Partial<StoreSettings>) {
  await withDbRetry(async () =>
    db.transaction(async (tx) => {
      for (const [key, raw] of Object.entries(settings)) {
        if (raw === undefined) continue;
        const value = typeof raw === "object" ? JSON.stringify(raw) : String(raw);
        await tx
          .insert(storeSettings)
          .values({ key, value })
          .onConflictDoUpdate({
            target: storeSettings.key,
            set: { value, updatedAt: new Date() },
          });
      }
    }),
  );
}

export async function getActiveBanners() {
  return withDbRetry(async () =>
    db
      .select()
      .from(banners)
      .where(eq(banners.isActive, true))
      .orderBy(asc(banners.position), asc(banners.id)),
  );
}
