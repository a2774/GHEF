"use client";

import { Button } from "@/components/ui/button";

import { useAuth } from "./auth-provider";

export function LoginPrompt({ message, href }: { message: string; href: string }) {
  const { requireLogin } = useAuth();

  return (
    <div className="rounded-3xl bg-muted p-10 text-center">
      <p className="font-heading text-2xl font-semibold tracking-tight">{message}</p>
      <Button
        type="button"
        onClick={() => void requireLogin({ type: "navigate", href })}
        className="mt-5 h-12 rounded-full px-8 text-base"
      >
        Log in
      </Button>
    </div>
  );
}
