"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTeamMember } from "@/server/actions/admin-modules";

const fieldClass = "mt-1.5 h-11 rounded-xl bg-card px-3 text-base md:text-base";

export function TeamForm() {
  const [error, action, pending] = useActionState(createTeamMember, null);

  return (
    <form action={action} className="grid gap-4 rounded-2xl bg-muted p-5 sm:grid-cols-2">
      <label className="block text-base font-medium">
        Name
        <Input name="name" required className={fieldClass} />
      </label>
      <label className="block text-base font-medium">
        Email
        <Input name="email" type="email" required className={fieldClass} />
      </label>
      <label className="block text-base font-medium">
        Password (12+ characters)
        <Input name="password" type="password" required minLength={12} autoComplete="new-password" className={fieldClass} />
      </label>
      <label className="block text-base font-medium">
        Role
        <select name="role" className="mt-1.5 h-11 w-full rounded-xl border border-input bg-card px-3 text-base">
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
      </label>
      {error && (
        <p role="alert" className="text-base text-destructive sm:col-span-2">
          {error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="h-11 w-fit rounded-full px-8 text-base">
        Add member
      </Button>
    </form>
  );
}
