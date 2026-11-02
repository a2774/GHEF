"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { submitReview } from "@/server/actions/reviews";

export function ReviewForm({ productId }: { productId: number }) {
  const [result, action, pending] = useActionState(submitReview.bind(null, productId), null);

  if (result?.ok) return <p role="status" className="text-lg">{result.message}</p>;

  return (
    <form action={action} className="space-y-3">
      <label className="block text-base font-medium">
        Your rating
        <select name="rating" required defaultValue="" className="mt-1.5 h-11 w-full rounded-xl border border-input bg-card px-3 text-base">
          <option value="" disabled>
            Choose
          </option>
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>
              {value} out of 5
            </option>
          ))}
        </select>
      </label>
      <label className="block text-base font-medium">
        Your review
        <textarea name="body" required rows={3} minLength={10} className="mt-1.5 w-full rounded-xl border border-input bg-card p-3 text-base" />
      </label>
      {result && (
        <p role="alert" className="text-base text-destructive">
          {result.message}
        </p>
      )}
      <Button type="submit" variant="outline" disabled={pending} className="h-11 rounded-full px-6 text-base">
        Submit review
      </Button>
    </form>
  );
}
