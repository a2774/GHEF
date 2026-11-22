"use client";

import { Ban, CheckCircle2, Loader2, PackageCheck } from "lucide-react";
import { useTransition } from "react";

import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { toast } from "@/components/ui/sonner";
import {
  cancelOrderFromList,
  confirmOrder,
  markOrderDelivered,
  type OrderActionResult,
} from "@/server/actions/admin-orders";
import { canConfirmOrder, canTransition, type OrderStatus } from "@/server/services/order-rules";

const buttonBase =
  "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-semibold whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60";

/**
 * The quick buttons in the Action column of the Orders list: Confirm order (a Pending order that is
 * cash on delivery or paid; a new order starts as Pending and becomes Confirmed when this is pressed),
 * Cancel order (until it is shipped; the items go back into stock) and Mark delivered (a Shipped
 * order). The buttons shown depend on the order's status; the server checks it again when pressed.
 */
export function OrderRowActions({
  id,
  orderNumber,
  status,
  paymentMethod,
  paymentStatus,
}: {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: string;
}) {
  const [pending, startTransition] = useTransition();
  const canConfirm = canConfirmOrder(status, paymentMethod, paymentStatus);
  const canCancel = canTransition(status, "cancelled");
  const canDeliver = status === "shipped";

  if (!canConfirm && !canCancel && !canDeliver) return null;

  function run(task: () => Promise<OrderActionResult>, success: string) {
    startTransition(async () => {
      try {
        const result = await task();
        if (result.ok) toast.success(success);
        else toast.error(result.error);
      } catch {
        toast.error("Could not reach the server. Nothing was changed; try again.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      {canConfirm && (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => confirmOrder(id), `Order ${orderNumber} confirmed`)}
          className={`${buttonBase} bg-emerald-600 text-white hover:bg-emerald-700`}
        >
          {pending ? <Loader2 aria-hidden="true" className="size-3.5 animate-spin" /> : <CheckCircle2 aria-hidden="true" className="size-3.5" />}
          Confirm order
        </button>
      )}

      {canDeliver && (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => markOrderDelivered(id), `Order ${orderNumber} marked delivered`)}
          className={`${buttonBase} bg-slate-900 text-white hover:bg-slate-700`}
        >
          {pending ? <Loader2 aria-hidden="true" className="size-3.5 animate-spin" /> : <PackageCheck aria-hidden="true" className="size-3.5" />}
          Mark delivered
        </button>
      )}

      {canCancel && (
        <ConfirmDeleteDialog
          title="Cancel this order?"
          itemName={orderNumber}
          description="The order is cancelled and its items go back into stock. The customer is not told automatically, so call or message them. If they already paid online, refund the payment from your Razorpay account: this store does not send refunds."
          confirmText="Cancel order"
          cancelText="Keep order"
          pendingText="Cancelling..."
          confirmIcon={<Ban className="size-3.5" />}
          successMessage={`Order ${orderNumber} cancelled and stock returned`}
          onConfirm={async () => {
            const result = await cancelOrderFromList(id);
            if (!result.ok) throw new Error(result.error);
          }}
          trigger={
            <button
              type="button"
              disabled={pending}
              className={`${buttonBase} border border-rose-200 bg-white text-rose-700 hover:bg-rose-50`}
            >
              <Ban aria-hidden="true" className="size-3.5" />
              Cancel order
            </button>
          }
        />
      )}
    </div>
  );
}
