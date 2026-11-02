import { requireAdmin } from "@/server/auth/admin-session";
import { WaitlistClient } from "./WaitlistClient";

export const metadata = {
  title: "VIP Waitlist & Drops | Admin | Ganga Handmade",
};

export const instant = false;

export default async function AdminWaitlistPage() {
  await requireAdmin("admin");

  return <WaitlistClient />;
}
