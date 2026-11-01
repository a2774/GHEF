"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "@/server/actions/admin-auth";

const fieldClass = "h-12 rounded-xl px-4 text-base md:text-base";

export function LoginForm() {
  const [error, action, pending] = useActionState(login, null);

  return (
    <form action={action} className="mt-6 space-y-3">
      <Input
        type="email"
        name="email"
        required
        autoComplete="username"
        aria-label="Email"
        placeholder="Email"
        className={fieldClass}
      />
      <Input
        type="password"
        name="password"
        required
        autoComplete="current-password"
        aria-label="Password"
        placeholder="Password"
        className={fieldClass}
      />
      {error && (
        <p role="alert" className="text-base text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="h-12 w-full rounded-full text-base">
        Log in
      </Button>
    </form>
  );
}
