import Link from "next/link";

import { BrandLogo } from "./brand-logo";
import { NewsletterForm } from "./newsletter-form";

const footerLinks = [
  { title: "Shop", links: ["Collection", "Custom Sizes"] },
  { title: "Help", links: ["Shipping", "Returns", "Contact"] },
  { title: "Legal", links: ["Privacy", "Terms", "Cookie Settings"] },
  { title: "Follow", links: ["Instagram", "Pinterest", "YouTube"] },
];

export function SiteFooter() {
  return (
    <footer className="bg-ink text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div className="max-w-md">
            <BrandLogo className="size-24" />
            <h2 className="mt-6 text-3xl font-semibold tracking-tight">Stay in touch.</h2>
            <div className="mt-5">
              <NewsletterForm />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {footerLinks.map(({ title, links }) => (
              <div key={title}>
                <h3 className="text-lg font-semibold">{title}</h3>
                <ul className="mt-3">
                  {links.map((link) => (
                    <li key={link}>
                      <Link
                        href="#"
                        className="block py-1.5 text-base text-white/70 transition-colors hover:text-white"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-14 border-t border-white/10 pt-6 text-base text-white/60">
          © 2026 Ganga Handmade Export
        </p>
      </div>
    </footer>
  );
}
