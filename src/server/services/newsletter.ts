import { desc } from "drizzle-orm";

import { db, withDbRetry } from "@/server/db";
import { newsletterSubscribers } from "@/server/db/schema";
import { notifyOwner } from "@/server/services/notifications";

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
  return withDbRetry(async () =>
    db.select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.consentedAt)).limit(200),
  );
}
