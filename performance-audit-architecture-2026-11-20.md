# Performance Audit: Navigation, Caching and Data Architecture – Ganga Handmade Export

**Date:** 2026-11-20  |  **Scope:** prefetching, data caching, client cache, API/database, images, JavaScript, loading UI (the 17 points of the brief)  |  **Method:** code reading + measurements on a local production build (`next build` + `next start`), headless Chrome, Lighthouse 12.8.2

Related report (Core Web Vitals, bundle sizes, fonts, security): `performance-report-ganga-handmade-export-2026-11-20.md`.

## 1. Summary

- **The site is already built the way your target diagram describes**, apart from two pieces that do not fit it (TanStack Query, Redis, see section 5). It uses Next 16 Server Components with Cache Components (`"use cache"`, tags, `cacheLife`), Partial Prefetching, prerendered product pages and skeleton fallbacks.
- **In production, navigation was already fast** (measured, section 4): Products to a product page opens in 8 to 198 ms with no loading state; Home to Products showed the data in about 80 to 370 ms, but behind a skeleton.
- **The slowness you saw ("Compiling...") was the dev server on the F: hard disk**, not the code (first request of a page: 19 to 186 s on F:, 1.6 to 4 s on the SSD copy `C:\dev\GHEF`). This was handled before this report.
- **3 real gaps were found and fixed** in this audit: (1) the busiest links did not load their data before the click, so a skeleton flashed; (2) static files in `public/` had no browser cache; (3) the first product photos on `/products` were lazy-loaded.
- **Not done on purpose:** adding TanStack Query and Redis. They would add code and a paid service without a measured problem to solve. Section 5 says when each one starts to make sense.
- **Open decisions for you:** upgrade Next.js to 16.4.6 (security advisories), Neon database region, shared cache (Redis) only if you grow beyond one server, remove the unused `/api/products` route.

## 2. Architecture as found

```text
Browser
  Router Cache (staleTimes.dynamic 30 s) + Link prefetch (production only)
  Client state: cart count / wishlist ids loaded once in AuthProvider (server action)
        |
Next.js 16 App Router (Turbopack), cacheComponents + partialPrefetching
  Route types from the build: "/" static (1 h revalidate, 1 d expire); "/products" partial prerender
  (shell + streamed listing); "/products/[slug]" prerendered with generateStaticParams;
  cart, checkout, account partial prerender with per-user parts
        |
Server cache: 38 "use cache" functions (18 admin lists, 20 storefront parts/pages)
  tags: products (11), storefront (8), admin (18)   |   cacheLife: hours (18, storefront), 5 min stale / 1 min revalidate / 1 h expire (18, admin lists), minutes (1), 5 min stale (1)
        |
PostgreSQL (Neon, us-east-2) via pg Pool + Drizzle, function region pinned to iad1 (vercel.json)
Images: Cloudinary (srcset, f_auto, q_auto); hero photo as static AVIF/WebP files
```

Facts used for the audit: client-side `fetch` calls exist in only 4 places (`/api/auth/session` once per visit, newsletter, enquiry, admin upload), so there are no duplicate API calls to remove; 33 storefront client components are forms, carts, galleries and menus (interactive, so they need to be client components); database indexes already exist on the foreign keys and sort columns that queries use (`products.category_id`, `product_images.product_id`, `orders.created_at`, unique `(product_id, size, color)` and others).

## 3. The 17 points, one by one

| # | Requirement | Status | Evidence / what was done |
|---|---|---|---|
| 1 | Fast page navigation, prefetch | Done, improved today | `Link` prefetch on; Partial Prefetching on. Product cards use `prefetch`. Today: `prefetch` added to the hero button, the header "Ready to ship" link and the three "View all" links on home. |
| 2 | Prefetch data before the click | Done, improved today | In Next 16 this is `<Link prefetch>`: it loads the link's cached data (here `loadProducts(filters)`) before the click (docs: "Optimizing prefetching"). Not applied to every link (each prefetch costs a server request). |
| 3 | TanStack Query | **Not added** | All data is read on the server and cached there; the client only has 4 `fetch` calls. See section 5. |
| 4 | Stale-while-revalidate | Already in place | Server: `cacheLife` stale / revalidate / expire. Client: Router Cache + prefetch. Tags clear the cache when an admin saves. |
| 5 | Next.js server cache, ISR | Already in place | 38 `"use cache"` functions, hours for catalogue and settings, minutes for listings, tag invalidation on admin changes. |
| 6 | Redis / server cache | **Not added** (decision, section 5) | The default cache is per server process (docs). A shared cache only pays off with several servers or a cold serverless instance. |
| 7 | Browser cache | Improved today | `/_next/static` is immutable (Next). `/rug-art/*.svg` immutable. Today: `/images/*` and `/brand-symbol.svg` went from `max-age=0` (a check on every page) to `max-age=86400, stale-while-revalidate=604800`. |
| 8 | Image optimization | Already in place, one fix today | Cloudinary `srcset` (256 to 2048 px, AVIF/WebP via `f_auto`), `next/image` for local photos, one priority image per page. Today: first 2 product cards on `/products` are no longer lazy. |
| 9 | Code splitting | Already in place | Login dialog, mobile menu sheet and photo viewer load on demand; FAQ is plain `details`; admin chunks separate. |
| 10 | Reduce JavaScript | Already near the floor | First-load scripts 214 to 229 KB transferred (measured); about 70 KB gzip of that is the React/Next runtime. Unused packages were removed in the earlier audit. An idea (lazy toast) is in section 5. |
| 11 | API optimization | No problem found | `Promise.all` in `listCatalogProducts` (rows, total, availability), `getCatalogOptions`, the product page (product + purchase info), `getProductBySlug` (variants + images). No waterfalls or N+1 in the services read. `/api/products` is unused (section 5). |
| 12 | Loading UI | Already in place, improved today | `loading.tsx`, `CatalogSkeleton`, `ProductSkeleton`, Suspense around streamed parts. Today the flash of skeleton on the busiest links is gone (section 4.1). |
| 13 | Product listing | Already in place | 24 per page with pagination (better for SEO than infinite scroll), cached per filter, lazy images, prefetch. |
| 14 | Product details | Already in place | Each product card prefetches its page (`prefetch`); product pages are prerendered. Measured: Products to a product opens in 8 to 198 ms, no skeleton. |
| 15 | Database / API | Fine at this size | Indexes exist; tables are small. The cost is distance: about 0.3 s per query once connected and 3 to 5 s for a new connection from India (measured in the earlier audit), which only hits uncached requests. See section 5. |
| 16 | Avoid over-caching | OK | Cart, checkout, account and orders are per-user (cookies) and are not in the shared cache. Admin lists are cached but only rendered after `requireAdmin()`. |
| 17 | Measurement | Done | Section 4 and the companion report. |

## 4. What was changed today, and the measurements

### 4.1 Prefetch the busiest links (point 1, 2, 12)

- **Problem:** `/products?...` reads `searchParams`, so by default the click loads the page shell with a skeleton and the products stream in after the click.
- **Change:** `prefetch` on the hero button (`src/components/store/hero.tsx`), the header "Ready to ship" link (`site-header.tsx`) and the three "View all" links of the home rails (`product-rail.tsx`). The listing for that link is a `"use cache"` result (`loadProducts`), so it is ready before the click. Other links keep the default prefetch (shell only) on purpose: every `prefetch` link costs one server request.
- **Measured** (production build, 4 Mbps / 80 ms, mobile or desktop viewport, 3 runs each, fresh browser, 7 s on home before the click):

| Navigation | Before | After |
|---|---|---|
| Mobile: Home to Products (hero button): skeleton shown | **2 of 3** runs | **0 of 3** |
| Mobile: click to first product image | 176 / 179 / 213 ms | 145 / 201 / 125 ms |
| Desktop: Home to "Ready to ship" (header): skeleton shown | **3 of 3** | **0 of 3** |
| Desktop: click to first product image | 131 / 114 / 111 ms | 137 / 201 / 133 ms |
| Extra prefetch traffic on home (after 7 s idle) | mobile 7 requests 10 KB, desktop 11 requests 19 KB | mobile 8 requests 26 KB, desktop 12 requests 42 KB |

  The time to the first image is the same within noise; what changed is that the loading state is gone. Cost: about 16 to 23 KB more prefetch traffic on the home page.

### 4.2 Browser cache for static files (point 7)

- **Change:** `next.config.ts` headers for `/images/:path*` and `/brand-symbol.svg`: `public, max-age=86400, stale-while-revalidate=604800`.
- **Measured:** `Cache-Control` of those files was `public, max-age=0`, now the value above (checked with `curl -I`). A changed photo shows up after a day (or under a new file name).

### 4.3 First product photos are not lazy on `/products` (point 8)

- **Problem:** Lighthouse failed `lcp-lazy-loaded` and `lcp-discovery` on desktop `/products` (the first card photo was `loading="lazy"`, 389 ms between page load and the request).
- **Change:** `ProductCard` and `RugIllustration` take a `priority` flag; `/products` sets it for the first two cards (`product-card.tsx`, `rug-illustration.tsx`, `products/page.tsx`).
- **Measured** (Lighthouse, 5 mobile and 3 desktop runs): `lcp-lazy-loaded` and `lcp-discovery` now **pass** on desktop. Desktop LCP median 1.06 s (before: 1.1 s, one run), score 98/98/97, accessibility 100. Mobile score median 82 (runs 79 to 83) against 79 (runs 66 to 86) earlier today; mobile has large run-to-run noise, so treat this as "not worse", not as a proven gain.

## 5. Not implemented, and why (decisions for you)

1. **TanStack Query: not added.** Its job is to cache data that the browser fetches from an API. This site does not do that: data is read in Server Components and cached on the server, and the browser reuses pages through the Router Cache and prefetch. Adding it would mean adding a library to every page's JavaScript (not measured here), duplicating the cache that Next already has, and creating client API endpoints that do not exist. It would make sense if you later add something fetched on the client again and again (infinite scroll, live admin dashboard polling).
2. **Redis / shared cache: not added.** From the Next docs: the default cache is **in memory per server process, lost on restart, and ephemeral on serverless**; a shared store is for several servers or when the first request after a cold start is too slow. Here: prerendered parts (home, product pages) are built ahead of time; only runtime results (for example a `/products?category=...` listing nobody opened yet) are computed on first request, costing database round trips (0.3 s each, 3 to 5 s on a new connection from India). **If you see that first-visit slowness on the live site**, the options are: (a) move the Neon database or the function region closer to your visitors (no code, a data-move decision); (b) a shared cache handler (`cacheHandlers` / `use cache: remote`) backed by Redis, for example Upstash. (b) adds a paid service, credentials and failure handling, so it should follow a measurement on the live site, which I could not take.
3. **Neon region** (us-east-2): the largest remaining latency for uncached requests; needs your decision.
4. **`/api/products`** (`src/app/api/products/route.ts`) is not used anywhere in the code, is not cached (`connection()`), and anyone can call it to trigger database queries. Recommend removing it; I did not, because you asked not to change API behavior.
5. **Next.js 16.4.3 security advisories** (7, fixed in 16.4.6, several about `"use cache"`): `npm install next@16.4.6`, then build, tests and this report's checks. Not done without your OK.
6. **Lazy-load the toast library (`sonner`, 9.2 KB gzip in every route chunk list):** pages whose components call `toast()` would still load it, so the gain is partial and was not measured. Skipped.
7. **Infinite scroll for products:** not recommended; numbered pages are better for SEO and the listing is already cached per page.
8. **Not measured at all:** INP (needs real users), the live site (CDN, Vercel region, real TTFB), signed-in pages, real phones.

## 6. Limits of these measurements

- Lab only: local production build, simulated network (4 Mbps / 80 ms for the navigation tests, Lighthouse's own mobile throttling for scores), headless Chrome. "Click to content" means the time until the first product image element exists, not a paint timestamp.
- Run-to-run noise is large on this PC (home mobile score ranged 71 to 83 over 6 runs), so only the deterministic checks (skeleton shown or not, Lighthouse audits passing or failing, response headers) are claimed as changes.

## 7. How to check again

```bash
cd C:\dev\GHEF                      # the SSD copy
npm run build && npx next start -p 3200
curl -I http://localhost:3200/images/lifestyle-living-room.jpg      # Cache-Control: ... max-age=86400
npx lighthouse http://localhost:3200/products --preset=desktop --only-categories=performance
# lcp-lazy-loaded and lcp-discovery should pass; open Home, wait 5 s, click "Explore Collection": no skeleton
```

If `next build` or `next dev` stops with the "upgrade recommendation" text, run the same command again (it is the Next.js 16.4.3 advisory notice; upgrading to 16.4.6 removes it).
