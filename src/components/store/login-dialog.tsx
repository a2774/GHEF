"use client";

import { type FormEvent, useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  type AuthResult,
  isGoogleEnabled,
  loginCustomer,
  loginWithGoogle,
  registerCustomer,
} from "@/server/actions/customer-auth";

const fieldClass = "h-12 rounded-xl px-4 text-base md:text-base";

type Mode = "login" | "register" | "forgot";

export function LoginDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => Promise<void>;
}) {
  const [mode, setMode] = useState<Mode>("login");
  const [error, setError] = useState<string | null>(null);
  const [googleReady, setGoogleReady] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (open) void isGoogleEnabled().then(setGoogleReady);
  }, [open]);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(null);
    startTransition(async () => {
      const result: AuthResult =
        mode === "register" ? await registerCustomer(form) : await loginCustomer(form);
      if (result.ok) await onSuccess();
      else setError(result.error);
    });
  }

  const titles = { login: "Welcome back", register: "Create your account", forgot: "Reset your password" };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto rounded-3xl p-6 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-3xl font-semibold tracking-tight">{titles[mode]}</DialogTitle>
          <DialogDescription className="text-base">
            {mode === "forgot" ? "Password reset by email is being set up." : "Your selection will be saved."}
          </DialogDescription>
        </DialogHeader>

        {mode === "forgot" ? (
          <p className="text-base text-muted-foreground">
            Email is not connected yet, so reset links cannot be sent. Write to
            gangahandmadeexport@gmail.com for help with your account.
          </p>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-3">
            {mode === "register" && (
              <Input name="name" autoComplete="name" required aria-label="Full name" placeholder="Full name" className={fieldClass} />
            )}
            <Input name="email" type="email" autoComplete="email" required aria-label="Email" placeholder="Email" className={fieldClass} />
            {mode === "register" && (
              <Input name="phone" type="tel" autoComplete="tel" required aria-label="Mobile number" placeholder="Mobile number" className={fieldClass} />
            )}
            <Input
              name="password"
              type="password"
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              required
              aria-label="Password"
              placeholder="Password"
              className={fieldClass}
            />
            {mode === "register" && (
              <>
                <Input name="confirmPassword" type="password" autoComplete="new-password" required aria-label="Confirm password" placeholder="Confirm password" className={fieldClass} />
                <label className="flex items-start gap-2 text-base">
                  <input type="checkbox" name="consent" required className="mt-1 size-5" />
                  <span>
                    I agree to the{" "}
                    <a href="/policies/terms" target="_blank" className="underline underline-offset-4">
                      terms
                    </a>{" "}
                    and{" "}
                    <a href="/policies/privacy" target="_blank" className="underline underline-offset-4">
                      privacy policy
                    </a>
                    .
                  </span>
                </label>
              </>
            )}
            {error && (
              <p role="alert" className="text-base text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" disabled={pending} className="h-12 w-full rounded-full text-base">
              {pending ? "Please wait..." : mode === "register" ? "Create account" : "Log in"}
            </Button>
          </form>
        )}

        {mode !== "forgot" && googleReady && (
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => startTransition(() => loginWithGoogle(`${location.pathname}${location.search}`))}
            className="h-12 w-full rounded-full text-base"
          >
            Continue with Google
          </Button>
        )}

        <div className="flex flex-wrap justify-between gap-2 text-base">
          {mode === "login" && (
            <>
              <button type="button" onClick={() => switchMode("register")} className="underline underline-offset-4">
                Create an account
              </button>
              <button type="button" onClick={() => switchMode("forgot")} className="underline underline-offset-4">
                Forgot password?
              </button>
            </>
          )}
          {mode !== "login" && (
            <button type="button" onClick={() => switchMode("login")} className="underline underline-offset-4">
              Back to log in
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
