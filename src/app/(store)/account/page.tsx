import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AccountNav } from "@/components/store/account-nav";
import { ProfileForm } from "@/components/store/profile-form";
import { Button } from "@/components/ui/button";
import { logoutCustomer } from "@/server/actions/customer-auth";
import { getCustomerSession } from "@/server/auth/customer-session";
import { db, withDbRetry } from "@/server/db";
import { users } from "@/server/db/schema";

export const metadata: Metadata = {
  title: "Your account | Ganga Handmade Export",
  robots: { index: false, follow: false },
};

async function Account() {
  const session = await getCustomerSession();
  if (!session?.user?.id) redirect("/");
  const userId = session.user.id;

  const [user] = await withDbRetry(async () =>
    db
      .select({
        name: users.name,
        email: users.email,
        phone: users.phone,
        emailVerified: users.emailVerified,
        phoneVerified: users.phoneVerified,
      })
      .from(users)
      .where(eq(users.id, userId)),
  );
  if (!user) redirect("/");

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
      <section className="rounded-3xl bg-muted p-6">
        <h2 className="text-2xl font-semibold tracking-tight">Profile</h2>
        <div className="mt-5">
          <ProfileForm name={user.name ?? ""} phone={user.phone ?? ""} />
        </div>
      </section>
      <section className="rounded-3xl bg-muted p-6 text-lg lg:self-start">
        <h2 className="text-2xl font-semibold tracking-tight">Verification</h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-base text-muted-foreground">{user.email}</dt>
            <dd>{user.emailVerified ? "Email verified" : "Email not verified"}</dd>
          </div>
          <div>
            <dt className="text-base text-muted-foreground">{user.phone ?? "No mobile number"}</dt>
            <dd>{user.phoneVerified ? "Mobile verified" : "Mobile not verified"}</dd>
          </div>
        </dl>
        <form action={logoutCustomer} className="mt-6">
          <Button type="submit" variant="outline" className="h-12 rounded-full px-8 text-base">
            Log out
          </Button>
        </form>
      </section>
    </div>
  );
}

export default function AccountPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 pt-36 pb-20 sm:px-6 lg:px-8 lg:pt-40">
      <h1 className="text-title font-semibold">Your account.</h1>
      <div className="mt-6">
        <AccountNav />
      </div>
      <div className="mt-6">
        <Suspense fallback={<div className="h-80 animate-pulse rounded-3xl bg-muted motion-reduce:animate-none" />}>
          <Account />
        </Suspense>
      </div>
    </main>
  );
}
