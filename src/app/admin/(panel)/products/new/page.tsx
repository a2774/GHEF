import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/server/auth/admin-session";
import { listCategories } from "@/server/services/admin";

export const instant = false;

export default async function NewProductPage() {
  await requireAdmin();
  const categories = await listCategories();

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
          Create Handcrafted Rug
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Add a new rug to your catalog with artisan details, multiple sizes, pricing, and high-res imagery.
        </p>
      </div>
      <ProductForm categories={categories} />
    </div>
  );
}
