import { asc, eq } from "drizzle-orm";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateStock } from "@/server/actions/admin-modules";
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

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
          Warehouse Inventory & Stock
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Quickly adjust on-hand inventory levels for handcrafted rug variants and prevent overselling.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
          <span>All Variants ({rows.length})</span>
          <span className="text-[10px] text-slate-400">Lowest Stock First</span>
        </div>

        <ul className="divide-y divide-slate-100">
          {rows.map((row) => {
            const isLow = row.stock <= 3;
            return (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4 text-xs transition-colors hover:bg-slate-50/60"
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-900 flex items-center gap-2">
                    <span>{row.title}</span>
                    {isLow && (
                      <span className="inline-flex items-center rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                        Low Stock
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-[11px] font-mono">
                    <span>{row.color}</span>
                    <span>•</span>
                    <span>{row.size}</span>
                    <span>•</span>
                    <span>SKU: {row.sku}</span>
                  </div>
                </div>

                <form
                  key={row.stock}
                  action={updateStock.bind(null, row.id)}
                  className="flex items-center gap-2"
                >
                  <Input
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    required
                    defaultValue={row.stock}
                    aria-label={`Stock for ${row.sku}`}
                    className="h-8 w-20 rounded-lg border-slate-200 bg-white px-2.5 text-xs font-mono font-medium shadow-2xs"
                  />
                  <Button
                    type="submit"
                    size="xs"
                    className="rounded-lg bg-[#0B0F19] text-white hover:bg-[#1a233a] font-medium text-xs px-3"
                  >
                    Save
                  </Button>
                </form>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
