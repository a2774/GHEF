import { asc, eq } from "drizzle-orm";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateStock } from "@/server/actions/admin-modules";
import { requireAdmin } from "@/server/auth/admin-session";
import { db, withDbRetry } from "@/server/db";
import { products, productVariants } from "@/server/db/schema";

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

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-semibold tracking-tight">Inventory</h1>
      <ul className="rounded-2xl bg-card">
        {rows.map((row) => (
          <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4 text-base first:border-t-0">
            <span>
              {row.title}, {row.color}, {row.size}
              <span className="ml-2 text-muted-foreground">{row.sku}</span>
            </span>
            <form key={row.stock} action={updateStock.bind(null, row.id)} className="flex gap-2">
              <Input
                name="stock"
                type="number"
                min="0"
                step="1"
                required
                defaultValue={row.stock}
                aria-label={`Stock for ${row.sku}`}
                className="h-11 w-24 rounded-xl px-3 text-base md:text-base"
              />
              <Button type="submit" variant="outline" className="h-11 rounded-full px-5 text-base">
                Save
              </Button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
