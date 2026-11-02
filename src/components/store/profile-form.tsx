"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProfile } from "@/server/actions/customer-auth";

const fieldClass = "mt-1.5 h-12 rounded-xl bg-card px-4 text-base md:text-base";

export function ProfileForm({ name, phone }: { name: string; phone: string }) {
  const [result, action, pending] = useActionState(updateProfile, null);

  return (
    <form action={action} className="space-y-4">
      <label className="block text-base font-medium">
        Full name
        <Input name="name" required defaultValue={name} autoComplete="name" className={fieldClass} />
      </label>
      <label className="block text-base font-medium">
        Mobile number
        <Input name="phone" type="tel" required defaultValue={phone} autoComplete="tel" className={fieldClass} />
      </label>
      {result && !result.ok && (
        <p role="alert" className="text-base text-destructive">
          {result.error}
        </p>
      )}
      {result?.ok && <p role="status" className="text-base">Saved.</p>}
      <Button type="submit" disabled={pending} className="h-12 rounded-full px-8 text-base">
        Save profile
      </Button>
    </form>
  );
}
