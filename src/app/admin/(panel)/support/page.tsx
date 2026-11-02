import { requireAdmin } from "@/server/auth/admin-session";
import { SupportClient } from "./SupportClient";

export const metadata = {
  title: "Support Tickets & Concierge | Admin | Ganga Handmade",
};

export const instant = false;

export default async function AdminSupportPage() {
  await requireAdmin("staff");

  return <SupportClient />;
}
