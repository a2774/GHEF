import { db, withDbRetry } from "@/server/db";
import { enquiries } from "@/server/db/schema";
import { notifyOwner } from "@/server/services/notifications";

export type NewEnquiry = typeof enquiries.$inferInsert;

const enquiryLabels = { custom: "Custom size", bulk: "Bulk or export" };

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
