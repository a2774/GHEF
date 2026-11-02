"use client";

import {
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Plus,
  Star,
  Trash2,
  UploadCloud,
  Video,
} from "lucide-react";
import Image from "next/image";
import { type FormEvent, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import {
  deleteProduct,
  getUploadSignature,
  type ProductImageInput,
  type ProductInput,
  saveProduct,
} from "@/server/actions/admin-products";
import type { products, productVariants, productImages } from "@/server/db/schema";

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

const inputClass =
  "h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-[#bef264] focus:outline-none focus:ring-1 focus:ring-[#bef264]";
const selectClass =
  "h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 shadow-2xs focus:border-[#bef264] focus:outline-none focus:ring-1 focus:ring-[#bef264]";

function toRupees(paise: number) {
  return String(paise / 100);
}

function toPaise(rupees: string) {
  const value = Number(rupees);
  return Number.isFinite(value) && value >= 0 ? Math.round(value * 100) : 0;
}

function Field({
  label,
  required,
  subtext,
  children,
}: {
  label: string;
  required?: boolean;
  subtext?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-800">
          {label} {required && <span className="text-rose-500">*</span>}
        </span>
        {subtext && <span className="text-[11px] text-slate-400">{subtext}</span>}
      </div>
      {children}
    </label>
  );
}

export function ProductForm({
  categories,
  product,
  variants = [],
  initialImages = [],
}: {
  categories: { id: number; name: string }[];
  product?: typeof products.$inferSelect;
  variants?: (typeof productVariants.$inferSelect)[];
  initialImages?: (typeof productImages.$inferSelect)[];
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

  // Uploaded media state (Cloudinary)
  const [uploadedMedia, setUploadedMedia] = useState<ProductImageInput[]>(() =>
    initialImages.map((img) => ({
      id: img.id,
      publicId: img.publicId,
      url: img.url,
      isPrimary: img.isPrimary,
    }))
  );
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  const [error, setError] = useState<string | null>(null);
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

  // Upload files directly to Cloudinary
  async function handleMediaUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    event.target.value = "";

    setIsUploadingMedia(true);
    try {
      const { cloudName, apiKey, timestamp, folder, signature } = await getUploadSignature();
      const newItems: ProductImageInput[] = [];

      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`"${file.name}" exceeds 10MB maximum limit.`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", apiKey);
        formData.append("timestamp", String(timestamp));
        formData.append("folder", folder);
        formData.append("signature", signature);

        const resourceType = file.type.startsWith("video/") ? "video" : "image";
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
          { method: "POST", body: formData }
        );

        if (!response.ok) {
          toast.error(`Upload failed for "${file.name}".`);
          continue;
        }

        const data = (await response.json()) as { public_id: string; secure_url: string };
        newItems.push({
          publicId: data.public_id,
          url: data.secure_url,
          isPrimary: uploadedMedia.length === 0 && newItems.length === 0,
        });
      }

      if (newItems.length > 0) {
        setUploadedMedia((prev) => [...prev, ...newItems]);
        toast.success(`Successfully uploaded ${newItems.length} media file(s) to Cloudinary!`);
      }
    } catch {
      toast.error("Could not upload to Cloudinary. Check network and try again.");
    } finally {
      setIsUploadingMedia(false);
    }
  }

  function setAsPrimary(index: number) {
    setUploadedMedia((prev) =>
      prev.map((item, idx) => ({
        ...item,
        isPrimary: idx === index,
      }))
    );
    toast.success("Updated primary storefront photo!");
  }

  function removeMedia(index: number) {
    setUploadedMedia((prev) => {
      const updated = prev.filter((_, idx) => idx !== index);
      if (updated.length > 0 && !updated.some((item) => item.isPrimary)) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
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
      images: uploadedMedia,
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

    startTransition(async () => {
      const message = await saveProduct(input);
      setError(message);
      if (message) {
        toast.error(message);
      } else {
        toast.success(product ? "Product saved successfully!" : "Product created successfully!");
      }
    });
  }

  async function handleDelete() {
    if (!product) return;
    startTransition(async () => {
      await deleteProduct(product.id);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 1. Core Specifications Section */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-950 tracking-tight">
            Rug Specifications & Classification
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Define basic catalog details, parent collection, materials, and search slug.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Rug Name" required>
            <Input
              name="title"
              required
              defaultValue={product?.title}
              placeholder="e.g. Mirzapur Heritage Hand-Tufted Wool Rug"
              className={inputClass}
            />
          </Field>

          <Field label="URL Slug" subtext="Autogenerated from name if blank">
            <Input
              name="slug"
              defaultValue={product?.slug}
              placeholder="e.g. mirzapur-heritage-hand-tufted"
              className={`${inputClass} font-mono`}
            />
          </Field>

          <Field label="Collection / Category" required>
            <select
              name="categoryId"
              required
              defaultValue={product?.categoryId}
              className={selectClass}
            >
              {categories.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Craft & Material" required>
            <Input
              name="material"
              required
              defaultValue={product?.material}
              placeholder="e.g. 100% New Zealand Blended Wool with Cotton Backing"
              className={inputClass}
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Description & Artisan Story" required>
              <textarea
                name="description"
                required
                rows={4}
                defaultValue={product?.description}
                placeholder="Describe the weaving technique, knot count, texture feel, and heritage context..."
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-[#bef264] focus:outline-none focus:ring-1 focus:ring-[#bef264]"
              />
            </Field>
          </div>

          <Field label="Catalog Visibility Status">
            <select
              name="status"
              defaultValue={product?.status ?? "draft"}
              className={selectClass}
            >
              <option value="draft">Draft (Unpublished on Storefront)</option>
              <option value="active">Active (Live in Buyer Catalog)</option>
              <option value="archived">Archived (Hidden from Catalog)</option>
            </select>
          </Field>

          <div className="flex items-center gap-6 pt-5">
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                name="isFeatured"
                defaultChecked={product?.isFeatured}
                className="size-4 rounded border-slate-300 text-slate-900 focus:ring-[#bef264]"
              />
              <span>Featured Storefront Banner</span>
            </label>
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                name="isBestseller"
                defaultChecked={product?.isBestseller}
                className="size-4 rounded border-slate-300 text-slate-900 focus:ring-[#bef264]"
              />
              <span>Artisan Bestseller Badge</span>
            </label>
          </div>
        </div>
      </section>

      {/* 2. GALLERY IMAGERY & MEDIA UPLOAD (Cloudinary Live Zone) */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-950 tracking-tight">
                Gallery Imagery &amp; Media (Cloudinary)
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                <CheckCircle2 className="size-3 text-emerald-600" />
                Cloudinary Connected
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Upload rug detail photos and artisan weaving videos. Star icon marks the primary storefront cover image.
            </p>
          </div>

          <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#bef264] px-4 text-xs font-bold text-slate-950 shadow-xs hover:bg-[#a3e635] active:scale-95 transition-all shrink-0">
            {isUploadingMedia ? (
              <>
                <Loader2 className="size-3.5 animate-spin text-slate-950" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <UploadCloud className="size-3.5 text-slate-950" />
                <span>+ Upload Images &amp; Videos</span>
              </>
            )}
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              disabled={isUploadingMedia || pending}
              onChange={handleMediaUpload}
              className="sr-only"
            />
          </label>
        </div>

        {/* Uploaded Gallery Grid */}
        {uploadedMedia.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
            {uploadedMedia.map((media, idx) => {
              const isVideo = media.url.includes("/video/") || media.url.endsWith(".mp4");

              return (
                <div
                  key={media.publicId || idx}
                  className={`group relative aspect-square rounded-xl overflow-hidden border bg-slate-100 transition-all shadow-2xs ${
                    media.isPrimary
                      ? "ring-2 ring-[#bef264] border-transparent"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {isVideo ? (
                    <div className="flex size-full items-center justify-center bg-slate-900 text-white">
                      <Video className="size-8 text-[#bef264]" />
                    </div>
                  ) : (
                    <Image
                      src={media.url}
                      alt="Rug Gallery Preview"
                      fill
                      unoptimized
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  )}

                  {/* Primary Badge */}
                  {media.isPrimary && (
                    <span className="absolute left-2 top-2 rounded-full bg-[#bef264] px-2 py-0.5 text-[9px] font-bold text-slate-950 shadow-xs uppercase tracking-wider">
                      ★ Primary
                    </span>
                  )}

                  {/* Hover Controls */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAsPrimary(idx)}
                      title={media.isPrimary ? "Primary cover photo" : "Set as primary"}
                      className={`flex size-8 items-center justify-center rounded-lg shadow-sm transition-colors cursor-pointer ${
                        media.isPrimary
                          ? "bg-[#bef264] text-slate-950 font-bold"
                          : "bg-white/80 text-slate-700 hover:bg-[#bef264] hover:text-slate-950"
                      }`}
                    >
                      <Star className="size-4 fill-current" />
                    </button>

                    <button
                      type="button"
                      onClick={() => removeMedia(idx)}
                      title="Remove media"
                      className="flex size-8 items-center justify-center rounded-lg bg-rose-600 text-white shadow-sm hover:bg-rose-700 transition-colors cursor-pointer"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50 rounded-2xl p-8 text-center cursor-pointer transition-all">
            <div className="flex size-12 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 shadow-2xs mb-3">
              <ImageIcon className="size-6 text-slate-600" />
            </div>
            <p className="text-xs font-bold text-slate-900">
              No photos or videos uploaded yet
            </p>
            <p className="mt-1 text-[11px] text-slate-500 max-w-sm">
              Click anywhere in this box or the button above to upload rug imagery directly to your Cloudinary media library.
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#bef264] px-4 py-1.5 text-xs font-bold text-slate-950 shadow-2xs">
              <UploadCloud className="size-3.5" />
              <span>Choose Files (Max 10MB)</span>
            </span>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              disabled={isUploadingMedia || pending}
              onChange={handleMediaUpload}
              className="sr-only"
            />
          </label>
        )}
      </section>

      {/* 3. Variants Section with EXPLICIT LABELS */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-950 tracking-tight">
                Variants, Sizes &amp; Pricing
              </h2>
              <span className="rounded-full bg-[#bef264]/40 border border-[#bef264] px-2 py-0.5 text-[10px] font-bold text-slate-900">
                {rows.length} {rows.length === 1 ? "Option" : "Options"}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              <strong className="text-slate-800">Sale Price:</strong> what buyers pay at checkout.{" "}
              <strong className="text-slate-800">Regular MRP:</strong> full crossed-out list price.
            </p>
          </div>

          <Button
            type="button"
            onClick={addRow}
            className="h-9 rounded-full bg-[#0B132B] px-4 text-xs font-semibold text-white shadow-2xs hover:bg-[#1a233a] transition-all cursor-pointer shrink-0"
          >
            <Plus className="size-3.5 mr-1 text-[#bef264]" />
            <span>Add Variant</span>
          </Button>
        </div>

        {/* Column Labels Header for Desktop */}
        <div className="hidden lg:grid lg:grid-cols-[1.1fr_1fr_1.2fr_1fr_1fr_0.8fr_44px] gap-2.5 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-slate-50 rounded-xl border border-slate-200/70">
          <div>Size / Dimensions</div>
          <div>Color / Weave</div>
          <div>SKU Code</div>
          <div>Sale Price (₹)</div>
          <div>Regular MRP (₹)</div>
          <div className="text-center">Stock Qty</div>
          <div className="text-center">Action</div>
        </div>

        {/* Rows with clear mobile and desktop labels */}
        <div className="space-y-3">
          {rows.map((row) => (
            <div
              key={row.key}
              className="grid grid-cols-2 gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/40 p-3.5 lg:grid-cols-[1.1fr_1fr_1.2fr_1fr_1fr_0.8fr_44px] lg:bg-transparent lg:border-slate-100 lg:p-1.5 items-center hover:bg-slate-50/50 transition-colors"
            >
              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider lg:hidden mb-1">
                  Size / Dimensions
                </span>
                <Input
                  aria-label="Size"
                  placeholder="e.g. 5 × 7 ft"
                  value={row.size}
                  onChange={(e) => updateRow(row.key, "size", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider lg:hidden mb-1">
                  Color / Weave
                </span>
                <Input
                  aria-label="Colour"
                  placeholder="e.g. Sand / Charcoal"
                  value={row.color}
                  onChange={(e) => updateRow(row.key, "color", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider lg:hidden mb-1">
                  SKU Code
                </span>
                <Input
                  aria-label="SKU"
                  placeholder="e.g. RUG-5X7-IVR"
                  value={row.sku}
                  onChange={(e) => updateRow(row.key, "sku", e.target.value)}
                  className={`${inputClass} font-mono`}
                />
              </div>

              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider lg:hidden mb-1">
                  Sale Price (₹)
                </span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                    ₹
                  </span>
                  <Input
                    aria-label="Sale price in rupees"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={row.price}
                    onChange={(e) => updateRow(row.key, "price", e.target.value)}
                    className={`${inputClass} pl-6 font-mono font-bold text-emerald-700`}
                  />
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider lg:hidden mb-1">
                  Regular MRP (₹)
                </span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                    ₹
                  </span>
                  <Input
                    aria-label="Regular price in rupees"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={row.mrp}
                    onChange={(e) => updateRow(row.key, "mrp", e.target.value)}
                    className={`${inputClass} pl-6 font-mono text-slate-600`}
                  />
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider lg:hidden mb-1">
                  Stock Units
                </span>
                <Input
                  aria-label="Stock"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={row.stock}
                  onChange={(e) => updateRow(row.key, "stock", e.target.value)}
                  className={`${inputClass} font-mono font-bold text-slate-900 text-center`}
                />
              </div>

              <div className="flex items-center justify-center pt-2 lg:pt-0">
                <Button
                  type="button"
                  variant="ghost"
                  aria-label="Remove variant"
                  disabled={rows.length === 1}
                  onClick={() => setRows((current) => current.filter(({ key }) => key !== row.key))}
                  className="size-8 p-0 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {error && (
        <p role="alert" className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-3 rounded-xl font-medium">
          {error}
        </p>
      )}

      {/* 4. Action Toolbar */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button
          type="submit"
          disabled={pending || isUploadingMedia}
          className="h-10 rounded-full bg-[#bef264] px-8 text-xs font-bold text-slate-950 shadow-xs hover:bg-[#a3e635] transition-all cursor-pointer"
        >
          {pending ? "Saving..." : product ? "Save Changes" : "Create Product"}
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
                className="h-10 rounded-full px-6 text-xs font-semibold cursor-pointer"
              >
                Delete Product
              </Button>
            }
          />
        )}
      </div>
    </form>
  );
}
