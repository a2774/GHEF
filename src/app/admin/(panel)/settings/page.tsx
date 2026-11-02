import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateSettings } from "@/server/actions/admin-modules";
import { requireAdmin } from "@/server/auth/admin-session";
import { getStoreSettings } from "@/server/services/settings";

export const instant = false;

const inputClass =
  "mt-1.5 h-9 rounded-xl border-slate-200 bg-white px-3 text-xs shadow-2xs focus:border-[#bef264]";
const labelClass = "block text-xs font-semibold text-slate-700";
const cardClass = "space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs";

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className={cardClass}>
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  ...rest
}: {
  label: string;
  name: string;
  defaultValue: string | number;
  type?: string;
} & React.ComponentProps<typeof Input>) {
  return (
    <label className={labelClass}>
      {label}
      <Input name={name} type={type} defaultValue={defaultValue} className={inputClass} {...rest} />
    </label>
  );
}

export default async function AdminSettingsPage() {
  await requireAdmin("owner");
  const settings = await getStoreSettings();
  const { offers, store } = settings;
  const [tier1, tier2] = [
    offers.bundleTiers[0] ?? { minItems: 3, percent: 0 },
    offers.bundleTiers[1] ?? { minItems: 4, percent: 0 },
  ];
  const valueTier = offers.valueTiers[0] ?? { minPaise: 0, percent: 0 };

  return (
    <div className="max-w-3xl space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Store Configuration & Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Announcements, offers, delivery times, payment methods and showroom details.
        </p>
      </div>

      <form key={JSON.stringify(settings)} action={updateSettings} className="space-y-6">
        <Section title="Storefront Preferences">
          <Field
            label="Extra announcement (shown first in the offer ticker)"
            name="announcement"
            maxLength={160}
            defaultValue={settings.announcement}
            placeholder="e.g. Free shipping across India"
          />
          <Field
            label="Flat Shipping Charge Per Order (₹)"
            name="shipping"
            type="number"
            min="0"
            step="0.01"
            defaultValue={settings.shippingPaise / 100}
          />
          <label className="flex cursor-pointer items-center gap-2.5 pt-2 text-xs font-medium text-slate-700">
            <input
              type="checkbox"
              name="codEnabled"
              defaultChecked={settings.codEnabled}
              className="size-4 rounded border-slate-300 accent-[#bef264]"
            />
            <span>Enable Cash on Delivery (COD) at checkout</span>
          </label>
        </Section>

        <Section
          title="Automatic Offers"
          hint="Applied on the server to every cart. The bigger of the quantity and cart-value offer applies, then the coupon, then the prepaid discount. Set a percent to 0 to switch an offer off."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Quantity offer 1: items" name="bundle1Items" type="number" min="2" defaultValue={tier1.minItems} />
            <Field label="Quantity offer 1: % off" name="bundle1Percent" type="number" min="0" max="90" step="0.5" defaultValue={tier1.percent} />
            <Field label="Quantity offer 2: items" name="bundle2Items" type="number" min="2" defaultValue={tier2.minItems} />
            <Field label="Quantity offer 2: % off" name="bundle2Percent" type="number" min="0" max="90" step="0.5" defaultValue={tier2.percent} />
            <Field label="Cart value offer: minimum (₹)" name="valueMin" type="number" min="0" defaultValue={valueTier.minPaise / 100} />
            <Field label="Cart value offer: % off" name="valuePercent" type="number" min="0" max="90" step="0.5" defaultValue={valueTier.percent} />
            <Field label="Extra % off for prepaid orders" name="prepaidPercent" type="number" min="0" max="50" step="0.5" defaultValue={offers.prepaidPercent} />
            <Field label="Maximum total discount (% of cart)" name="maxDiscountPercent" type="number" min="0" max="90" step="0.5" defaultValue={offers.maxDiscountPercent} />
          </div>
        </Section>

        <Section
          title="Delivery Timeline"
          hint="Working days used for the delivery estimate on product pages."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Ready stock: days to dispatch" name="readyDispatchDays" type="number" min="0" defaultValue={settings.readyDispatchDays} />
            <Field label="Made to order: days to weave" name="madeToOrderDays" type="number" min="0" defaultValue={settings.madeToOrderDays} />
            <Field label="Days in transit" name="transitDays" type="number" min="0" defaultValue={settings.transitDays} />
          </div>
        </Section>

        <Section title="Showroom & Contact" hint="Shown in the footer, contact page and the visit-us section. Leave blank to hide.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone" name="phone" defaultValue={store.phone} placeholder="+91 ..." />
            <Field label="WhatsApp number" name="whatsapp" defaultValue={store.whatsapp} placeholder="919876543210" />
            <Field label="Opening hours" name="hours" defaultValue={store.hours} placeholder="Mon to Sat, 10am to 7pm" />
            <Field label="Google Maps link" name="mapUrl" defaultValue={store.mapUrl} placeholder="https://maps.app.goo.gl/..." />
            <Field label="Instagram link" name="instagram" defaultValue={store.instagram} placeholder="https://instagram.com/..." />
            <Field label="YouTube link" name="youtube" defaultValue={store.youtube} placeholder="https://youtube.com/@..." />
          </div>
          <label className={labelClass}>
            Showroom or workshop address
            <textarea
              name="address"
              rows={3}
              maxLength={300}
              defaultValue={store.address}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-2xs focus:border-[#bef264] focus:outline-none"
            />
          </label>
        </Section>

        <div className="flex justify-end">
          <Button
            type="submit"
            className="h-9 cursor-pointer rounded-full bg-[#bef264] px-6 text-xs font-bold text-slate-950 shadow-xs hover:bg-[#a3e635]"
          >
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
