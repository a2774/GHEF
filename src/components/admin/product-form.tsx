"use client";

import { Plus, Trash2 } from "lucide-react";
import { type FormEvent, useState, useTransition } from "react";

import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteProduct, type ProductInput, saveProduct } from "@/server/actions/admin-products";
import type { products, productVariants } from "@/server/db/schema";

type VariantRow = {
  key: number;
  id?: number;
  size: string;
  color: string;
  sku: string;
  price: string;
  mrp: string;
  stock: string;
};

const fieldClass = "h-11 rounded-xl bg-card px-3 text-base md:text-base";
const selectClass = "h-11 w-full rounded-xl border border-input bg-card px-3 text-base";

function toRupees(paise: number) {
  return String(paise / 100);
}

function toPaise(rupees: string) {
  const value = Number(rupees);
  return Number.isFinite(value) && value >= 0 ? Math.round(value * 100) : 0;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-base font-medium">{label}</span>
      {children}
    </label>
  );
}

export function ProductForm({
  categories,
  product,
  variants = [],
}: {
  categories: { id: number; name: string }[];
  product?: typeof products.$inferSelect;
  variants?: (typeof productVariants.$inferSelect)[];
}) {
  const [rows, setRows] = useState<VariantRow[]>(
    variants.length > 0
      ? variants.map((variant) => ({
          key: variant.id,
          id: variant.id,
          size: variant.size,
          color: variant.color,
          sku: variant.sku,
          price: toRupees(variant.pricePaise),
          mrp: toRupees(variant.mrpPaise),
          stock: String(variant.stock),
        }))
      : [{ key: 1, size: "", color: "", sku: "", price: "", mrp: "", stock: "0" }],
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function updateRow(key: number, field: keyof VariantRow, value: string) {
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, [field]: value } : row)),
    );
  }

  function addRow() {
    setRows((current) => [
      ...current,
      {
        key: Math.max(0, ...current.map(({ key }) => key)) + 1,
        size: "",
        color: "",
        sku: "",
        price: "",
        mrp: "",
        stock: "0",
      },
    ]);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const input: ProductInput = {
      id: product?.id,
      title: String(form.get("title")),
      slug: String(form.get("slug")),
      description: String(form.get("description")),
      material: String(form.get("material")),
      categoryId: Number(form.get("categoryId")),
      status: form.get("status") as ProductInput["status"],
      isFeatured: form.get("isFeatured") === "on",
      isBestseller: form.get("isBestseller") === "on",
      variants: rows.map(({ id, size, color, sku, price, mrp, stock }) => ({
        id,
        size,
        color,
        sku,
        pricePaise: toPaise(price),
        mrpPaise: toPaise(mrp),
        stock: Number(stock),
      })),
    };

    setSaved(false);
    startTransition(async () => {
      const message = await saveProduct(input);
      setError(message);
      setSaved(!message);
      if (message) {
        toast.error(message);
      } else {
        toast.success(product ? "Product saved successfully!" : "Product created successfully!");
      }
    });
  }

  const handleDelete = async () => {
    if (!product) return;
    await deleteProduct(product.id);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="grid gap-4 rounded-2xl bg-muted p-5 md:grid-cols-2">
        <Field label="Name">
          <Input name="title" required defaultValue={product?.title} className={fieldClass} />
        </Field>
        <Field label="URL slug">
          <Input name="slug" defaultValue={product?.slug} placeholder="Made from the name if empty" className={fieldClass} />
        </Field>
        <Field label="Category">
          <select name="categoryId" required defaultValue={product?.categoryId} className={selectClass}>
            {categories.map(({ id, name }) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Material">
          <Input name="material" required defaultValue={product?.material} className={fieldClass} />
        </Field>
        <div className="md:col-span-2">
          <Field label="Description">
            <textarea
              name="description"
              required
              rows={4}
              defaultValue={product?.description}
              className="w-full rounded-xl border border-input bg-card p-3 text-base"
            />
          </Field>
        </div>
        <Field label="Status">
          <select name="status" defaultValue={product?.status ?? "draft"} className={selectClass}>
            <option value="draft">Draft (unpublished)</option>
            <option value="active">Published</option>
            <option value="archived">Archived</option>
          </select>
        </Field>
        <div className="flex items-end gap-6 pb-2.5">
          <label className="flex items-center gap-2 text-base">
            <input type="checkbox" name="isFeatured" defaultChecked={product?.isFeatured} className="size-5" />
            Featured
          </label>
          <label className="flex items-center gap-2 text-base">
            <input type="checkbox" name="isBestseller" defaultChecked={product?.isBestseller} className="size-5" />
            Bestseller
          </label>
        </div>
      </section>

      <section className="rounded-2xl bg-muted p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">Variants</h2>
          <Button type="button" variant="outline" onClick={addRow} className="h-10 rounded-full px-4 text-base">
            <Plus data-icon="inline-start" />
            Add variant
          </Button>
        </div>
        <p className="mt-1 text-base text-muted-foreground">
          Sale price is what customers pay. Regular price is the full price.
        </p>
        <div className="mt-4 space-y-3">
          {rows.map((row) => (
            <div key={row.key} className="grid grid-cols-2 gap-2 rounded-xl bg-background p-3 lg:grid-cols-[1fr_1fr_1.2fr_1fr_1fr_0.7fr_auto]">
              <Input aria-label="Size" placeholder="Size, e.g. 5 x 7 ft" value={row.size} onChange={(e) => updateRow(row.key, "size", e.target.value)} className={fieldClass} />
              <Input aria-label="Colour" placeholder="Colour" value={row.color} onChange={(e) => updateRow(row.key, "color", e.target.value)} className={fieldClass} />
              <Input aria-label="SKU" placeholder="SKU" value={row.sku} onChange={(e) => updateRow(row.key, "sku", e.target.value)} className={fieldClass} />
              <Input aria-label="Sale price in rupees" type="number" min="0" step="0.01" placeholder="Sale ₹" value={row.price} onChange={(e) => updateRow(row.key, "price", e.target.value)} className={fieldClass} />
              <Input aria-label="Regular price in rupees" type="number" min="0" step="0.01" placeholder="Regular ₹" value={row.mrp} onChange={(e) => updateRow(row.key, "mrp", e.target.value)} className={fieldClass} />
              <Input aria-label="Stock" type="number" min="0" step="1" placeholder="Stock" value={row.stock} onChange={(e) => updateRow(row.key, "stock", e.target.value)} className={fieldClass} />
              <Button
                type="button"
                variant="ghost"
                aria-label="Remove variant"
                disabled={rows.length === 1}
                onClick={() => setRows((current) => current.filter(({ key }) => key !== row.key))}
                className="size-11"
              >
                <Trash2 />
              </Button>
            </div>
          ))}
        </div>
      </section>

      {error && (
        <p role="alert" className="text-base text-destructive">
          {error}
        </p>
      )}
      {saved && <p role="status" className="text-base">Saved.</p>}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending} className="h-12 rounded-full px-8 text-base">
          {product ? "Save changes" : "Create product"}
        </Button>
        {product && (
          <ConfirmDeleteDialog
            title="Delete Product?"
            itemName={product.title}
            description={`Are you sure you want to permanently delete "${product.title}"? This rug and all its inventory variants will be removed from your catalog.`}
            confirmText="Delete Product"
            successMessage={`Product "${product.title}" deleted`}
            onConfirm={handleDelete}
            trigger={
              <Button
                type="button"
                variant="destructive"
                disabled={pending}
                className="h-12 rounded-full px-6 text-base cursor-pointer"
              >
                Delete product
              </Button>
            }
          />
        )}
      </div>
    </form>
  );
}
