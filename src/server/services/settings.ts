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

export type StoreSettings = {
  announcement: string;
  codEnabled: boolean;
  shippingPaise: number;
  /** Working days to dispatch ready stock and made-to-order pieces. */
  readyDispatchDays: number;
  madeToOrderDays: number;
  transitDays: number;
  offers: OfferSettings;
  store: StoreInfo;
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

const keys = [
  "announcement",
  "codEnabled",
  "shippingPaise",
  "readyDispatchDays",
  "madeToOrderDays",
  "transitDays",
  "offers",
  "store",
];

export async function getStoreSettings(): Promise<StoreSettings> {
  const rows = await withDbRetry(async () =>
    db.select().from(storeSettings).where(inArray(storeSettings.key, keys)),
  );
  const values = new Map(rows.map(({ key, value }) => [key, value]));
  return {
    announcement: values.get("announcement") ?? "",
    codEnabled: values.get("codEnabled") !== "false",
    shippingPaise: Number(values.get("shippingPaise") ?? 0),
    readyDispatchDays: positiveInt(values.get("readyDispatchDays"), 1),
    madeToOrderDays: positiveInt(values.get("madeToOrderDays"), 6),
    transitDays: positiveInt(values.get("transitDays"), 5),
    offers: parseJson(values.get("offers"), offerSchema, defaultOfferSettings),
    store: { ...emptyStore, ...parseJson(values.get("store"), storeSchema.partial(), {}) },
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
