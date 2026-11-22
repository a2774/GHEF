import { desc } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

import { db, withDbRetry } from "@/server/db";
import { newsletterSubscribers } from "@/server/db/schema";
import { notifyOwner } from "@/server/services/notifications";

import { adminDataTag } from "./admin-cache";

export async function subscribeToNewsletter(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const inserted = await withDbRetry(async () =>
    db
      .insert(newsletterSubscribers)
      .values({ email: normalizedEmail })
      .onConflictDoNothing()
      .returning({ id: newsletterSubscribers.id }),
  );

  if (inserted.length > 0) {
    await notifyOwner({
      subject: "New newsletter subscriber",
      text: `${normalizedEmail} joined the newsletter on the website.`,
      replyTo: normalizedEmail,
    });
  }
}

export async function listNewsletterSubscribers() {
  "use cache";
  cacheTag(adminDataTag);
  cacheLife({ stale: 300, revalidate: 60, expire: 3600 });
  return withDbRetry(async () =>
    db.select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.consentedAt)).limit(200),
  );
}
