import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/server/auth/admin-session";
import { listCategories } from "@/server/services/admin";

export default async function NewProductPage() {
  await requireAdmin();
  const categories = await listCategories();

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-semibold tracking-tight">New product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
