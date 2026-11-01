"use server";

import { and, asc, eq, notInArray, sql } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { logAdminAction, requireAdmin } from "@/server/auth/admin-session";
import { db, withDbRetry } from "@/server/db";
import { categories, productImages, products, productVariants } from "@/server/db/schema";
import {
  createUploadSignature,
  destroyImage,
  isOwnProductImage,
} from "@/server/services/cloudinary";

export type VariantInput = {
  id?: number;
  size: string;
  color: string;
  sku: string;
  pricePaise: number;
  mrpPaise: number;
  stock: number;
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
  variants: VariantInput[];
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function validate(input: ProductInput) {
  if (!input.title.trim()) return "Add a product name.";
  if (!input.description.trim()) return "Add a description.";
  if (!input.material.trim()) return "Add a material.";
  if (!input.categoryId) return "Choose a category.";
  if (input.variants.length === 0) return "Add at least one variant.";

  const keys = new Set<string>();
  for (const variant of input.variants) {
    if (!variant.size.trim() || !variant.color.trim() || !variant.sku.trim()) {
      return "Every variant needs a size, colour and SKU.";
    }
    const validAmounts = [variant.pricePaise, variant.mrpPaise, variant.stock].every(
      (value) => Number.isInteger(value) && value >= 0,
    );
    if (!validAmounts) return "Prices and stock must be zero or more.";
    if (variant.pricePaise > variant.mrpPaise) return "Sale price cannot be above the regular price.";

    const key = `${variant.size.trim()}|${variant.color.trim()}`;
    if (keys.has(key)) return "Each size and colour pair can appear only once.";
    keys.add(key);
  }
  return null;
}

function refreshStorefront(productId?: number) {
  updateTag("products");
  revalidatePath("/admin/products");
  if (productId) revalidatePath(`/admin/products/${productId}`);
}

function isUniqueViolation(error: unknown) {
  const cause = (error as { cause?: { code?: string } })?.cause ?? error;
  return (cause as { code?: string }).code === "23505";
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
      }),
    );
  } catch (error) {
    if (isUniqueViolation(error)) return "That URL slug or SKU is already in use.";
    throw error;
  }

  await logAdminAction(admin, input.id ? "update" : "create", "product", productId, values.title);
  refreshStorefront(productId);
  if (!input.id) redirect(`/admin/products/${productId}`);
  return null;
}

export async function deleteProduct(id: number) {
  const admin = await requireAdmin("admin");

  const images = await withDbRetry(async () =>
    db.select().from(productImages).where(eq(productImages.productId, id)),
  );
  await Promise.all(images.map(({ publicId }) => destroyImage(publicId)));
  await withDbRetry(async () => db.delete(products).where(eq(products.id, id)));
  await logAdminAction(admin, "delete", "product", id);

  refreshStorefront();
  redirect("/admin/products");
}

export async function getUploadSignature() {
  await requireAdmin();
  return createUploadSignature();
}

export async function addProductImage(productId: number, publicId: string, url: string) {
  await requireAdmin();
  if (!isOwnProductImage(publicId, url)) throw new Error("Unknown image source.");

  await withDbRetry(async () => {
    const [{ total }] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(productImages)
      .where(eq(productImages.productId, productId));
    await db
      .insert(productImages)
      .values({ productId, publicId, url, isPrimary: total === 0 })
      .onConflictDoNothing();
  });
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

  await destroyImage(image.publicId);
  await withDbRetry(async () => {
    await db.delete(productImages).where(eq(productImages.id, imageId));
    if (!image.isPrimary) return;

    const [next] = await db
      .select({ id: productImages.id })
      .from(productImages)
      .where(eq(productImages.productId, productId))
      .orderBy(asc(productImages.id))
      .limit(1);
    if (next) {
      await db.update(productImages).set({ isPrimary: true }).where(eq(productImages.id, next.id));
    }
  });
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
  revalidatePath("/admin/categories");
}
