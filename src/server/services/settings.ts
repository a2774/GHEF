import { asc, eq, inArray } from "drizzle-orm";

import { db, withDbRetry } from "@/server/db";
import { banners, storeSettings } from "@/server/db/schema";

export type StoreSettings = {
  announcement: string;
  codEnabled: boolean;
  shippingPaise: number;
};

const keys = ["announcement", "codEnabled", "shippingPaise"];

export async function getStoreSettings(): Promise<StoreSettings> {
  const rows = await withDbRetry(async () =>
    db.select().from(storeSettings).where(inArray(storeSettings.key, keys)),
  );
  const values = new Map(rows.map(({ key, value }) => [key, value]));
  return {
    announcement: values.get("announcement") ?? "",
    codEnabled: values.get("codEnabled") !== "false",
    shippingPaise: Number(values.get("shippingPaise") ?? 0),
  };
}

export async function saveStoreSettings(settings: StoreSettings) {
  await withDbRetry(async () =>
    db.transaction(async (tx) => {
      for (const [key, value] of Object.entries(settings)) {
        await tx
          .insert(storeSettings)
          .values({ key, value: String(value) })
          .onConflictDoUpdate({
            target: storeSettings.key,
            set: { value: String(value), updatedAt: new Date() },
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
