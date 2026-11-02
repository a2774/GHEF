import type { Metadata } from "next";

import { TrackOrderForm } from "@/components/store/track-order-form";

export const metadata: Metadata = {
  title: "Track your order | Ganga Handmade Export",
  description: "Check where your carpet is with your order number and phone number.",
  alternates: { canonical: "/track" },
};

export default function TrackPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 pt-36 pb-20 sm:px-6 lg:px-8 lg:pt-40">
      <h1 className="text-title font-semibold">Track your order.</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
        No login needed. Use the order number and the phone number you checked out with.
      </p>
      <div className="mt-10">
        <TrackOrderForm />
      </div>
    </main>
  );
}
