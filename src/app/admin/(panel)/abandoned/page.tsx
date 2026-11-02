import { requireAdmin } from "@/server/auth/admin-session";
import { AbandonedClient } from "./AbandonedClient";

export const metadata = {
  title: "Abandoned Checkouts & Recovery | Admin | Ganga Handmade",
};

export const instant = false;

export default async function AdminAbandonedPage() {
  await requireAdmin("admin");

  return <AbandonedClient />;
}
