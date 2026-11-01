"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  confirmRazorpayPayment,
  placeOrderAction,
  reportPaymentDismissed,
} from "@/server/actions/checkout";

import { useAuth } from "./auth-provider";

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  modal: { ondismiss: () => void };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

function loadRazorpay() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.append(script);
  });
}

type Address = { id: number; label: string; isDefault: boolean };

export function CheckoutForm({
  addresses,
  idempotencyKey,
  codAvailable,
  onlineAvailable,
}: {
  addresses: Address[];
  idempotencyKey: string;
  codAvailable: boolean;
  onlineAvailable: boolean;
}) {
  const router = useRouter();
  const { refreshCustomerState } = useAuth();
  const [addressId, setAddressId] = useState<number | null>(null);
  const [method, setMethod] = useState<"cod" | "razorpay">(codAvailable ? "cod" : "razorpay");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const selectedAddress = addressId ?? addresses.find(({ isDefault }) => isDefault)?.id ?? addresses[0]?.id;

  function finish(orderNumber: string) {
    void refreshCustomerState();
    router.push(`/account/orders/${orderNumber}`);
  }

  function placeOrder() {
    if (!selectedAddress) {
      setError("Add a delivery address first.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await placeOrderAction({ addressId: selectedAddress, method, idempotencyKey });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (!result.razorpay) {
        finish(result.orderNumber);
        return;
      }

      const { orderId, amountPaise } = result.razorpay;
      if (!(await loadRazorpay()) || !window.Razorpay) {
        setError("Could not open the payment window. Check your connection and try again.");
        return;
      }
      new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
        amount: amountPaise,
        currency: "INR",
        name: "Ganga Handmade Export",
        order_id: orderId,
        handler: (response) => {
          void confirmRazorpayPayment({
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          }).then((confirmation) => {
            if (confirmation.ok) finish(result.orderNumber);
            else setError(confirmation.error);
          });
        },
        modal: {
          ondismiss: () => {
            void reportPaymentDismissed(orderId).then(() => {
              setError("Payment was cancelled. Your cart is safe.");
              router.refresh();
            });
          },
        },
      }).open();
    });
  }

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="text-2xl font-semibold tracking-tight">Deliver to</legend>
        {addresses.length === 0 ? (
          <p className="mt-2 text-lg text-muted-foreground">Add an address below to continue.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {addresses.map(({ id, label }) => (
              <label key={id} className="flex gap-3 rounded-2xl bg-card p-4 text-base">
                <input
                  type="radio"
                  name="address"
                  checked={selectedAddress === id}
                  onChange={() => setAddressId(id)}
                  className="mt-1 size-5"
                />
                <span className="whitespace-pre-line">{label}</span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

      <fieldset>
        <legend className="text-2xl font-semibold tracking-tight">Payment</legend>
        <div className="mt-3 space-y-2">
          {codAvailable && (
            <label className="flex items-center gap-3 rounded-2xl bg-card p-4 text-base">
              <input type="radio" name="payment" checked={method === "cod"} onChange={() => setMethod("cod")} className="size-5" />
              Cash on delivery
            </label>
          )}
          {onlineAvailable ? (
            <label className="flex items-center gap-3 rounded-2xl bg-card p-4 text-base">
              <input type="radio" name="payment" checked={method === "razorpay"} onChange={() => setMethod("razorpay")} className="size-5" />
              UPI, cards or net banking
            </label>
          ) : (
            <p className="text-base text-muted-foreground">Online payment is not available yet.</p>
          )}
        </div>
      </fieldset>

      {error && (
        <p role="alert" className="text-base text-destructive">
          {error}
        </p>
      )}
      <Button
        type="button"
        disabled={pending || !selectedAddress}
        onClick={placeOrder}
        className="h-14 w-full rounded-full text-base"
      >
        {pending ? "Placing your order..." : "Place order"}
      </Button>
    </div>
  );
}
