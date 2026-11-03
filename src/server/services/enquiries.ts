import { desc, eq } from "drizzle-orm";

import { ENQUIRY_TYPES } from "@/lib/catalog-taxonomy";
import { db, withDbRetry } from "@/server/db";
import { enquiries } from "@/server/db/schema";
import { notifyOwner } from "@/server/services/notifications";

export type NewEnquiry = typeof enquiries.$inferInsert;
export type Enquiry = typeof enquiries.$inferSelect;

export const enquiryLabels = ENQUIRY_TYPES;

export async function createEnquiry(enquiry: NewEnquiry) {
  await withDbRetry(async () => db.insert(enquiries).values(enquiry));

  await notifyOwner({
    subject: `New enquiry: ${enquiryLabels[enquiry.type]}`,
    text: [
      `Type: ${enquiryLabels[enquiry.type]}`,
      `Name: ${enquiry.name}`,
      `Phone: ${enquiry.phone}`,
      "",
      enquiry.message,
    ].join("\n"),
  });
}

export async function listEnquiries(status?: string) {
  return withDbRetry(async () =>
    db
      .select()
      .from(enquiries)
      .where(status ? eq(enquiries.status, status) : undefined)
      .orderBy(desc(enquiries.createdAt))
      .limit(100),
  );
}

export async function updateEnquiryStatus(id: number, status: string) {
  await withDbRetry(async () =>
    db.update(enquiries).set({ status }).where(eq(enquiries.id, id)),
  );
}
