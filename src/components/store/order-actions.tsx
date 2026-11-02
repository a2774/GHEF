"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
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

  function cancel() {
    if (!window.confirm("Cancel this order?")) return;
    startTransition(async () => {
      const result = await cancelMyOrder(orderId, orderNumber);
      setError(result.ok ? null : result.error);
    });
  }

  function submitReturn() {
    startTransition(async () => {
      const result = await requestOrderReturn(orderId, orderNumber, reason);
      setError(result.ok ? null : result.error);
    });
  }

  return (
    <div className="space-y-3">
      {canCancel && (
        <Button type="button" variant="destructive" disabled={pending} onClick={cancel} className="h-12 rounded-full px-6 text-base">
          Cancel order
        </Button>
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
          <Button type="button" variant="outline" disabled={pending} onClick={submitReturn} className="h-12 rounded-full px-6 text-base">
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
