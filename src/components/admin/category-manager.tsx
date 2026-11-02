"use client";

import * as React from "react";
import { FolderPlus, Loader2, Lock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { toast } from "@/components/ui/sonner";
import { createCategory, deleteCategory } from "@/server/actions/admin-products";

interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  productCount: number;
}

interface CategoryManagerProps {
  categories: Category[];
}

export function CategoryManager({ categories }: CategoryManagerProps) {
  const [name, setName] = React.useState("");
  const [parentId, setParentId] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const parents = categories.filter((c) => c.parentId === null);
  const hasChildren = new Set(categories.map((c) => c.parentId).filter(Boolean));
  const ordered = parents.flatMap((parent) => [
    parent,
    ...categories.filter((c) => c.parentId === parent.id),
  ]);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Please enter a category name");
      toast.error("Category name cannot be empty");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("name", name.trim());
      if (parentId) formData.set("parentId", parentId);

      await createCategory(formData);
      toast.success(`Category "${name.trim()}" created successfully!`);
      setName("");
      setParentId("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create category";
      toast.error(msg);
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Category Form */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <FolderPlus className="size-4 text-slate-700" />
          <span>Add New Category</span>
        </h2>
        <form noValidate onSubmit={handleCreate} className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="min-w-48 flex-1">
              <Input
                name="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                disabled={isSubmitting}
                aria-label="Category name"
                placeholder="Category name (e.g. Hand-Knotted, Jute & Natural)..."
                className={`h-9 w-full rounded-xl border bg-white px-3 text-xs shadow-2xs focus:border-[#bef264] transition-colors ${
                  errorMessage ? "border-rose-400 focus:border-rose-500 bg-rose-50/20" : "border-slate-200"
                }`}
              />
            </div>
            <select
              name="parentId"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              disabled={isSubmitting}
              aria-label="Parent category"
              className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-2xs focus:border-[#bef264] focus:outline-none transition-colors"
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
              disabled={isSubmitting}
              className="h-9 rounded-full bg-[#bef264] px-5 text-xs font-bold text-slate-950 shadow-xs hover:bg-[#a3e635] cursor-pointer disabled:opacity-60 inline-flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <span>Add Category</span>
              )}
            </Button>
          </div>
          {errorMessage && (
            <p className="text-[11px] font-medium text-rose-600 pl-1">{errorMessage}</p>
          )}
        </form>
      </div>

      {/* Category Hierarchy List */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Existing Collections ({ordered.length})
        </div>
        <ul className="divide-y divide-slate-100">
          {ordered.map(({ id, name, parentId, productCount }) => {
            const hasSub = hasChildren.has(id);
            const canDelete = productCount === 0 && !hasSub;

            return (
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

                <div className="flex items-center gap-2">
                  {canDelete ? (
                    <ConfirmDeleteDialog
                      title="Delete Category?"
                      itemName={name}
                      description={`Are you sure you want to delete the category "${name}"? This action cannot be undone.`}
                      confirmText="Delete Category"
                      successMessage={`Category "${name}" deleted`}
                      onConfirm={async () => {
                        await deleteCategory(id);
                      }}
                      trigger={
                        <button
                          type="button"
                          aria-label={`Delete ${name}`}
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                        >
                          <Trash2 className="size-3" />
                          <span>Delete</span>
                        </button>
                      }
                    />
                  ) : (
                    <span
                      title={
                        productCount > 0
                          ? `In use by ${productCount} ${productCount === 1 ? "rug" : "rugs"}`
                          : "Has subcategories"
                      }
                      className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-400 cursor-not-allowed"
                    >
                      <Lock className="size-2.5" />
                      <span>{productCount > 0 ? "In Use" : "Has Children"}</span>
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
