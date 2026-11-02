"use server";

import { z } from "zod";

import { auth } from "@/server/auth/customer";
import { db, withDbRetry } from "@/server/db";
import { reviews } from "@/server/db/schema";
import { hasPurchasedProduct } from "@/server/services/reviews";

const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1, "Choose a rating.").max(5),
  body: z.string().trim().min(10, "Write at least 10 characters.").max(1000),
});

export async function submitReview(
  productId: number,
  _previous: { ok: boolean; message: string } | null,
  form: FormData,
) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "Log in to write a review." };
  const userId = session.user.id;

  const parsed = reviewSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };

  if (!(await hasPurchasedProduct(userId, productId))) {
    return { ok: false, message: "You can review this item after it is delivered to you." };
  }

  const inserted = await withDbRetry(async () =>
    db
      .insert(reviews)
      .values({ productId, userId, ...parsed.data })
      .onConflictDoNothing()
      .returning({ id: reviews.id }),
  );
  if (inserted.length === 0) return { ok: false, message: "You have already reviewed this item." };

  return { ok: true, message: "Thank you. Your review will appear after approval." };
}
