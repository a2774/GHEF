"use server";

import { and, asc, desc, eq, inArray, notInArray, sql } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";

import { roomSlugs } from "@/lib/catalog-taxonomy";
import { productTitleMaxLength } from "@/lib/limits";
import { type AdminIdentity, logAdminAction, requireAdmin } from "@/server/auth/admin-session";
import { db, withDbRetry } from "@/server/db";
import { categories, productImages, products, productVariants } from "@/server/db/schema";
import {
  createUploadSignature,
  destroyImage,
  isOwnProductImage,
} from "@/server/services/cloudinary";
import { sendBackInStockAlerts } from "@/server/services/stock-alerts";

export type VariantInput = {
  id?: number;
  size: string;
  color: string;
  sku: string;
  pricePaise: number;
  mrpPaise: number;
  stock: number;
};

export type ProductImageInput = {
  id?: number;
  publicId: string;
  url: string;
  isPrimary?: boolean;
};

export type ProductInput = {
  id?: number;
  title: string;
  slug: string;
  description: string;
  material: string;
  categoryId: number;
  status: "draft" | "active" | "archived";
  isFeatured: boolean;
  isBestseller: boolean;
  isReadyToDispatch?: boolean;
  rooms?: string[];
  pileHeight?: string;
  backing?: string;
  variants: VariantInput[];
  images?: ProductImageInput[];
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function validate(input: ProductInput) {
  if (typeof input.title !== "string" || !input.title.trim()) return "Add a product name.";
  if (input.title.trim().length > productTitleMaxLength) {
    return `Keep the product name to ${productTitleMaxLength} characters or fewer.`;
  }
  if (typeof input.description !== "string" || !input.description.trim()) return "Add a description.";
  if (typeof input.material !== "string" || !input.material.trim()) return "Add a material.";
  if (!input.categoryId) return "Choose a category.";
  if (!Array.isArray(input.variants) || input.variants.length === 0) return "Add at least one variant.";

  const keys = new Set<string>();
  const skus = new Set<string>();
  for (const variant of input.variants) {
    if (
      typeof variant.size !== "string" ||
      !variant.size.trim() ||
      typeof variant.color !== "string" ||
      !variant.color.trim() ||
      typeof variant.sku !== "string" ||
      !variant.sku.trim()
    ) {
      return "Every variant needs a size, colour and SKU.";
    }
    const validAmounts = [variant.pricePaise, variant.mrpPaise, variant.stock].every(
      (value) => typeof value === "number" && Number.isInteger(value) && value >= 0,
    );
    if (!validAmounts) return "Prices and stock must be zero or more.";
    if (variant.pricePaise > variant.mrpPaise) return "Sale price cannot be above the regular price.";

    const key = `${variant.size.trim()}|${variant.color.trim()}`;
    if (keys.has(key)) return "Each size and colour pair can appear only once.";
    keys.add(key);

    // A SKU identifies one variant across the whole store, so no two rows may share it.
    const sku = variant.sku.trim();
    if (skus.has(sku)) return `Each variant needs its own SKU. "${sku}" is used more than once.`;
    skus.add(sku);
  }
  return null;
}

function refreshStorefront(productId?: number) {
  updateTag("products");
  updateTag("admin");
  revalidatePath("/admin/products");
  if (productId) revalidatePath(`/admin/products/${productId}`);
}

function isUniqueViolation(error: unknown) {
  const cause = (error as { cause?: { code?: string } })?.cause ?? error;
  return (cause as { code?: string }).code === "23505";
}

/** Says which value clashed (SKU or URL slug) from the name of the database constraint. */
function uniqueViolationMessage(error: unknown) {
  const cause = (error as { cause?: { constraint?: string } })?.cause ?? error;
  const constraint = (cause as { constraint?: string }).constraint ?? "";
  if (constraint.includes("sku")) {
    return "That SKU is already used by another product or variant. Every variant needs its own SKU.";
  }
  if (constraint.includes("slug")) return "That URL slug is already used by another product.";
  return "That URL slug or SKU is already in use.";
}

export async function saveProduct(input: ProductInput) {
  const admin = await requireAdmin();

  const validationError = validate(input);
  if (validationError) return validationError;

  const values = {
    title: input.title.trim(),
    slug: slugify(input.slug || input.title),
    description: input.description.trim(),
    material: input.material.trim(),
    color: input.variants[0].color.trim(),
    categoryId: input.categoryId,
    status: input.status,
    isFeatured: input.isFeatured,
    isBestseller: input.isBestseller,
    isReadyToDispatch: Boolean(input.isReadyToDispatch),
    rooms: Array.isArray(input.rooms) ? [...new Set(input.rooms.filter((room) => roomSlugs.includes(room)))] : [],
    pileHeight: typeof input.pileHeight === "string" && input.pileHeight.trim() ? input.pileHeight.trim().slice(0, 40) : null,
    backing: typeof input.backing === "string" && input.backing.trim() ? input.backing.trim().slice(0, 80) : null,
  };
  if (!values.slug) return "Add a valid URL slug.";

  let productId = input.id;
  try {
    await withDbRetry(async () =>
      db.transaction(async (tx) => {
        if (input.id) {
          await tx.update(products).set(values).where(eq(products.id, input.id));
        } else {
          const [created] = await tx
            .insert(products)
            .values(values)
            .returning({ id: products.id });
          productId = created.id;
        }

        const savedId = productId as number;
        const keptIds = input.variants.flatMap(({ id }) => (id ? [id] : []));
        await tx
          .delete(productVariants)
          .where(
            and(
              eq(productVariants.productId, savedId),
              keptIds.length ? notInArray(productVariants.id, keptIds) : undefined,
            ),
          );

        for (const { id, ...variant } of input.variants) {
          const row = {
            ...variant,
            size: variant.size.trim(),
            color: variant.color.trim(),
            sku: variant.sku.trim(),
          };
          if (id) {
            await tx
              .update(productVariants)
              .set(row)
              .where(and(eq(productVariants.id, id), eq(productVariants.productId, savedId)));
          } else {
            await tx.insert(productVariants).values({ ...row, productId: savedId });
          }
        }

        // Sync / save uploaded images. The order in the form is the order to keep: the store shows
        // the cover (primary) photo first and the rest by id, so the photos are saved in the shown
        // order and the first one is the cover.
        if (input.images !== undefined) {
          const wanted = input.images.filter(
            (img, index, all) => img.publicId && all.findIndex((other) => other.publicId === img.publicId) === index,
          );

          const existing = input.id
            ? await tx
                .select({ publicId: productImages.publicId, alt: productImages.alt, isPrimary: productImages.isPrimary })
                .from(productImages)
                .where(eq(productImages.productId, savedId))
                .orderBy(desc(productImages.isPrimary), asc(productImages.id))
            : [];

          const unchanged =
            existing.length === wanted.length &&
            existing.every((row, index) => row.publicId === wanted[index].publicId && row.isPrimary === (index === 0));

          if (!unchanged) {
            // A photo's place is its id, so the photos are removed and added again in the new order.
            // Nothing else points at a photo's id, and the text describing a photo is carried over.
            if (existing.length > 0) await tx.delete(productImages).where(eq(productImages.productId, savedId));
            if (wanted.length > 0) {
              const altByPublicId = new Map(existing.map((row) => [row.publicId, row.alt]));
              await tx
                .insert(productImages)
                .values(
                  wanted.map((img, index) => ({
                    productId: savedId,
                    publicId: img.publicId,
                    url: img.url,
                    alt: altByPublicId.get(img.publicId) ?? "",
                    isPrimary: index === 0,
                  })),
                )
                .onConflictDoNothing();
            }
          }
        }
      }),
    );
  } catch (error) {
    if (isUniqueViolation(error)) return uniqueViolationMessage(error);
    throw error;
  }

  await logAdminAction(admin, input.id ? "update" : "create", "product", productId, values.title);
  refreshStorefront(productId);
  const restocked = input.variants.flatMap(({ id, stock }) => (id && stock > 0 ? [id] : []));
  if (restocked.length > 0) after(() => sendBackInStockAlerts(restocked));
  // The form takes the user back to the product list once this returns null.
  return null;
}

async function deleteProductAndPhotos(admin: AdminIdentity, id: number) {
  const images = await withDbRetry(async () =>
    db.select().from(productImages).where(eq(productImages.productId, id)),
  );
  await withDbRetry(async () => db.delete(products).where(eq(products.id, id)));

  await Promise.allSettled(images.map(({ publicId }) => destroyImage(publicId)));

  await logAdminAction(admin, "delete", "product", id);

  refreshStorefront();
}

// Used by the edit form: after deleting, leave the page that no longer exists.
export async function deleteProduct(id: number) {
  const admin = await requireAdmin("admin");
  await deleteProductAndPhotos(admin, id);
  redirect("/admin/products");
}

export type ProductActionResult = { ok: true } | { ok: false; error: string };

// Used by the product list: the page stays where it is and just refreshes.
export async function removeProduct(id: number): Promise<ProductActionResult> {
  const admin = await requireAdmin("admin");
  await deleteProductAndPhotos(admin, id);
  return { ok: true };
}

/** Deactivate hides a product from the store (draft). Activate puts it back live. */
export async function setProductStatus(id: number, status: "active" | "draft"): Promise<ProductActionResult> {
  const admin = await requireAdmin();
  if (status !== "active" && status !== "draft") return { ok: false, error: "Choose a valid status." };

  if (status === "active") {
    const [{ total }] = await withDbRetry(async () =>
      db
        .select({ total: sql<number>`count(*)::int` })
        .from(productVariants)
        .where(eq(productVariants.productId, id)),
    );
    if (total === 0) return { ok: false, error: "Add at least one size and price before making this product live." };
  }

  const [updated] = await withDbRetry(async () =>
    db.update(products).set({ status }).where(eq(products.id, id)).returning({ title: products.title }),
  );
  if (!updated) return { ok: false, error: "This product no longer exists." };

  await logAdminAction(admin, status === "active" ? "activate" : "deactivate", "product", id, updated.title);
  refreshStorefront(id);
  return { ok: true };
}

/** Renew moves a product to the top of "New arrivals" and the newest-first lists. */
export async function renewProduct(id: number): Promise<ProductActionResult> {
  const admin = await requireAdmin();

  const [updated] = await withDbRetry(async () =>
    db.update(products).set({ createdAt: new Date() }).where(eq(products.id, id)).returning({ title: products.title }),
  );
  if (!updated) return { ok: false, error: "This product no longer exists." };

  await logAdminAction(admin, "renew", "product", id, updated.title);
  refreshStorefront(id);
  return { ok: true };
}

/**
 * Makes a draft copy with the same details, sizes, prices and stock. Only the photos are not
 * copied, because every photo belongs to one product. The caller opens the copy to edit it.
 */
export async function duplicateProduct(
  id: number,
): Promise<{ ok: true; id: number } | { ok: false; error: string }> {
  const admin = await requireAdmin();

  try {
    const copyId = await withDbRetry(async () =>
      db.transaction(async (tx) => {
        const [source] = await tx.select().from(products).where(eq(products.id, id));
        if (!source) return null;
        const variants = await tx
          .select()
          .from(productVariants)
          .where(eq(productVariants.productId, id))
          .orderBy(productVariants.id);

        // Copying a copy starts from the original name, so "Rug (Copy)" never becomes "Rug (Copy) (Copy)".
        const baseSlug = source.slug.replace(/-copy(-\d+)?$/, "");
        const baseTitle = source.title.replace(/\s*\(Copy\)$/, "");

        // First free slug out of "name-copy", "name-copy-2", "name-copy-3", ...
        const candidates = Array.from({ length: 50 }, (_, index) =>
          index === 0 ? `${baseSlug}-copy` : `${baseSlug}-copy-${index + 1}`,
        );
        const taken = new Set(
          (await tx.select({ slug: products.slug }).from(products).where(inArray(products.slug, candidates))).map(
            ({ slug }) => slug,
          ),
        );
        const copyIndex = candidates.findIndex((slug) => !taken.has(slug));
        if (copyIndex === -1) return null;

        const title =
          baseTitle.length + 7 <= productTitleMaxLength
            ? `${baseTitle} (Copy)`
            : `${baseTitle.slice(0, productTitleMaxLength - 7).trimEnd()} (Copy)`;
        const skuSuffix = copyIndex === 0 ? "-COPY" : `-COPY${copyIndex + 1}`;

        const [created] = await tx
          .insert(products)
          .values({
            categoryId: source.categoryId,
            title,
            slug: candidates[copyIndex],
            description: source.description,
            material: source.material,
            color: source.color,
            status: "draft",
            isFeatured: source.isFeatured,
            isBestseller: source.isBestseller,
            isReadyToDispatch: source.isReadyToDispatch,
            rooms: source.rooms,
            pileHeight: source.pileHeight,
            backing: source.backing,
          })
          .returning({ id: products.id });

        if (variants.length > 0) {
          await tx.insert(productVariants).values(
            variants.map((variant) => ({
              productId: created.id,
              size: variant.size,
              color: variant.color,
              sku: `${variant.sku.replace(/-COPY\d*$/, "")}${skuSuffix}`,
              pricePaise: variant.pricePaise,
              mrpPaise: variant.mrpPaise,
              stock: variant.stock,
            })),
          );
        }
        return created.id;
      }),
    );
    if (copyId === null) return { ok: false, error: "Could not copy this product." };

    await logAdminAction(admin, "duplicate", "product", copyId, `copy of #${id}`);
    refreshStorefront(copyId);
    return { ok: true, id: copyId };
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, error: "A copy of this product already exists. Edit it first." };
    throw error;
  }
}

export async function getUploadSignature() {
  await requireAdmin();
  return createUploadSignature();
}

export async function addProductImage(productId: number, publicId: string, url: string) {
  await requireAdmin();
  if (!isOwnProductImage(publicId, url)) throw new Error("Unknown image source.");

  await withDbRetry(async () =>
    db.transaction(async (tx) => {
      const [{ total }] = await tx
        .select({ total: sql<number>`count(*)::int` })
        .from(productImages)
        .where(eq(productImages.productId, productId));
      await tx
        .insert(productImages)
        .values({ productId, publicId, url, isPrimary: total === 0 })
        .onConflictDoNothing();
    }),
  );
  refreshStorefront(productId);
}

export async function setPrimaryImage(productId: number, imageId: number) {
  await requireAdmin();

  await withDbRetry(async () =>
    db.transaction(async (tx) => {
      await tx
        .update(productImages)
        .set({ isPrimary: false })
        .where(eq(productImages.productId, productId));
      await tx
        .update(productImages)
        .set({ isPrimary: true })
        .where(and(eq(productImages.id, imageId), eq(productImages.productId, productId)));
    }),
  );
  refreshStorefront(productId);
}

export async function removeProductImage(productId: number, imageId: number) {
  await requireAdmin();

  const [image] = await withDbRetry(async () =>
    db
      .select()
      .from(productImages)
      .where(and(eq(productImages.id, imageId), eq(productImages.productId, productId))),
  );
  if (!image) return;

  await withDbRetry(async () =>
    db.transaction(async (tx) => {
      await tx.delete(productImages).where(eq(productImages.id, imageId));
      if (!image.isPrimary) return;

      const [next] = await tx
        .select({ id: productImages.id })
        .from(productImages)
        .where(eq(productImages.productId, productId))
        .orderBy(asc(productImages.id))
        .limit(1);
      if (next) {
        await tx.update(productImages).set({ isPrimary: true }).where(eq(productImages.id, next.id));
      }
    }),
  );

  await destroyImage(image.publicId).catch((err) =>
    console.error(`Failed to delete Cloudinary image ${image.publicId}:`, err),
  );
  refreshStorefront(productId);
}

export async function createCategory(form: FormData) {
  await requireAdmin();

  const name = String(form.get("name") ?? "").trim();
  const slug = slugify(name);
  const parentId = Number(form.get("parentId")) || null;
  if (!slug) return;

  await withDbRetry(async () =>
    db.insert(categories).values({ name, slug, parentId }).onConflictDoNothing(),
  );
  updateTag("admin");
  revalidatePath("/admin/categories");
}

export async function deleteCategory(id: number) {
  await requireAdmin();

  const [inUse, hasChildren] = await withDbRetry(async () =>
    Promise.all([
      db.select({ id: products.id }).from(products).where(eq(products.categoryId, id)).limit(1),
      db.select({ id: categories.id }).from(categories).where(eq(categories.parentId, id)).limit(1),
    ]),
  );
  if (inUse.length > 0 || hasChildren.length > 0) return;

  await withDbRetry(async () => db.delete(categories).where(eq(categories.id, id)));
  updateTag("admin");
  revalidatePath("/admin/categories");
}
