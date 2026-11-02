"use client";

import { useActionState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveAddress } from "@/server/actions/checkout";

const fields = [
  { name: "fullName", label: "Full name", autoComplete: "name" },
  { name: "phone", label: "Mobile number", autoComplete: "tel" },
  { name: "pincode", label: "PIN code", autoComplete: "postal-code" },
  { name: "state", label: "State", autoComplete: "address-level1" },
  { name: "city", label: "City", autoComplete: "address-level2" },
  { name: "locality", label: "Locality", autoComplete: "address-line2" },
  { name: "house", label: "House or building number", autoComplete: "address-line1" },
  { name: "landmark", label: "Street or landmark (optional)", autoComplete: "off" },
];

export function AddressForm() {
  const [result, action, pending] = useActionState(saveAddress, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (result?.ok) formRef.current?.reset();
  }, [result]);

  return (
    <form ref={formRef} action={action} className="grid gap-3 sm:grid-cols-2">
      {fields.map(({ name, label, autoComplete }) => (
        <label key={name} className="block text-base font-medium">
          {label}
          <Input
            name={name}
            required={name !== "landmark"}
            autoComplete={autoComplete}
            className="mt-1.5 h-11 rounded-xl bg-card px-3 text-base md:text-base"
          />
        </label>
      ))}
      <label className="block text-base font-medium">
        Address type
        <select name="type" className="mt-1.5 h-11 w-full rounded-xl border border-input bg-card px-3 text-base">
          <option value="home">Home</option>
          <option value="work">Work</option>
        </select>
      </label>
      {result && !result.ok && (
        <p role="alert" className="text-base text-destructive sm:col-span-2">
          {result.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="h-12 w-fit rounded-full px-8 text-base sm:col-span-2">
        Save address
      </Button>
    </form>
  );
}
