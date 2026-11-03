import { ENQUIRY_TYPES, ROOMS } from "./catalog-taxonomy";

export type NavLink = { label: string; href: string };
export type NavColumn = { title: string; links: NavLink[] };

export const collectionLinks: NavLink[] = [
  { label: "Ready to dispatch", href: "/products?ready=on" },
  { label: "Bestsellers", href: "/products?bestseller=on" },
  { label: "New arrivals", href: "/products?sort=newest" },
  { label: "On sale", href: "/products?sale=on&sort=discount" },
  { label: "All products", href: "/products" },
];

export const roomLinks: NavLink[] = ROOMS.map(({ slug, name }) => ({ label: name, href: `/products?room=${slug}` }));

export const serviceLinks: NavLink[] = [
  { label: ENQUIRY_TYPES.custom, href: "/services/custom-carpets" },
  { label: ENQUIRY_TYPES.bulk, href: "/services/bulk-and-export" },
  { label: ENQUIRY_TYPES.cleaning, href: "/services/cleaning-and-repair" },
  { label: ENQUIRY_TYPES.wall_to_wall, href: "/services/wall-to-wall" },
];

export function shopColumns(categories: { name: string; slug: string }[]): NavColumn[] {
  return [
    {
      title: "By craft",
      links: categories.map(({ name, slug }) => ({ label: name, href: `/products?category=${slug}` })),
    },
    { title: "By room", links: roomLinks },
    { title: "Collections", links: collectionLinks },
    { title: "Services", links: serviceLinks },
  ];
}
