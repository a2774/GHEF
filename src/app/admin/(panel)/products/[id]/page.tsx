import { notFound } from "next/navigation";

import { ImageManager } from "@/components/admin/image-manager";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/server/auth/admin-session";
import { getAdminProduct, listCategories } from "@/server/services/admin";

export const instant = false;

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) notFound();
  const [result, categories] = await Promise.all([getAdminProduct(numericId), listCategories()]);
  if (!result) notFound();

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
          {result.product.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Edit specifications, upload gallery photos, and update variant sizing & inventory.
        </p>
      </div>
      <ImageManager productId={result.product.id} images={result.images} />
      <ProductForm categories={categories} product={result.product} variants={result.variants} />
    </div>
  );
}
