import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateSettings } from "@/server/actions/admin-modules";
import { requireAdmin } from "@/server/auth/admin-session";
import { getStoreSettings } from "@/server/services/settings";

export default async function AdminSettingsPage() {
  await requireAdmin("owner");
  const settings = await getStoreSettings();

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-4xl font-semibold tracking-tight">Settings</h1>
      <form key={`${settings.announcement}-${settings.shippingPaise}`} action={updateSettings} className="space-y-4 rounded-2xl bg-muted p-5">
        <label className="block text-base font-medium">
          Announcement on homepage
          <Input name="announcement" maxLength={160} defaultValue={settings.announcement} className="mt-1.5 h-11 rounded-xl bg-card px-3 text-base md:text-base" />
        </label>
        <label className="block text-base font-medium">
          Shipping charge per order (₹)
          <Input name="shipping" type="number" min="0" step="0.01" defaultValue={settings.shippingPaise / 100} className="mt-1.5 h-11 rounded-xl bg-card px-3 text-base md:text-base" />
        </label>
        <label className="flex items-center gap-2 text-base">
          <input type="checkbox" name="codEnabled" defaultChecked={settings.codEnabled} className="size-5" />
          Offer cash on delivery
        </label>
        <Button type="submit" className="h-11 rounded-full px-8 text-base">
          Save settings
        </Button>
      </form>
    </div>
  );
}
