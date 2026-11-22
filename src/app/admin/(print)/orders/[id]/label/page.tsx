import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BackButton } from "@/components/admin/back-button";
import { PrintButton } from "@/components/admin/print-button";
import { ShippingLabel } from "@/components/admin/shipping-label";
import { requireAdmin } from "@/server/auth/admin-session";
import { getAdminOrder } from "@/server/services/admin";
import { getLabelSender } from "@/server/services/store-sender";

export const instant = false;

export const metadata: Metadata = {
  title: "Shipping label",
  robots: { index: false, follow: false },
};

// Paper size for printing and for "Save as PDF": A4, with no browser margins or page headers.
const printStyle = `
@page { size: A4; margin: 0; }
@media print {
  html, body { background: #fff !important; margin: 0 !important; padding: 0 !important; }
}
`;

export default async function ShippingLabelPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ print?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { print } = await searchParams;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) notFound();

  const [result, { sender, complete }] = await Promise.all([getAdminOrder(numericId), getLabelSender()]);
  if (!result) notFound();
  const { order, items } = result;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 print:min-h-0 print:bg-white print:p-0">
      <style>{printStyle}</style>

      <div className="mx-auto mb-5 flex max-w-xl flex-wrap items-center justify-between gap-3 print:hidden">
        <BackButton fallbackHref={`/admin/orders/${order.id}`}>Back to order</BackButton>
        <PrintButton fileName={`Shipping label ${order.orderNumber}`} autoPrint={print === "1"} />
      </div>
      {!complete && (
        <p className="mx-auto mb-4 max-w-xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-800 print:hidden">
          The store address could not be loaded just now, so the From block shows only the brand name. Reload this
          page to include it.
        </p>
      )}
      <p className="mx-auto mb-4 max-w-xl text-center text-xs text-slate-500 print:hidden">
        In the print window choose <strong>Save as PDF</strong> to download the label, or pick your printer. Paper
        size is A4.
      </p>

      <div className="mx-auto w-fit bg-white shadow-lg print:shadow-none">
        <ShippingLabel order={order} items={items} sender={sender} />
      </div>
    </main>
  );
}
