// Shared lists used by the storefront, admin and API. Keep slugs stable: they
// are stored in the database and used in URLs.

export const ROOMS = [
  { slug: "living-room", name: "Living room", blurb: "Anchor the sofa and the centre table." },
  { slug: "bedroom", name: "Bedroom", blurb: "Something soft for the first step of the day." },
  { slug: "dining-room", name: "Dining room", blurb: "Sized to sit under every chair." },
  { slug: "kids-room", name: "Kids room", blurb: "Easy to clean, happy to be played on." },
  { slug: "study", name: "Study room", blurb: "A calm, quiet floor for work and reading." },
  { slug: "office", name: "Office", blurb: "A soft, quiet floor for focused work." },
  { slug: "hallway", name: "Hallway", blurb: "Runners for long, narrow spaces." },
  { slug: "outdoor", name: "Balcony and outdoor", blurb: "Jute and grass for open air." },
] as const;

export type RoomSlug = (typeof ROOMS)[number]["slug"];

/**
 * The photo on each homepage "Shop by room" card, a 3:4 portrait stored in this project's
 * public/images/shop-by-room folder, so it is served by the site itself with no outside host. A
 * room with an entry always shows its card. A room without one would show a real photo of one of
 * its products, and only once a product is tagged with that room.
 * To change a photo, save the new file under a NEW name and change the path here: browsers and the
 * image cache keep an old file of the same name for hours.
 */
export const ROOM_PHOTOS: Partial<Record<RoomSlug, string>> = {
  "living-room": "/images/shop-by-room/living-room.jpg",
  bedroom: "/images/shop-by-room/bedroom.jpg",
  "dining-room": "/images/shop-by-room/dining-room.jpg",
  "kids-room": "/images/shop-by-room/kids-room.jpg",
  study: "/images/shop-by-room/study.jpg",
  office: "/images/shop-by-room/office.jpg",
  hallway: "/images/shop-by-room/hallway.jpg",
  outdoor: "/images/shop-by-room/outdoor.jpg",
};

/**
 * The title and the short description at the top of a room's page in the shop (what opens from a
 * "Shop by room" card). The description is shown in two lines with a "Read more" link.
 */
export const ROOM_PAGES: Record<RoomSlug, { title: string; intro: string }> = {
  "living-room": {
    title: "Carpet for living room floor",
    intro:
      "Make your living room feel warm and complete with handmade carpets that anchor the sofa and the centre table. From soft shaggy pieces to rich hand-knotted patterns, every carpet here is chosen to add comfort, colour and character to the room where your family gathers.",
  },
  bedroom: {
    title: "Carpet for bedroom floor",
    intro:
      "Start and end your day on something soft. Our bedroom carpets are made to extend beyond the bed and its sides, adding warmth underfoot and a calm, finished look to the room. Choose plush shaggy for comfort, or a quiet pattern for a refined feel.",
  },
  "dining-room": {
    title: "Carpet for dining room floor",
    intro:
      "A good dining room carpet sits under the table and every chair, even when the chairs are pulled back. Browse handmade carpets in sizes that fit your table, in patterns that hide spills and colours that bring the whole room together.",
  },
  "kids-room": {
    title: "Carpet for kids room floor",
    intro:
      "Soft, easy to care for and ready for play. Our kids room carpets give little ones a comfortable place to sit, build and crawl, in cheerful colours and gentle textures that suit a growing room.",
  },
  study: {
    title: "Carpet for study room floor",
    intro:
      "A calm floor helps you think. Browse handmade carpets for the study room that soften sound, add warmth under the desk and chair, and give your reading corner a quiet, finished look.",
  },
  office: {
    title: "Carpet for office floor",
    intro:
      "Give your office a softer, more focused floor. Our carpets for the office add warmth under the desk and chair, in understated colours and patterns that suit a place of work.",
  },
  hallway: {
    title: "Carpet for hallway floor",
    intro:
      "Hallways need carpets that look good and stay put. Choose long runners and narrow carpets that guide the way, protect the floor and welcome people into your home.",
  },
  outdoor: {
    title: "Carpet for balcony and outdoor floor",
    intro:
      "Bring comfort to your balcony and outdoor corners. These carpets, in jute and other natural, hard-wearing textures, suit open-air spaces and add colour and a soft place to sit.",
  },
};

export const roomSlugs = ROOMS.map(({ slug }) => slug) as string[];

export function roomName(slug: string) {
  return ROOMS.find((room) => room.slug === slug)?.name ?? slug;
}

export const ENQUIRY_TYPES = {
  custom: "Custom size or design",
  bulk: "Bulk or export",
  cleaning: "Cleaning and repair",
  wall_to_wall: "Wall to wall",
} as const;

export type EnquiryTypeKey = keyof typeof ENQUIRY_TYPES;

export function isEnquiryType(value: unknown): value is EnquiryTypeKey {
  return typeof value === "string" && value in ENQUIRY_TYPES;
}

/** Area in square feet for sizes such as "5 x 7 ft", "5x7" or "6 ft round". */
export function sizeArea(size: string) {
  const numbers = size.match(/\d+(\.\d+)?/g)?.map(Number) ?? [];
  if (numbers.length >= 2) return numbers[0] * numbers[1];
  if (numbers.length === 1) return numbers[0] * numbers[0];
  return Number.POSITIVE_INFINITY;
}

export function compareSizes(a: string, b: string) {
  return sizeArea(a) - sizeArea(b) || a.localeCompare(b);
}
