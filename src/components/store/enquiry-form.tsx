"use client";

import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const enquiryTypes = [
  { value: "custom", label: "Custom size" },
  { value: "bulk", label: "Bulk or export" },
];

const fieldClass = "h-12 rounded-2xl bg-card px-4 text-base md:text-base";

type Status = "idle" | "saving" | "done" | "error";

export function EnquiryForm() {
  const [type, setType] = useState(enquiryTypes[0].value);
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        name: form.get("name"),
        phone: form.get("phone"),
        message: form.get("message"),
      }),
    }).catch(() => null);
    setStatus(response?.ok ? "done" : "error");
  }

  if (status === "done") {
    return (
      <p className="rounded-3xl bg-card p-8 text-xl leading-relaxed">
        Thank you. We have your enquiry and will be in touch.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3 rounded-3xl bg-background p-5 sm:p-8">
      <div className="flex flex-wrap gap-2">
        {enquiryTypes.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            aria-pressed={type === value}
            onClick={() => setType(value)}
            className="h-11 rounded-full border border-border px-5 text-base transition-colors hover:border-primary aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
          >
            {label}
          </button>
        ))}
      </div>
      <Input name="name" required autoComplete="name" aria-label="Your name" placeholder="Your name" className={fieldClass} />
      <Input
        name="phone"
        type="tel"
        required
        autoComplete="tel"
        aria-label="Phone number"
        placeholder="Phone number"
        className={fieldClass}
      />
      <textarea
        name="message"
        required
        rows={3}
        aria-label="Room size and what you have in mind"
        placeholder="Room size and what you have in mind"
        className="w-full rounded-2xl border border-input bg-card px-4 py-3 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      <Button type="submit" disabled={status === "saving"} className="h-14 w-full rounded-full text-base">
        Send enquiry
      </Button>
      <p className="text-base text-muted-foreground" role={status === "error" ? "alert" : undefined}>
        {status === "error"
          ? "Please add your name, phone number and a short message."
          : "We use these details only to reply to your enquiry."}
      </p>
    </form>
  );
}
