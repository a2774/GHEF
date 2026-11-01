import { notFound } from "next/navigation";

import { ImageManager } from "@/components/admin/image-manager";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/server/auth/admin-session";
import { getAdminProduct, listCategories } from "@/server/services/admin";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [result, categories] = await Promise.all([getAdminProduct(Number(id)), listCategories()]);
  if (!result) notFound();

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-semibold tracking-tight">{result.product.title}</h1>
      <ImageManager productId={result.product.id} images={result.images} />
      <ProductForm categories={categories} product={result.product} variants={result.variants} />
    </div>
  );
}
