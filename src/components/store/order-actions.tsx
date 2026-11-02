"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { toast } from "@/components/ui/sonner";
import { cancelMyOrder, requestOrderReturn } from "@/server/actions/checkout";

export function OrderActions({
  orderId,
  orderNumber,
  canCancel,
  canReturn,
}: {
  orderId: number;
  orderNumber: string;
  canCancel: boolean;
  canReturn: boolean;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleCancel() {
    const result = await cancelMyOrder(orderId, orderNumber);
    if (!result.ok) {
      setError(result.error);
      throw new Error(result.error || "Failed to cancel order");
    }
    setError(null);
  }

  function submitReturn() {
    if (!reason.trim()) {
      toast.error("Please provide a reason for return");
      return;
    }
    startTransition(async () => {
      const result = await requestOrderReturn(orderId, orderNumber, reason);
      if (result.ok) {
        toast.success("Return request submitted successfully");
        setError(null);
        setReason("");
      } else {
        toast.error(result.error || "Failed to submit return request");
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-3">
      {canCancel && (
        <ConfirmDeleteDialog
          title="Cancel Order?"
          itemName={`Order #${orderNumber}`}
          description={`Are you sure you want to cancel order #${orderNumber}? A refund will be initiated if payment was already made.`}
          confirmText="Yes, Cancel Order"
          successMessage={`Order #${orderNumber} cancelled successfully`}
          onConfirm={handleCancel}
          trigger={
            <Button
              type="button"
              variant="destructive"
              disabled={pending}
              className="h-12 rounded-full px-6 text-base cursor-pointer"
            >
              Cancel order
            </Button>
          }
        />
      )}
      {canReturn && (
        <div className="space-y-2">
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={3}
            aria-label="Reason for return"
            placeholder="Why would you like to return this?"
            className="w-full rounded-2xl border border-input bg-card p-3 text-base"
          />
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={submitReturn}
            className="h-12 rounded-full px-6 text-base cursor-pointer"
          >
            Request return
          </Button>
        </div>
      )}
      {error && (
        <p role="alert" className="text-base text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
