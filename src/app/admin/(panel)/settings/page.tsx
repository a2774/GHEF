import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateSettings } from "@/server/actions/admin-modules";
import { requireAdmin } from "@/server/auth/admin-session";
import { getStoreSettings } from "@/server/services/settings";

export const instant = false;

export default async function AdminSettingsPage() {
  await requireAdmin("owner");
  const settings = await getStoreSettings();

  return (
    <div className="max-w-2xl space-y-6 pb-12">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
          Store Configuration & Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage announcements, delivery fee policies, and payment methods.
        </p>
      </div>

      <form
        key={`${settings.announcement}-${settings.shippingPaise}`}
        action={updateSettings}
        className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs"
      >
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900">Storefront Preferences</h2>
        </div>

        <label className="block text-xs font-semibold text-slate-700">
          Global Announcement Bar
          <Input
            name="announcement"
            maxLength={160}
            defaultValue={settings.announcement}
            placeholder="e.g. Free shipping across India on orders over ₹10,000"
            className="mt-1.5 h-9 rounded-xl border-slate-200 bg-white px-3 text-xs shadow-2xs focus:border-[#bef264]"
          />
        </label>

        <label className="block text-xs font-semibold text-slate-700">
          Flat Shipping Charge Per Order (₹)
          <Input
            name="shipping"
            type="number"
            min="0"
            step="0.01"
            defaultValue={settings.shippingPaise / 100}
            className="mt-1.5 h-9 rounded-xl border-slate-200 bg-white px-3 text-xs font-mono shadow-2xs focus:border-[#bef264]"
          />
        </label>

        <label className="flex items-center gap-2.5 pt-2 text-xs font-medium text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            name="codEnabled"
            defaultChecked={settings.codEnabled}
            className="size-4 accent-[#bef264] rounded border-slate-300"
          />
          <span>Enable Cash on Delivery (COD) at checkout</span>
        </label>

        <div className="pt-3 flex justify-end">
          <Button
            type="submit"
            className="h-9 rounded-full bg-[#bef264] px-6 text-xs font-bold text-slate-950 shadow-xs hover:bg-[#a3e635] cursor-pointer"
          >
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
