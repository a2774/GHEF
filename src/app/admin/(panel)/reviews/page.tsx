import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { moderateReview } from "@/server/actions/admin-modules";
import { requireAdmin } from "@/server/auth/admin-session";
import { listPendingReviews } from "@/server/services/reviews";

export const instant = false;

export default async function AdminReviewsPage() {
  await requireAdmin();
  const rows = await listPendingReviews();

  return (
    <div className="max-w-3xl space-y-6 pb-12">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
          Product Reviews & Feedback
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Moderate customer product testimonials and ratings before publishing to the storefront.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
          <span>Pending Moderation ({rows.length})</span>
          <span className="text-[10px] text-slate-400">Customer Feedback</span>
        </div>

        <ul className="divide-y divide-slate-100">
          {rows.length === 0 ? (
            <li className="p-8 text-center text-xs text-slate-500">
              No reviews currently waiting for moderation.
            </li>
          ) : (
            rows.map((review) => (
              <li key={review.id} className="p-4 text-xs transition-colors hover:bg-slate-50/60">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-900">{review.product}</span>
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    <span>{review.rating}/5</span>
                  </div>
                </div>

                <p className="mt-2 text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                  &ldquo;{review.body}&rdquo;
                </p>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-slate-400 font-medium">By {review.customer}</span>
                  <div className="flex gap-2">
                    <form action={moderateReview.bind(null, review.id, "approved")}>
                      <Button
                        type="submit"
                        size="xs"
                        className="rounded-full bg-[#bef264] px-3.5 py-1 text-xs font-bold text-slate-950 shadow-2xs hover:bg-[#a3e635] cursor-pointer"
                      >
                        Approve
                      </Button>
                    </form>
                    <form action={moderateReview.bind(null, review.id, "rejected")}>
                      <Button
                        type="submit"
                        variant="outline"
                        size="xs"
                        className="rounded-full border-slate-200 px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
                      >
                        Reject
                      </Button>
                    </form>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
