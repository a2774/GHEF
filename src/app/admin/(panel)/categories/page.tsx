import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCategory, deleteCategory } from "@/server/actions/admin-products";
import { requireAdmin } from "@/server/auth/admin-session";
import { listCategories } from "@/server/services/admin";

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
    <div className="max-w-2xl space-y-6">
      <h1 className="text-4xl font-semibold tracking-tight">Categories</h1>

      <form action={createCategory} className="flex flex-wrap gap-2">
        <Input
          name="name"
          required
          aria-label="Category name"
          placeholder="New category"
          className="h-11 min-w-48 flex-1 rounded-xl bg-card px-3 text-base md:text-base"
        />
        <select
          name="parentId"
          aria-label="Parent category"
          className="h-11 rounded-xl border border-input bg-card px-3 text-base"
        >
          <option value="">Top level</option>
          {parents.map(({ id, name }) => (
            <option key={id} value={id}>
              Under {name}
            </option>
          ))}
        </select>
        <Button type="submit" className="h-11 rounded-full px-6 text-base">
          Add
        </Button>
      </form>

      <ul className="rounded-2xl bg-card">
        {ordered.map(({ id, name, parentId, productCount }) => (
          <li
            key={id}
            className={`flex items-center justify-between gap-4 border-t border-border p-4 text-base first:border-t-0 ${parentId ? "pl-10" : ""}`}
          >
            <span>
              {name}
              <span className="ml-2 text-muted-foreground">
                {productCount} {productCount === 1 ? "product" : "products"}
              </span>
            </span>
            {productCount === 0 && !hasChildren.has(id) && (
              <form action={deleteCategory.bind(null, id)}>
                <Button type="submit" variant="destructive" className="h-10 rounded-full px-4 text-base">
                  Delete
                </Button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
