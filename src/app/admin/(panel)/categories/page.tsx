import { FolderPlus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCategory, deleteCategory } from "@/server/actions/admin-products";
import { requireAdmin } from "@/server/auth/admin-session";
import { listCategories } from "@/server/services/admin";

export const instant = false;

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const categories = await listCategories();
  const parents = categories.filter(({ parentId }) => parentId === null);
  const hasChildren = new Set(categories.map(({ parentId }) => parentId));
  const ordered = parents.flatMap((parent) => [
    parent,
    ...categories.filter(({ parentId }) => parentId === parent.id),
  ]);

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

      {/* Add Category Form */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <FolderPlus className="size-4 text-slate-700" />
          <span>Add New Category</span>
        </h2>
        <form action={createCategory} className="flex flex-wrap items-center gap-2.5">
          <Input
            name="name"
            required
            aria-label="Category name"
            placeholder="Category name (e.g. Hand-Knotted, Jute & Natural)..."
            className="h-9 min-w-48 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-xs shadow-2xs focus:border-[#bef264]"
          />
          <select
            name="parentId"
            aria-label="Parent category"
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-2xs focus:border-[#bef264] focus:outline-none"
          >
            <option value="">Top Level (Parent)</option>
            {parents.map(({ id, name }) => (
              <option key={id} value={id}>
                Under {name}
              </option>
            ))}
          </select>
          <Button
            type="submit"
            className="h-9 rounded-full bg-[#bef264] px-5 text-xs font-bold text-slate-950 shadow-xs hover:bg-[#a3e635] cursor-pointer"
          >
            Add Category
          </Button>
        </form>
      </div>

      {/* Category Hierarchy List */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Existing Collections ({ordered.length})
        </div>
        <ul className="divide-y divide-slate-100">
          {ordered.map(({ id, name, parentId, productCount }) => (
            <li
              key={id}
              className={`flex items-center justify-between gap-4 p-4 text-xs transition-colors hover:bg-slate-50/60 ${
                parentId ? "pl-10 bg-slate-50/30" : "font-semibold text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2">
                {parentId && <span className="text-slate-300 font-mono">└</span>}
                <span className="text-slate-900 font-medium">{name}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-mono text-slate-500">
                  {productCount} {productCount === 1 ? "rug" : "rugs"}
                </span>
              </div>
              {productCount === 0 && !hasChildren.has(id) && (
                <form action={deleteCategory.bind(null, id)}>
                  <button
                    type="submit"
                    aria-label={`Delete ${name}`}
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                  >
                    <Trash2 className="size-3" />
                    <span>Delete</span>
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
