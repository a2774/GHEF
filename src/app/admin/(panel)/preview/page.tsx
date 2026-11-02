import { requireAdmin } from "@/server/auth/admin-session";
import { PreviewClient } from "./PreviewClient";

export const metadata = {
  title: "Live Visual Storefront Editor | Admin | Ganga Handmade",
};

export const instant = false;

export default async function AdminPreviewPage() {
  await requireAdmin("staff");

  return <PreviewClient />;
}
