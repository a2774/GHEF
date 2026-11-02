import { asc, eq } from "drizzle-orm";

import { InventoryClient } from "@/components/admin/inventory-client";
import { requireAdmin } from "@/server/auth/admin-session";
import { db, withDbRetry } from "@/server/db";
import { products, productVariants } from "@/server/db/schema";

export const instant = false;

export default async function AdminInventoryPage() {
  await requireAdmin();
  const rows = await withDbRetry(async () =>
    db
      .select({
        id: productVariants.id,
        title: products.title,
        size: productVariants.size,
        color: productVariants.color,
        sku: productVariants.sku,
        stock: productVariants.stock,
      })
      .from(productVariants)
      .innerJoin(products, eq(productVariants.productId, products.id))
      .orderBy(asc(productVariants.stock), asc(products.title)),
  );

  return <InventoryClient initialRows={rows} />;
}
