import { Button } from "@/components/ui/button";
import { moderateReview } from "@/server/actions/admin-modules";
import { requireAdmin } from "@/server/auth/admin-session";
import { listPendingReviews } from "@/server/services/reviews";

export default async function AdminReviewsPage() {
  await requireAdmin();
  const rows = await listPendingReviews();

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-semibold tracking-tight">Reviews</h1>
      {rows.length === 0 ? (
        <p className="rounded-2xl bg-card p-6 text-lg text-muted-foreground">No reviews waiting.</p>
      ) : (
        <ul className="rounded-2xl bg-card">
          {rows.map((review) => (
            <li key={review.id} className="border-t border-border p-4 text-base first:border-t-0">
              <p className="font-medium">
                {review.product}: {review.rating}/5
              </p>
              <p className="mt-1">{review.body}</p>
              <p className="mt-1 text-muted-foreground">{review.customer}</p>
              <div className="mt-3 flex gap-2">
                <form action={moderateReview.bind(null, review.id, "approved")}>
                  <Button type="submit" className="h-10 rounded-full px-5 text-base">
                    Approve
                  </Button>
                </form>
                <form action={moderateReview.bind(null, review.id, "rejected")}>
                  <Button type="submit" variant="outline" className="h-10 rounded-full px-5 text-base">
                    Reject
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
