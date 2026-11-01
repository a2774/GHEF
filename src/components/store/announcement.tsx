import { cacheLife, cacheTag } from "next/cache";

import { getStoreSettings } from "@/server/services/settings";

export async function Announcement() {
  "use cache";
  cacheTag("storefront");
  cacheLife("hours");

  const { announcement } = await getStoreSettings();
  if (!announcement) return null;

  return <p className="liquid-glass mb-5 w-fit rounded-full px-5 py-2 text-base">{announcement}</p>;
}
