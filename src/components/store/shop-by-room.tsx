import { cacheLife, cacheTag } from "next/cache";
import Image from "next/image";
import Link from "next/link";

import { ROOM_PHOTOS, ROOMS } from "@/lib/catalog-taxonomy";
import { describeDbError } from "@/lib/db-error";
import { poppinsClass } from "@/lib/fonts/poppins";
import { sectionTop } from "@/lib/section-spacing";
import { listRoomCovers } from "@/server/services/catalog";

import { ProductPhoto } from "./product-photo";
import { SectionHeading } from "./section-heading";

// Throws on failure so a database error is never cached as "no rooms".
async function loadRooms() {
  "use cache";
  cacheTag("products");
  cacheLife("hours");
  return listRoomCovers();
}

type RoomCard = { slug: string; name: string; photo: string | null; coverId: string | null };

/**
 * "Shop by room": a photo card for each room (living room, bedroom and so on), four to a line and
 * the next four below, with the room's name on top and a "View all" button at the bottom. A click
 * opens the shop filtered to that room, which lists every product tagged with it.
 *
 * A room with a photo in ROOM_PHOTOS always shows. A room without one shows a real photo of one of
 * its products, and only when a product is tagged with it, so there is never a placeholder.
 */
export async function ShopByRoom() {
  let covers: Awaited<ReturnType<typeof loadRooms>> = [];
  try {
    covers = await loadRooms();
  } catch (error) {
    console.error(`Could not load the rooms: ${describeDbError(error)}`);
  }

  // The room photos are read here, outside the cache, so a changed photo shows up straight away.
  const rooms = ROOMS.flatMap(({ slug, name }): RoomCard[] => {
    const photo = ROOM_PHOTOS[slug] ?? null;
    if (photo) return [{ slug, name, photo, coverId: null }];
    const coverId = covers.find((cover) => cover.slug === slug)?.coverId ?? null;
    return coverId ? [{ slug, name, photo: null, coverId }] : [];
  });
  if (rooms.length === 0) return null;

  return (
    <section id="rooms" className="scroll-mt-32">
      <div className={`mx-auto max-w-7xl px-4 ${sectionTop} sm:px-6 lg:px-8`}>
        <SectionHeading>Shop by room</SectionHeading>
      </div>

      <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
        <ul className={`grid grid-cols-2 gap-1.5 overflow-hidden rounded-t-[2rem] lg:grid-cols-4 ${poppinsClass}`}>
          {rooms.map(({ slug, name, coverId, photo }) => (
            <li key={slug}>
              <Link
                href={`/products?room=${slug}`}
                className="group relative block aspect-[3/4] overflow-hidden bg-muted text-white"
              >
                {photo ? (
                  <Image
                    src={photo}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                  />
                ) : coverId ? (
                  <ProductPhoto
                    publicId={coverId}
                    alt=""
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                  />
                ) : null}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent via-45% to-black/50"
                />
                <div className="absolute inset-x-4 top-5 sm:inset-x-5">
                  <h3 className="text-xl leading-tight font-extrabold tracking-wide text-white uppercase drop-shadow sm:text-[1.65rem]">
                    {name}
                  </h3>
                  <p className="mt-1 text-[0.65rem] font-medium tracking-[0.2em] uppercase">Carpets</p>
                </div>
                <span className="absolute bottom-4 left-4 border border-white px-5 py-2.5 text-[0.7rem] font-semibold tracking-[0.2em] uppercase transition-colors group-hover:bg-white group-hover:text-black sm:bottom-5 sm:left-5 sm:px-6">
                  View all
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
