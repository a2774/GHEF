import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { requireAdmin } from "@/server/auth/admin-session";
import { listAdminProducts } from "@/server/services/admin";

export default async function AdminProductsPage() {
  await requireAdmin();
  const products = await listAdminProducts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-4xl font-semibold tracking-tight">Products</h1>
        <Link
          href="/admin/products/new"
          className={buttonVariants({ className: "h-11 rounded-full px-6 text-base" })}
        >
          New product
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-card">
        <table className="w-full min-w-[640px] text-left text-base">
          <thead className="text-muted-foreground">
            <tr>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Variants</th>
              <th className="p-4 font-medium">Stock</th>
              <th className="p-4 font-medium">Labels</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-border">
                <td className="p-4">
                  <Link href={`/admin/products/${product.id}`} className="font-medium underline-offset-4 hover:underline">
                    {product.title}
                  </Link>
                </td>
                <td className="p-4">{product.category}</td>
                <td className="p-4 capitalize">{product.status}</td>
                <td className="p-4">{product.variantCount}</td>
                <td className="p-4">{product.stock}</td>
                <td className="p-4">
                  {[product.isFeatured && "Featured", product.isBestseller && "Bestseller"]
                    .filter(Boolean)
                    .join(", ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
