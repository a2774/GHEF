import { requireAdmin } from "@/server/auth/admin-session";
import { TrafficClient } from "./TrafficClient";

export const metadata = {
  title: "Traffic & Sales Attribution | Admin | Ganga Handmade",
};

export const instant = false;

export default async function AdminTrafficPage() {
  await requireAdmin("admin");

  return <TrafficClient />;
}
