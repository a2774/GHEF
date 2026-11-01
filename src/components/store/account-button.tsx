"use client";

import { User } from "lucide-react";
import Link from "next/link";

import { useAuth } from "./auth-provider";

const buttonClass =
  "flex size-11 items-center justify-center rounded-full transition-colors hover:bg-white/15";

export function AccountButton() {
  const { customer, openLogin } = useAuth();

  if (customer) {
    return (
      <Link href="/account" aria-label="Your account" className={buttonClass}>
        <User className="size-5" strokeWidth={1.5} />
      </Link>
    );
  }

  return (
    <button type="button" aria-label="Log in" onClick={openLogin} className={buttonClass}>
      <User className="size-5" strokeWidth={1.5} />
    </button>
  );
}
