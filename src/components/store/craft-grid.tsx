import { cacheLife, cacheTag } from "next/cache";

import { type ComingSoonCollection, pendingCollections } from "@/lib/coming-soon";
import { describeDbError } from "@/lib/db-error";
import { listCollectionCovers } from "@/server/services/catalog";

import { type CollectionCard, CollectionCards } from "./collection-cards";

// Throws on failure so a database error is never cached as "no collections".
async function loadCollections() {
  "use cache";
  cacheTag("products");
  cacheLife("hours");
  return listCollectionCovers();
}

/**
 * Collections the shop does not sell yet. Each one shows as a "Coming soon" card with a stand-in
 * picture. As soon as the shop has a category whose name or slug matches `match` with a live
 * product that has a photo, the real card takes its place and the stand-in disappears by itself.
 * To remove one for good, delete its entry here.
 */
const comingSoon: ComingSoonCollection[] = [
  { name: "Dari", slug: "dari", match: /dari|dhurrie|durrie/i, photo: "/images/collections/dari.jpg" },
];

/**
 * "Explore the collections": one photo card per category, using a real product photo from that
 * category, followed by a "Coming soon" card for each collection in `comingSoon` that the shop
 * does not have yet.
 */
export async function CraftGrid() {
  let collections: Awaited<ReturnType<typeof loadCollections>> = [];
  try {
    collections = await loadCollections();
  } catch (error) {
    console.error(`Could not load the collections: ${describeDbError(error)}`);
    // Without the shop's own collections, a lone "Coming soon" card would look odd.
    return null;
  }

  const cards: CollectionCard[] = collections.map(({ name, slug, coverId }) => ({
    name,
    href: `/products?category=${slug}`,
    coverId,
  }));
  for (const { name, slug, photo } of pendingCollections(comingSoon, collections)) {
    cards.push({ name, href: `/products?category=${slug}`, photo, badge: "Coming soon" });
  }
  if (cards.length === 0) return null;

  return <CollectionCards id="collections" title="Explore the collections" cards={cards} />;
}
