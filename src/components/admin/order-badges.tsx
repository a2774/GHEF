import { Banknote, CreditCard } from "lucide-react";

import { type OrderStatus, orderStatusLabel } from "@/server/services/order-rules";

const badge =
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap";

const statusStyles: Record<OrderStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  confirmed: "border-sky-200 bg-sky-50 text-sky-800",
  processing: "border-indigo-200 bg-indigo-50 text-indigo-800",
  packed: "border-violet-200 bg-violet-50 text-violet-800",
  shipped: "border-blue-200 bg-blue-50 text-blue-800",
  delivered: "border-emerald-200 bg-emerald-50 text-emerald-800",
  cancelled: "border-rose-200 bg-rose-50 text-rose-800",
  return_requested: "border-orange-200 bg-orange-50 text-orange-800",
  returned: "border-slate-200 bg-slate-100 text-slate-700",
  refunded: "border-slate-200 bg-slate-100 text-slate-700",
};

/** The fulfilment stage of an order: Pending, Confirmed, Shipped, Delivered, Cancelled ... */
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`${badge} ${statusStyles[status]}`}>{orderStatusLabel(status)}</span>;
}

const paymentStyles = {
  unpaid: "border-amber-200 bg-amber-50 text-amber-800",
  paid: "border-emerald-200 bg-emerald-50 text-emerald-800",
  failed: "border-rose-200 bg-rose-50 text-rose-800",
  refunded: "border-slate-200 bg-slate-100 text-slate-700",
} as const;

const paymentLabels = {
  unpaid: "Unpaid",
  paid: "Paid",
  failed: "Payment failed",
  refunded: "Refunded",
} as const;

export type PaymentStatusValue = keyof typeof paymentStyles;

export function paymentStatusLabel(status: PaymentStatusValue) {
  return paymentLabels[status];
}

/** Whether the money has been received: Paid, Unpaid (for example cash still to collect), Failed, Refunded. */
export function PaymentStatusBadge({ status }: { status: PaymentStatusValue }) {
  return <span className={`${badge} ${paymentStyles[status]}`}>{paymentLabels[status]}</span>;
}

/** How the customer chose to pay: Cash on delivery, or online through Razorpay. */
export function PaymentMethodBadge({ method }: { method: string }) {
  const cash = /cash|cod/i.test(method);
  return cash ? (
    <span className={`${badge} border-slate-200 bg-white text-slate-700`}>
      <Banknote aria-hidden="true" className="size-3.5" />
      Cash on delivery
    </span>
  ) : (
    <span className={`${badge} border-indigo-200 bg-indigo-50 text-indigo-800`}>
      <CreditCard aria-hidden="true" className="size-3.5" />
      Online ({method})
    </span>
  );
}
