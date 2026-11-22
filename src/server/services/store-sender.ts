import { cacheLife, cacheTag } from "next/cache";

import { describeDbError } from "@/lib/db-error";
import { siteName, supportEmail } from "@/lib/site";

import { getStoreSettings } from "./settings";

/** The "From" block of a shipping label. */
export type LabelSender = { name: string; address: string; phone: string; email: string };

// Cached like the rest of the storefront settings (and cleared when the owner saves Settings), so
// opening an order does not need a database round trip for the address.
async function loadSender(): Promise<LabelSender> {
  "use cache";
  cacheTag("storefront");
  cacheLife("hours");
  const { brandName, store } = await getStoreSettings();
  return { name: brandName || siteName, address: store.address, phone: store.phone, email: supportEmail };
}

/**
 * Never throws. If the settings cannot be read (for example the database connection dropped), the
 * label gets the brand name and email only and `complete` is false, so the page can tell the owner.
 */
export async function getLabelSender(): Promise<{ sender: LabelSender; complete: boolean }> {
  try {
    return { sender: await loadSender(), complete: true };
  } catch (error) {
    console.error(`Label sender address not loaded: ${describeDbError(error)}`);
    return { sender: { name: siteName, address: "", phone: "", email: supportEmail }, complete: false };
  }
}
