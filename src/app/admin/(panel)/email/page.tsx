import { requireAdmin } from "@/server/auth/admin-session";
import { EmailClient } from "./EmailClient";

export const metadata = {
  title: "Email System & Quotas | Admin | Ganga Handmade",
};

export const instant = false;

export default async function AdminEmailPage() {
  await requireAdmin("admin");

  return <EmailClient />;
}
