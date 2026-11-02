import { CategoryManager } from "@/components/admin/category-manager";
import { requireAdmin } from "@/server/auth/admin-session";
import { listCategories } from "@/server/services/admin";

export const instant = false;

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const categories = await listCategories();

  return (
    <div className="max-w-3xl space-y-6 pb-12">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
          Categories & Taxonomy
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Structure your handmade carpet collections, parent categories, and artisan weave classifications.
        </p>
      </div>

      <CategoryManager categories={categories} />
    </div>
  );
}
