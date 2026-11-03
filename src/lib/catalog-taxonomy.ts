// Shared lists used by the storefront, admin and API. Keep slugs stable: they
// are stored in the database and used in URLs.

export const ROOMS = [
  { slug: "living-room", name: "Living room", blurb: "Anchor the sofa and the centre table." },
  { slug: "bedroom", name: "Bedroom", blurb: "Something soft for the first step of the day." },
  { slug: "dining-room", name: "Dining room", blurb: "Sized to sit under every chair." },
  { slug: "kids-room", name: "Kids room", blurb: "Easy to clean, happy to be played on." },
  { slug: "hallway", name: "Hallway", blurb: "Runners for long, narrow spaces." },
  { slug: "outdoor", name: "Balcony and outdoor", blurb: "Jute and grass for open air." },
] as const;

export type RoomSlug = (typeof ROOMS)[number]["slug"];

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

/** Colours shown in "Shop by colour". Names match the variant colour values. */
export const SHOP_COLOURS = [
  { name: "Ivory", swatch: "#F1EADB" },
  { name: "Beige", swatch: "#DCC9A8" },
  { name: "Sand", swatch: "#C9B596" },
  { name: "Grey", swatch: "#9A968F" },
  { name: "Charcoal", swatch: "#3A3531" },
  { name: "Blue", swatch: "#3F5A73" },
  { name: "Green", swatch: "#5D6B4E" },
  { name: "Red", swatch: "#8C3B32" },
] as const;

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
