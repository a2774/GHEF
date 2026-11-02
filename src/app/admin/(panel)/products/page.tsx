import { Plus } from "lucide-react";
import Link from "next/link";

import { requireAdmin } from "@/server/auth/admin-session";
import { listAdminProducts } from "@/server/services/admin";

export const instant = false;

export default async function AdminProductsPage() {
  await requireAdmin();
  const products = await listAdminProducts();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
            Products
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your handcrafted rug catalog, sizes, inventory levels, and merchandising badges.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-[#bef264] px-4 py-2 text-xs font-semibold text-slate-950 shadow-xs hover:bg-[#a3e635] transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="size-3.5" />
          <span>New Product</span>
        </Link>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
        <table className="w-full min-w-[640px] text-left text-sm text-slate-700">
          <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3.5">Product Title</th>
              <th className="px-5 py-3.5">Category</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Variants</th>
              <th className="px-5 py-3.5">Total Stock</th>
              <th className="px-5 py-3.5">Badges</th>
              <th className="px-5 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-sm text-slate-500">
                  No products in the catalog yet.
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const isActive = product.status === "active";
                const isLowStock = product.stock <= 3;
                return (
                  <tr key={product.id} className="transition-colors hover:bg-slate-50/60">
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="hover:text-slate-950 hover:underline"
                      >
                        {product.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      {product.category}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-600">
                      {product.variantCount} sizes
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium font-mono ${
                          isLowStock
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-slate-50 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {product.stock} units
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {product.isFeatured && (
                          <span className="inline-flex items-center rounded-full bg-[#bef264] px-2 py-0.5 text-[10px] font-bold text-slate-950 shadow-2xs">
                            Featured
                          </span>
                        )}
                        {product.isBestseller && (
                          <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-900 px-2 py-0.5 text-[10px] font-semibold border border-amber-200">
                            Bestseller
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-2xs hover:bg-[#0B0F19] hover:text-white hover:border-[#0B0F19] transition-all"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
