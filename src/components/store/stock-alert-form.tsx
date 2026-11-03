"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestStockAlert } from "@/server/actions/stock-alerts";

export function StockAlertForm({ variantId, label }: { variantId: number; label: string }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  if (message?.ok) {
    return (
      <p role="status" className="rounded-2xl bg-muted p-4 text-base">
        {message.text}
      </p>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          const result = await requestStockAlert({ variantId, email });
          setMessage(
            result.ok
              ? { ok: true, text: `We will email you once ${label} is back.` }
              : { ok: false, text: result.error },
          );
        });
      }}
      className="rounded-2xl bg-muted p-4"
    >
      <p className="text-base font-medium">Notify me when {label} is back</p>
      <div className="mt-3 flex gap-2">
        <Input
          type="email"
          required
          autoComplete="email"
          aria-label="Email for the back-in-stock alert"
          placeholder="Email address"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-12 flex-1 rounded-full bg-card px-4 text-base md:text-base"
        />
        <Button type="submit" disabled={pending} className="h-12 rounded-full px-6 text-base">
          Notify me
        </Button>
      </div>
      {message && !message.ok && (
        <p role="alert" className="mt-2 text-base text-destructive">
          {message.text}
        </p>
      )}
    </form>
  );
}
