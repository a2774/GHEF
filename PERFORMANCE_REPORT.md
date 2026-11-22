# Performance report: Ganga Handmade Export

Audit date: 2026-11-12. Fixes and re-measurement: 2026-11-13. **Step 1 (audit) and Step 3 (fixes, groups A, B and C) are done.**
Stack: Next.js 16.4.3 (App Router, Turbopack, Cache Components + Partial Prerender), React 19.3, Tailwind 4, Drizzle + Neon Postgres (us-east-2), Cloudinary, Razorpay. Hosting per README: Vercel.

## How this was measured

- No live URL was given, so **Lighthouse 12.8 ran on a local production build** (`next build` + `next start`, port 3200, SSD copy), mobile (simulated slow 4G, 4x CPU slowdown) and desktop presets.
- "Before" = the first audit (one run per page). "After" = **median of 3 runs** for mobile (single mobile runs on this machine swing by 10 points, for example home 66 to 81), and one run for desktop (desktop is steady within 2 points).
- `/cart` and `/checkout` were tested signed out (they show the sign-in view). Their SEO score of 69 is the correct `noindex`.
- `/products/varuna` is a seed product without photos; `modern-geometric-3d-cube-area-rug-handcrafted-luxury-carpet` is a product with real photos.
- Bundle sizes come from `next analyze` (built in to Next 16). Lighthouse was installed only in the scratch folder.
- **Not measurable here**: the live site (CDN, brotli, Vercel region), signed-in pages (cart with items, checkout, account, all admin pages). See section 6.

## 1. Results

### Scores (Performance, 0 to 100)

| Page | Mobile before → after | Desktop before → after | LCP mobile | LCP desktop | TBT mobile | CLS desktop |
|---|---|---|---|---|---|---|
| Home `/` | 53 → **80** | 92 → **99** | 6.2 → **3.8 s** | 1.5 → 0.8 s | 1015 → **346 ms** | 0 → 0 |
| Products | 67 → **76** | 74 → **95** | 4.9 → 4.5 s | 1.6 → 1.4 s | 467 → 368 ms | **0.356 → 0** |
| Product (real photos) | 61 → **67** | 75 → **87** | 6.8 → 5.3 s | 4.2 → **2.3 s** | 463 → 520 ms | 0 → 0 |
| Product (no photos) | 55 → **71** | 96 → 98 | 6.5 → 4.4 s | 1.4 → 1.1 s | 890 → 557 ms | 0.001 |
| Cart | 69 → **81** | 98 → 99 | 5.7 → 4.0 s | 1.1 → 0.9 s | 365 → 299 ms | 0 |
| Checkout | 78 → 77 | 97 → 99 | 5.0 → 4.2 s | 1.2 → 0.9 s | 200 → 336 ms | 0 → 0.003 |

Accessibility: 100 on every page except home (96, one audit: the "View all" links under the product rows were a 21 px tap target; **fixed in code after the last measurement, not re-measured**). Best Practices 100, SEO 100 (69 on cart and checkout by design).

Page weight over the network (mobile): home **1,208 → 699 KB**, products 948 → 795 KB, product with photos 862 to 1,209 → 746 KB, cart **691 → 483 KB**, checkout 695 → 487 KB.

### What did not reach the target

- **Mobile LCP is still 3.8 to 5.3 s** in this lab setting (target was under 4 s for home, under 3.5 s for the product page). On Lighthouse's simulated 1.6 Mbps phone, 480 to 800 KB of page cannot paint much sooner: the text waits for the fonts, CSS and framework code to arrive. The product photo itself now starts at once (at 105 ms) and is no longer the problem; the remaining cost is bytes. Real phones on normal 4G are usually faster than this simulation.
- **Mobile Performance 67 to 81** against a hope of 80+: home and cart reach it, product and products do not.
- **Product page desktop 87** (target 92+).

## 2. Issue table: what was done

| # | Area | Problem | Status | What was done |
|---|---|---|---|---|
| 1 | Images / LCP | Main product photo lazy, 5 photos loading together | **Done** | `ProductPhoto` takes `priority`; the first photo is `eager`, `fetchpriority=high` and preloaded; the other slides load after the first one (next one after 2.5 s, or when swiped). `src/components/store/product-photo.tsx`, `product-gallery.tsx` |
| 2 | CLS | /products placeholder smaller than the page | **Done** | New `catalog-skeleton.tsx` with the same shape (heading, filter column, 9 cards). Desktop CLS 0.356 → 0 |
| 3 | LCP / animation | Hero `<h1>` faded in | **Done** | Fade removed from the headline only; the line below and the button still fade. Small visible change, as approved |
| 4 | Main thread | 2,300+ DOM elements, long layout | **Done, partly** | Sections below the first screen and the footer use `content-visibility: auto` (`deferred.tsx`). The hidden shop-menu links were **not** removed (see section 6) |
| 5 | JS bundle | Login dialog and dialog library in every page | **Done** | Login dialog, mobile menu sheet and photo viewer load on demand (fetched when the browser is idle); FAQ is plain `details`; `Button`, `Input`, `Badge` are plain HTML (default `type="button"` kept) |
| 6 | JS bundle | `cn` package 20.8 KB gz | **Done** | Replaced by `clsx` + `tailwind-merge` (8.2 KB gz); same class merging |
| 7 | JS / hydration | `next-cloudinary` client component per photo | **Done** | `ProductPhoto` is a server component (plain `<img>` + `srcset`, Cloudinary does the resizing); `next-cloudinary` removed; dead `image-manager.tsx` removed |
| 8 | Fonts | 12 files (244 KB) preloaded everywhere | **Done, with a note** | Oswald, Cormorant, Playfair, Geist Mono not preloaded; one font file per family (`lib/fonts/*`) so a page only loads fonts it uses; the rupee sign now uses a font already on the device (the `₹` was pulling Inter's 84 KB extended file). Preloads: **12 → 8 files**. Product page fonts in Chrome: 13 files / 354 KB → **10 files / 196 KB**. **Weights not trimmed**: Poppins 300 and 800 are both used in the design |
| 9 | Image config | No AVIF, 4 h cache | **Done, with a note** | AVIF + WebP; cache 1 day (not 1 year: you replace photos by the same name, and a long cache would keep showing the old ones) |
| 10 | HTML payload | Home HTML 538 KB | **Done** | The carpet drawings (shown when a product has no photo) are now small cached files (`/rug-art/*.svg`, `lib/rug-art.ts`) instead of 400 shapes in every card. Home HTML 538 → **364 KB** (29 KB gzipped), products 795 → **226 KB**, product 251 → 148 KB, inline payload on home 274 → 163 KB |
| 11 | Cold database | Far-away database | **Partly** | `vercel.json` pins the function region to `iad1` (next to Neon `us-east-2`). **Moving Neon to Singapore was not done**: it is a data move that needs your decision |
| 12 | Stock updates in a loop | One UPDATE per cart line | **Done** | One statement (`UPDATE ... FROM (VALUES ...)`) for checkout and restock; the SQL was checked with a plan-only `EXPLAIN`, and the merge helper has unit tests. **No order was placed to test it end to end**: please place and cancel one cash-on-delivery test order |
| 13 | Dependencies | Unused packages | **Done, partly** | Removed `next-cloudinary`, `cn`, `@neon/env`. Kept `@neon/config` (used by `neon.ts`) and `@auth/drizzle-adapter` (login). Radix and Base UI both stay (admin-only parts, under 10 KB, a rewrite would risk the admin) |
| 14 | Admin data | 12 admin pages read the database on every visit | **Done** | Customers, Inventory, Payments, Returns, Reviews, Banners, Coupons, Team, Settings, Subscribers, Enquiries and Audit now come from the admin cache. New reviews, payments and profile edits clear it; `logAdminAction` clears it for the Audit page. **Not tested signed in** (see section 6) |
| 15 | Accessibility | Contrast, labels, heading order | **Done** | Greys `#777` → `#666`, green `#1f8a4c` → `#18733c`, small timeline label darker, header glass darker (0.42 → 0.62), card names are `h2` on /products, room cards labelled by their own text |
| 16 | Hosting / CDN | Not checkable without the live URL | **Open** | `vercel.json` added; compression, brotli and edge caching still need a live URL |

## 3. Bundle numbers after the fixes (compressed, per route)

| Route | Before | After | Biggest parts now |
|---|---|---|---|
| `/` | 382 KB | **334 KB** | Next + React 224, Base UI 26, global CSS 21, store components 10, sonner 9, tailwind-merge 8 |
| `/products` | 376 KB | **336 KB** | same shape |
| `/products/[slug]` | 391 KB | **354 KB** | adds product components 22 |
| `/cart` | 376 KB | **335 KB** | same shape |
| `/checkout` | 351 KB | **336 KB** | same shape |
| `/admin` | 338 KB | **310 KB** | Next + React 212, admin components 11 |

The analyzer also counts the pieces that load later (login dialog, mobile menu, photo viewer), so the real first load is a little lower than these totals. The 224 KB "Next + React" part is the framework baseline.

## 4. Before / after checklist

- [x] Home mobile: Performance 53 → 80 (target 70+), LCP 6.2 → 3.8 s (target under 4 s), TBT 1015 → 346 ms (target under 400 ms)
- [x] Products desktop: CLS 0.356 → 0 (target under 0.1), Performance 74 → 95 (target 90+)
- [ ] Product with photos, mobile: LCP 6.8 → 5.3 s (target under 3.5 s), Performance 61 → 67 (target 80+): **improved, target missed**
- [ ] Product with photos, desktop: LCP 4.2 → 2.3 s (target under 2 s), Performance 75 → 87 (target 92+): **improved, target missed**
- [x] Fonts preloaded per page: 12 files / 244 KB → 8 files
- [ ] First-load JS on storefront pages: about 380 KB → 334 to 354 KB gz (target under 320): **improved, target missed**
- [ ] Home HTML decoded: 538 → 364 KB (target under 350): **very close**
- [x] Accessibility: contrast and label items fixed; 100 on 5 of 6 pages, home 96 (tap-target fix made after the last measurement)
- [x] `npm run build`, `npm run lint` (eslint), type check and the 47 tests pass
- [x] No design, content or behaviour change except where marked in the table (hero fade, header glass, greys)

## 5. Other changes made on the way

- Admin session is remembered for 1 minute on the server and the admin layout no longer waits for it (earlier task); `session-memo.ts` has tests.
- Photo upload in the admin product form: 3 at a time, resized before upload, drag and arrows to reorder; order is saved.
- Certificates strip on the home page.
- New files to commit: `public/images/certificates/`, `public/images/shop-by-room/`, `public/images/collections/`, `src/app/rug-art/`, `src/lib/fonts/`, `vercel.json`.
- **`npm install` was already run in the F: folder.** Restart your dev server (Ctrl+C, then `npm run dev`) so it picks up the new packages and the new `globals.css`.

## 6. Limits and open items (please read)

1. **Admin pages were not tested signed in.** My browser has no admin session and I do not sign in for you. The code builds, type-checks and redirects to the login page when signed out. Please open Customers, Inventory, Payments, Returns, Reviews, Banners, Coupons, Team, Settings, Subscribers, Enquiries and Audit once, and save one change on each of Coupons or Banners, to confirm the lists refresh.
2. **Stock update (issue 12)** is checked by plan only. Place one COD test order and cancel it, and confirm the stock goes down, then back up.
3. **Hidden shop-menu links** (about 35 links) are still in the page. Removing them would shave about 100 DOM elements but hide those category links from search engines, so I left them.
4. **Mobile LCP** is bandwidth-bound. Options if you want more: stop preloading Poppins on cart and checkout (saves 48 KB there, but Poppins text on product pages would swap in a little later), and trim more JavaScript. Both need a decision.
5. **Live site checks** (compression, CDN cache headers, Vercel region setting in the dashboard, Neon region) need the live URL.
6. `vercel.json` sets the region to `iad1`. If your Vercel project already uses another region, this file will override it.
