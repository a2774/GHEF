import { requireAdmin } from "@/server/auth/admin-session";
import { RazorpayClient } from "./RazorpayClient";

export const metadata = {
  title: "Razorpay Gateway & Webhooks | Admin | Ganga Handmade",
};

export const instant = false;

export default async function AdminRazorpayPage() {
  await requireAdmin("owner");

  return <RazorpayClient />;
}
