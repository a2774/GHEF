"use client";

import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Status = "idle" | "saving" | "done" | "error";

export function NewsletterForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    const response = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: new FormData(event.currentTarget).get("email") }),
    }).catch(() => null);
    setStatus(response?.ok ? "done" : "error");
  }

  if (status === "done") {
    return <p className="text-lg">Thank you. You are on the list.</p>;
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex gap-2">
        <Input
          type="email"
          name="email"
          required
          aria-label="Email address"
          placeholder="you@example.com"
          aria-invalid={status === "error"}
          className="h-12 rounded-full border-white/25 px-5 text-base text-primary-foreground placeholder:text-white/50 md:text-base"
        />
        <Button
          type="submit"
          disabled={status === "saving"}
          className="h-12 rounded-full bg-primary-foreground px-6 text-base text-primary hover:bg-white"
        >
          Join
        </Button>
      </div>
      <p className="mt-3 text-base text-white/60" role={status === "error" ? "alert" : undefined}>
        {status === "error"
          ? "That did not work. Check your email and try again."
          : "New pieces and stories by email. Unsubscribe any time."}
      </p>
    </form>
  );
}
