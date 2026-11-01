import Link from "next/link";

const links = [
  { label: "Profile", href: "/account" },
  { label: "Orders", href: "/account/orders" },
  { label: "Addresses", href: "/account/addresses" },
  { label: "Wishlist", href: "/wishlist" },
];

export function AccountNav() {
  return (
    <nav aria-label="Account" className="flex gap-2 overflow-x-auto pb-2">
      {links.map(({ label, href }) => (
        <Link
          key={href}
          href={href}
          className="rounded-full bg-muted px-5 py-2.5 text-base whitespace-nowrap transition-colors hover:bg-secondary"
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
