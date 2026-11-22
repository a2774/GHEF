import { Star } from "lucide-react";
import { cacheLife, cacheTag } from "next/cache";

import { getProductReviews } from "@/server/services/reviews";

import { WriteReview } from "./write-review";

const dateFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

function Stars({ rating, className = "size-4" }: { rating: number; className?: string }) {
  return (
    <span className="inline-flex gap-0.5 text-[#2b2622]" aria-label={`${rating.toFixed(1)} out of 5 stars`} role="img">
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          aria-hidden="true"
          strokeWidth={1.5}
          className={`${className} ${rating >= value - 0.25 ? "fill-current" : ""}`}
        />
      ))}
    </span>
  );
}

export async function ProductReviews({ productId }: { productId: number }) {
  "use cache";
  cacheTag("products");
  cacheLife("hours");

  const { rows, average, total } = await getProductReviews(productId);

  return (
    <div className="pb-4">
      <h2 className="text-2xl text-[#1f1c19]">Customer Reviews</h2>

      <div className="mt-6 flex flex-col items-center gap-3 text-center">
        {total === 0 ? (
          <p className="text-lg text-[#1f1c19]">Be the first to write a review</p>
        ) : (
          <>
            <Stars rating={average} className="size-5" />
            <p className="text-lg text-[#1f1c19]">
              {average.toFixed(1)} out of 5
              <span className="block text-base text-muted-foreground">
                Based on {total} {total === 1 ? "review" : "reviews"}
              </span>
            </p>
          </>
        )}
        <WriteReview productId={productId} />
      </div>

      {rows.length > 0 && (
        <ul className="mt-10 border-t border-border">
          {rows.map((review) => (
            <li key={review.id} className="border-b border-border py-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Stars rating={review.rating} />
                <time dateTime={review.createdAt.toISOString()} className="text-sm text-muted-foreground">
                  {dateFormat.format(review.createdAt)}
                </time>
              </div>
              <p className="mt-2 font-medium">{review.name ?? "Customer"}</p>
              <p className="mt-1 text-lg leading-relaxed text-muted-foreground">{review.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
