import dynamic from "next/dynamic";
import { Suspense } from "react";

import { requireAdmin } from "@/server/auth/admin-session";
import { TrafficSkeleton } from "./TrafficSkeleton";

const TrafficClient = dynamic(
  () => import("./TrafficClient").then((mod) => mod.TrafficClient),
  {
    loading: () => <TrafficSkeleton />,
  }
);

export const metadata = {
  title: "Traffic & Sales Attribution | Admin | Ganga Handmade",
};

export const instant = false;

export default async function AdminTrafficPage() {
  await requireAdmin("staff");

  return (
    <Suspense fallback={<TrafficSkeleton />}>
      <TrafficClient />
    </Suspense>
  );
}
