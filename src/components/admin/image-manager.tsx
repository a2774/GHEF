"use client";

import { Star, Trash2 } from "lucide-react";
import { CldImage } from "next-cloudinary";
import { type ChangeEvent, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
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

  function run(task: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await task();
      } catch {
        setError("That did not work. Check the Cloudinary settings and try again.");
      }
    });
  }

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])];
    event.target.value = "";

    if (files.some((file) => !file.type.startsWith("image/") || file.size > maxFileBytes)) {
      setError("Choose image files of 10 MB or less.");
      return;
    }
    run(async () => {
      for (const file of files) await uploadFile(productId, file);
    });
  }

  return (
    <section className="rounded-2xl bg-muted p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold tracking-tight">Images</h2>
        <label className="inline-flex h-10 cursor-pointer items-center rounded-full bg-primary px-5 text-base text-primary-foreground has-focus-visible:ring-3 has-focus-visible:ring-ring/50">
          {pending ? "Working..." : "Upload images"}
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
        <p role="alert" className="mt-3 text-base text-destructive">
          {error}
        </p>
      )}

      {images.length === 0 ? (
        <p className="mt-3 text-lg text-muted-foreground">No images yet. The storefront shows an illustration.</p>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {images.map((image) => (
            <li key={image.id} className="overflow-hidden rounded-xl bg-background">
              <CldImage
                src={image.publicId}
                alt={image.alt || "Product image"}
                width={320}
                height={320}
                crop="fill"
                className="aspect-square w-full object-cover"
              />
              <div className="flex items-center justify-between p-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  aria-label={image.isPrimary ? "Primary image" : "Set as primary image"}
                  aria-pressed={image.isPrimary}
                  disabled={pending || image.isPrimary}
                  onClick={() => run(() => setPrimaryImage(productId, image.id))}
                  className="size-11"
                >
                  <Star className={image.isPrimary ? "fill-current" : undefined} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  aria-label="Delete image"
                  disabled={pending}
                  onClick={() => run(() => removeProductImage(productId, image.id))}
                  className="size-11"
                >
                  <Trash2 />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
