import { cacheLife, cacheTag } from "next/cache";

import { getProductReviews } from "@/server/services/reviews";

import { ReviewForm } from "./review-form";

export async function ProductReviews({ productId }: { productId: number }) {
  "use cache";
  cacheTag("products");
  cacheLife("hours");

  const { rows, average, total } = await getProductReviews(productId);

  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-20 sm:px-6 lg:grid-cols-[1.3fr_1fr] lg:gap-16 lg:px-8">
      <div>
        <h2 className="text-title font-semibold">Reviews.</h2>
        <p className="mt-2 text-lg text-muted-foreground">
          {total > 0 ? `${average.toFixed(1)} out of 5, from ${total} ${total === 1 ? "review" : "reviews"}` : "No reviews yet."}
        </p>
        <ul className="mt-6">
          {rows.map((review) => (
            <li key={review.id} className="border-t border-border py-4 text-lg">
              <p className="font-medium">
                {review.rating}/5, {review.name ?? "Customer"}
              </p>
              <p className="mt-1 text-muted-foreground">{review.body}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-3xl bg-muted p-6 lg:self-start">
        <h3 className="text-2xl font-semibold tracking-tight">Bought this?</h3>
        <p className="mb-4 text-base text-muted-foreground">Reviews open after delivery.</p>
        <ReviewForm productId={productId} />
      </div>
    </section>
  );
}
