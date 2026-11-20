import assert from "node:assert/strict";
import { test } from "node:test";

import { pendingCollections } from "./coming-soon";

const planned = [{ name: "Dari", slug: "dari", match: /dari|dhurrie|durrie/i, photo: "/images/collections/dari.jpg" }];

test("keeps the stand-in while the shop has no matching category", () => {
  const shop = [
    { name: "Hand Tufted", slug: "hand-tufted" },
    { name: "Shaggy", slug: "shaggy" },
  ];
  assert.deepEqual(pendingCollections(planned, shop), planned);
  assert.deepEqual(pendingCollections(planned, []), planned);
});

test("drops the stand-in once a real Dari category exists, however it is named", () => {
  assert.deepEqual(pendingCollections(planned, [{ name: "Dari", slug: "dari" }]), []);
  assert.deepEqual(pendingCollections(planned, [{ name: "Dari Rugs", slug: "dari-rugs" }]), []);
  assert.deepEqual(pendingCollections(planned, [{ name: "Handwoven Dhurries", slug: "handwoven-dhurries" }]), []);
  assert.deepEqual(pendingCollections(planned, [{ name: "Flat weave", slug: "durrie" }]), []);
});
