import { desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { Suspense } from "react";

import { AccountNav } from "@/components/store/account-nav";
import { AddressForm } from "@/components/store/address-form";
import { DeleteAddressButton } from "@/components/store/delete-address-button";
import { LoginPrompt } from "@/components/store/login-prompt";
import { Button } from "@/components/ui/button";
import { setDefaultAddress } from "@/server/actions/checkout";
import { getCustomerSession } from "@/server/auth/customer-session";
import { db, withDbRetry } from "@/server/db";
import { addresses } from "@/server/db/schema";

export const metadata: Metadata = {
  title: "Your addresses | Ganga Handmade Export",
  robots: { index: false, follow: false },
};

async function Addresses() {
  const session = await getCustomerSession();
  if (!session?.user?.id) return <LoginPrompt message="Log in to see your addresses." href="/account/addresses" />;
  const userId = session.user.id;

  const rows = await withDbRetry(async () =>
    db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, userId))
      .orderBy(desc(addresses.isDefault), desc(addresses.createdAt)),
  );

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <ul className="space-y-3">
        {rows.length === 0 && <li className="rounded-3xl bg-muted p-6 text-lg">No saved addresses yet.</li>}
        {rows.map((address) => (
          <li key={address.id} className="rounded-3xl bg-muted p-5 text-base">
            <p className="font-semibold">
              {address.fullName} ({address.type === "home" ? "Home" : "Work"})
              {address.isDefault && <span className="ml-2 font-normal text-muted-foreground">Default</span>}
            </p>
            <p>
              {address.house}, {address.locality}
            </p>
            <p>
              {address.city}, {address.state} {address.pincode}
            </p>
            <p>{address.phone}</p>
            <div className="mt-3 flex gap-2">
              {!address.isDefault && (
                <form action={setDefaultAddress.bind(null, address.id)}>
                  <Button type="submit" variant="outline" className="h-10 rounded-full px-4 text-base">
                    Make default
                  </Button>
                </form>
              )}
              <DeleteAddressButton id={address.id} addressLine={`${address.house}, ${address.locality}`} />
            </div>
          </li>
        ))}
      </ul>
      <section className="rounded-3xl bg-muted p-5 lg:self-start">
        <h2 className="text-2xl font-semibold tracking-tight">Add an address</h2>
        <div className="mt-4">
          <AddressForm />
        </div>
      </section>
    </div>
  );
}

export default function AddressesPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 pt-36 pb-20 sm:px-6 lg:px-8 lg:pt-40">
      <h1 className="text-title font-semibold">Your addresses.</h1>
      <div className="mt-6">
        <AccountNav />
      </div>
      <div className="mt-6">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-3xl bg-muted motion-reduce:animate-none" />}>
          <Addresses />
        </Suspense>
      </div>
    </main>
  );
}
