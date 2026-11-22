"use client";

import { Star } from "lucide-react";
import { useActionState, useState } from "react";

import { submitReview } from "@/server/actions/reviews";

const ratingLabels = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

export function ReviewForm({ productId }: { productId: number }) {
  const [result, action, pending] = useActionState(submitReview.bind(null, productId), null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const shown = hover || rating;

  if (result?.ok) return <p role="status" className="text-center text-lg">{result.message}</p>;

  return (
    <form action={action} className="space-y-4">
      <fieldset>
        <legend className="text-base font-medium">Rating</legend>
        <div className="mt-1.5 flex items-center gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value} className="cursor-pointer" onMouseEnter={() => setHover(value)}>
              <input
                type="radio"
                name="rating"
                value={value}
                required
                checked={rating === value}
                onChange={() => setRating(value)}
                className="peer sr-only"
              />
              <span className="sr-only">{value} out of 5</span>
              <Star
                aria-hidden="true"
                strokeWidth={1.5}
                className={`size-7 text-[#2b2622] transition-transform peer-focus-visible:scale-110 ${shown >= value ? "fill-current" : ""}`}
              />
            </label>
          ))}
          <span className="ml-2 text-base text-muted-foreground">{ratingLabels[shown]}</span>
        </div>
      </fieldset>
      <label className="block text-base font-medium">
        Review
        <textarea
          name="body"
          required
          rows={4}
          minLength={10}
          maxLength={1000}
          placeholder="How does it look and feel in your room?"
          className="mt-1.5 w-full rounded-md border border-input bg-background p-3 text-base font-normal"
        />
      </label>
      {result && (
        <p role="alert" className="text-base text-destructive">
          {result.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="h-10 rounded-md bg-[#4a4a4a] px-5 text-[0.95rem] font-medium tracking-wide text-white uppercase transition-colors hover:bg-[#333] disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit review"}
      </button>
      <p className="text-sm text-muted-foreground">
        You can review a carpet after it is delivered to you. Reviews appear once approved.
      </p>
    </form>
  );
}
