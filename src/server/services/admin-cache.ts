import { revalidateTag } from "next/cache";

/** Cache tag on admin panel data (dashboard, products, orders). */
export const adminDataTag = "admin";

/**
 * Call after a customer-side change the admin panel shows, such as a new order,
 * payment, return request, enquiry, sign-up or newsletter subscriber.
 * The next admin visit then loads fresh data instead of the cached copy.
 */
export function markAdminDataChanged() {
  try {
    revalidateTag(adminDataTag, { expire: 0 });
  } catch (error) {
    // Never let a cache refresh break the customer's action.
    console.error("Could not refresh admin data:", error);
  }
}
