import { InventoryClient } from "@/components/admin/inventory-client";
import { requireAdmin } from "@/server/auth/admin-session";
import { listInventory } from "@/server/services/admin";

export const instant = false;

export default async function AdminInventoryPage() {
  await requireAdmin();
  const rows = await listInventory();

  return <InventoryClient initialRows={rows} />;
}
