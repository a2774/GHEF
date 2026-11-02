"use client";

import { Star, Trash2 } from "lucide-react";
import { CldImage } from "next-cloudinary";
import { type ChangeEvent, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { toast } from "@/components/ui/sonner";
import {
  addProductImage,
  getUploadSignature,
  removeProductImage,
  setPrimaryImage,
} from "@/server/actions/admin-products";
import type { productImages } from "@/server/db/schema";

const maxFileBytes = 10 * 1024 * 1024;

async function uploadFile(productId: number, file: File) {
  const { cloudName, apiKey, timestamp, folder, signature } = await getUploadSignature();

  const body = new FormData();
  body.append("file", file);
  body.append("api_key", apiKey);
  body.append("timestamp", String(timestamp));
  body.append("folder", folder);
  body.append("signature", signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body,
  });
  if (!response.ok) throw new Error("Upload failed.");

  const { public_id: publicId, secure_url: url } = (await response.json()) as {
    public_id: string;
    secure_url: string;
  };
  await addProductImage(productId, publicId, url);
}

export function ImageManager({
  productId,
  images,
}: {
  productId: number;
  images: (typeof productImages.$inferSelect)[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(task: () => Promise<void>, successMessage?: string) {
    setError(null);
    startTransition(async () => {
      try {
        await task();
        if (successMessage) toast.success(successMessage);
      } catch {
        const msg = "That did not work. Check the Cloudinary settings and try again.";
        setError(msg);
        toast.error(msg);
      }
    });
  }

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])];
    event.target.value = "";

    if (files.some((file) => !file.type.startsWith("image/") || file.size > maxFileBytes)) {
      const msg = "Choose image files of 10 MB or less.";
      setError(msg);
      toast.error(msg);
      return;
    }
    run(async () => {
      for (const file of files) await uploadFile(productId, file);
    }, "Images uploaded successfully!");
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-950 tracking-tight">Gallery Imagery</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            High-resolution photography for store detail and zoom experience. First image or starred is primary.
          </p>
        </div>
        <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#bef264] px-4 text-xs font-bold text-slate-950 shadow-xs hover:bg-[#a3e635] transition-all shrink-0">
          <span>{pending ? "Uploading..." : "+ Upload Images"}</span>
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={pending}
            onChange={handleFiles}
            className="sr-only"
          />
        </label>
      </div>

      {error && (
        <p role="alert" className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl font-medium">
          {error}
        </p>
      )}

      {images.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
          No images uploaded yet. The storefront displays an artisanal weave illustration.
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {images.map((image) => (
            <li key={image.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs group relative">
              <CldImage
                src={image.publicId}
                alt={image.alt || "Product image"}
                width={320}
                height={320}
                crop="fill"
                className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="flex items-center justify-between p-2 bg-white/95 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  aria-label={image.isPrimary ? "Primary image" : "Set as primary image"}
                  aria-pressed={image.isPrimary}
                  disabled={pending || image.isPrimary}
                  onClick={() =>
                    run(
                      () => setPrimaryImage(productId, image.id),
                      "Set as primary product photo"
                    )
                  }
                  className={`h-7 px-2 text-xs font-semibold rounded-md cursor-pointer ${
                    image.isPrimary
                      ? "text-amber-500 bg-amber-50"
                      : "text-slate-400 hover:text-amber-500"
                  }`}
                >
                  <Star className={`size-3.5 mr-1 ${image.isPrimary ? "fill-amber-400 text-amber-500" : ""}`} />
                  <span className="text-[10px]">{image.isPrimary ? "Primary" : "Star"}</span>
                </Button>

                <ConfirmDeleteDialog
                  title="Delete Image?"
                  description="Are you sure you want to remove this photo from the product gallery?"
                  confirmText="Delete Image"
                  successMessage="Product photo deleted"
                  onConfirm={async () => {
                    await removeProductImage(productId, image.id);
                  }}
                  trigger={
                    <Button
                      type="button"
                      variant="ghost"
                      aria-label="Delete image"
                      disabled={pending}
                      className="size-7 p-0 cursor-pointer text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  }
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
