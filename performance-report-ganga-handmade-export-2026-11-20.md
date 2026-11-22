# Website Performance Report – Ganga Handmade Export

**Date:** 2026-11-20  |  **URL:** Not provided (live site not tested; measured on a local production build, `next build` + `next start`, port 3200)  |  **Tested on:** Mobile + Desktop (Lighthouse 12.8.2, headless Chrome)

Stack: Next.js 16.4.3 (App Router, Turbopack, Cache Components + Partial Prerender), React 19.3, Tailwind 4, Drizzle + Neon Postgres, Cloudinary images, Razorpay. Hosting (README): Vercel, `vercel.json` pins region `iad1`. Website type: ecommerce (handmade carpets).

## 0. Kaise measure kiya (zaroor padhein)

- **Lab data only.** Lighthouse 12.8.2, local production build on this PC. Mobile = Lighthouse mobile preset (simulated slow 4G, 4x CPU slowdown). Desktop = desktop preset.
- **Runs:** mobile = **median of 3 runs** per page (home and `/products`: **6 runs**, because single runs swing a lot: home 71 to 83, products 66 to 86). Desktop = 1 run per page (desktop is steady within 2 to 3 points).
- **Pages (6):** Home `/`, `/products`, Product with real photos (`/products/modern-geometric-3d-cube-area-rug-handcrafted-luxury-carpet`), Product without photos (`/products/varuna`, seed product), `/cart`, `/checkout`. Cart and checkout were tested **signed out** (they show the login box).
- **Bundle sizes:** `next analyze` (built in to Next 16) plus Lighthouse "resource summary" for what is really transferred.
- **Not measured** (needs something I do not have): **INP** (needs real user clicks, Lighthouse lab cannot measure it; TBT is the lab proxy), the **live site** (CDN, brotli, Vercel region, real TTFB with the Neon database), **signed-in pages** (cart with items, checkout, account, all admin pages), real phones, field data (CrUX). TTFB below is from the local server and is **not** what visitors will see.

## 1. Executive Summary

- **Verdict: Desktop = Fast (Lighthouse 96 to 99 on all 6 pages). Mobile = Average (68 to 79 on all 6 pages).** Overall: **Average**.
- **Mobile LCP is 3.9 to 4.6 s** (Google "good" is 2.5 s or less): 4 of 6 pages are above 4.0 s (poor range), the other 2 are at 3.9 s. FCP (1.2 to 1.7 s), CLS (0) and, on desktop, everything else pass.
- **Top 3 problems:** (1) bytes: every page, even the nearly empty cart, downloads **10 to 11 font files (189 to 227 KB)**, which is 40% of the cart page; (2) mobile main-thread work: TBT 311 to 546 ms (good is 200 ms or less), mostly the React/Next runtime plus style and layout; (3) 3 render-blocking CSS files (27 KB) and first-row product images that are lazy-loaded.
- **Not a performance item, but important:** `npm audit` now reports **7 advisories on Next.js 16.4.3** (fixed in 16.4.6). Several are about `"use cache"` and Cache Components, which this project uses. See section 4.9.
- Compared with the previous audit (2026-11-13) there is **no regression**: all differences are inside run-to-run noise. One regression from a recent style change (accessibility 99 on product pages) was found and fixed during this audit (section 4.10).

## 2. Performance Scores

### 2.1 Home page (main page): Mobile vs Desktop

| Metric | Mobile | Desktop | Good Range | Status |
|---|---|---|---|---|
| LCP | 3.9 s (runs 2.4 to 4.4) | 1.0 s | 2.5 s or less | Mobile ⚠️ / Desktop ✅ |
| INP | Not measured | Not measured | 200 ms or less | Not measured |
| CLS | 0.000 | 0.000 | 0.1 or less | ✅ / ✅ |
| FCP | 1.7 s | 0.4 s | 1.8 s or less | ✅ / ✅ |
| TTFB (local server, not live) | 17 ms | 52 ms | 800 ms or less | ✅ / ✅ (not representative) |
| TBT (lab proxy for INP) | 342 ms (runs 297 to 766) | 59 ms | 200 ms or less | Mobile ⚠️ / Desktop ✅ |
| Speed Index | 2.0 s | 1.1 s | 3.4 s or less | ✅ / ✅ |
| Lighthouse Performance | **79** (runs 71 to 83) | **98** | 90 or more | Mobile ⚠️ / Desktop ✅ |
| Accessibility / Best Practices / SEO | 100 / 100 / 100 | 100 / 100 / 100 | 90 or more | ✅ |

### 2.2 All pages

| Page | Score mobile | Score desktop | LCP mobile | LCP desktop | FCP mobile | TBT mobile | TBT desktop | CLS | TTFB (local) | Weight mobile | Requests | DOM elements |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Home | ⚠️ 79 | ✅ 98 | ⚠️ 3.9 s | ✅ 1.0 s | ✅ 1.7 s | ⚠️ 342 ms | ✅ 59 ms | ✅ 0 | 17 ms | 690 KB | 50 | 924 |
| Products | ⚠️ 79 | ✅ 98 | ❌ 4.1 s | ✅ 1.1 s | ✅ 1.2 s | ⚠️ 419 ms | ✅ 43 ms | ✅ 0 | 9 ms | 787 KB | 51 | 559 |
| Product (real photos) | ⚠️ 71 | ✅ 96 | ❌ 4.6 s | ✅ 1.3 s | ✅ 1.6 s | ⚠️ 473 ms | ✅ 86 ms | ✅ 0 | 13 ms | 741 KB | 56 | 659 |
| Product (no photos) | ⚠️ 68 | ✅ 98 | ❌ 4.6 s | ✅ 1.1 s | ✅ 1.2 s | ⚠️ 546 ms | ✅ 18 ms | ✅ 0 to 0.001 | 10 ms | 643 KB | 51 | 622 |
| Cart (signed out) | ⚠️ 79 | ✅ 99 | ❌ 4.1 s | ✅ 0.9 s | ✅ 1.7 s | ⚠️ 338 ms | ✅ 36 ms | ✅ 0 | 8 ms | 475 KB | 41 | 249 |
| Checkout (signed out) | ⚠️ 79 | ✅ 99 | ⚠️ 3.9 s | ✅ 0.9 s | ✅ 1.7 s | ⚠️ 311 ms | ✅ 37 ms | ✅ 0 | 6 ms | 478 KB | 43 | 249 |

Status key: ✅ good, ⚠️ needs improvement, ❌ poor (Google ranges: LCP 2.5 / 4.0 s, TBT 200 / 600 ms, score 90 / 50). Desktop page weight: home 783 KB, products 848 KB, product 891 KB, product (no photos) 655 KB, cart 505 KB, checkout 507 KB.

Accessibility is **100** on all 6 pages, Best Practices **100**, SEO **100** (69 on cart and checkout on purpose: they are `noindex`).

### 2.3 Compared with the previous audit (2026-11-13, same method)

| Page (mobile score) | 11-13 | Today | Page (desktop score) | 11-13 | Today |
|---|---|---|---|---|---|
| Home | 80 | 79 | Home | 99 | 98 |
| Products | 76 | 79 | Products | 95 | 98 |
| Product (photos) | 67 | 71 | Product (photos) | 87 | 96 |
| Product (no photos) | 71 | 68 | Product (no photos) | 98 | 98 |
| Cart | 81 | 79 | Cart | 99 | 99 |
| Checkout | 77 | 79 | Checkout | 99 | 99 |

Home mobile TBT showed 617 ms in the first 3 runs, but the 6-run median is **342 ms** (previous audit: 346 ms), so that was noise. The only larger move is the product page on desktop (87 to 96); the reason was not investigated.

## 3. Problems Found

| # | Problem | Impact | Kahan hai (file / component) | Expected Improvement |
|---|---|---|---|---|
| 1 | **Too many font files on every page**: 10 to 11 files, 189 to 227 KB (cart: 189 KB of 475 KB). Inter 48 KB, Poppins 6 files about 48 KB, Bricolage 41 KB, **Playfair 38 KB (only for the logo text and one label)**, Oswald 13 KB (footer heading), Cormorant 37 KB (home only) | **High** | `src/app/layout.tsx` (Playfair), `src/components/store/brand-logo.tsx:64`, `src/components/store/site-footer.tsx:51` (Oswald via `SectionHeading`), `src/lib/fonts/poppins.ts` | Playfair alone is 38 KB on every page. LCP gain: Not measured (re-test after the fix) |
| 2 | **Mobile LCP 3.9 to 4.6 s** in the lab (bytes and CPU bound). Observed LCP breakdown on home (before throttling): TTFB 39 ms + render delay 494 ms | **High** | whole storefront; fonts + CSS + JS runtime | Depends on problems 1, 3, 4. Not measured |
| 3 | **3 render-blocking CSS files** (22 KB + 2 KB + 2 KB). Lighthouse estimates **750 ms** savings on home mobile | **Medium to High** | `src/app/globals.css` (one 22 KB file), 2 small files | Lighthouse estimate: up to 750 ms (home, mobile). Real gain: Not measured |
| 4 | **Mobile TBT 311 to 546 ms.** Home main thread (4x CPU slowdown): script evaluation 1.57 s, style and layout 1.16 s; 11 long tasks, longest 361 ms. The biggest script (`20box33a0_n53.js`, 230 KB raw, 70 KB gzip, 1.0 s scripting) is the **React + Next runtime**, not app code | **Medium** | framework baseline; `src/components/store/*`, 924 DOM elements on home | Runtime cannot be cut. App-side savings: Not measured |
| 5 | **First-row product images are `loading="lazy"`** on `/products` (desktop LCP element is a lazy Cloudinary image; Lighthouse `lcp-lazy-loaded` fails; 389 ms resource load delay) | **Medium** | `src/components/store/product-card.tsx` (no `priority` prop), `src/components/store/product-photo.tsx` | Removes the 389 ms discovery delay on desktop `/products`. Mobile: Not measured |
| 6 | **Placeholder carpet drawings** (`/rug-art/*.svg`, shown when a product has no photo) are lazy and have no `width`/`height` (Lighthouse `unsized-images`, and `lcp-lazy-loaded` on the no-photo product page: 410 ms load delay) | **Low to Medium** (only products without photos) | `src/components/store/rug-illustration.tsx` | LCP 4.6 s on that page; gain Not measured |
| 7 | **Image bytes:** Lighthouse "image delivery" estimates about **20 to 28 KB** of savings per Cloudinary card image (home: 27.8 KB on the biggest; products: 24, 20, 18 KB) | **Low to Medium** | `src/components/store/product-photo.tsx` (Cloudinary URL options) | Lighthouse estimate only; real gain Not measured |
| 8 | **Toast library on every page:** `sonner` 9.2 KB gz in the root layout, used only after an action | **Low** | `src/app/layout.tsx:58`, `src/components/ui/sonner.tsx` | Up to about 9 KB gz on pages that never call `toast()` (analyzer figure); Not measured |
| 9 | **Back/forward cache blocked** on `/products`, `/cart`, `/checkout` (`Cache-Control: no-store` on the page and on some requests) | **Low** (only for visitors going Back) | server responses of dynamic routes; may differ on Vercel | Not measured on the live site |
| 10 | **Framework code flagged by Lighthouse:** 28 KB unused JS and 13 to 14 KB "legacy JavaScript" are both inside the Next/React runtime chunk | **Low** (not fixable in app code) | `node_modules/next`, `react-dom` | none from app code |
| 11 | **Security (not performance): Next.js 16.4.3 has 7 advisories**, fixed in 16.4.6 | **High (security)** | `package.json` (`"next": "16.4.3"`, pinned) | n/a |
| 12 | Cart and checkout SEO 69 | none | by design (`noindex`) | none |

## 4. Detailed Fixes

### 4.1 Fonts: 10 to 11 files on every page

- **Kya problem hai:** Every storefront page downloads 189 to 227 KB of fonts. On the cart (almost empty page) fonts are 189 KB of the 475 KB total (40%). Measured on cart: Inter 48 KB, Poppins 6 weight files (6 x ~8 KB, preloaded), Bricolage 41 KB, Playfair 38 KB, Oswald 13 KB.
- **Kyun ho rahi hai:**
  - Playfair Display is declared in the root layout for the **logo text** (`brand-logo.tsx:64`, `fontFamily="var(--font-logo)"`) and one small label (`delivery-timeline.tsx:77`). Because the logo is on every page, the 38 KB file loads everywhere.
  - Oswald (13 KB) loads on every page because the **footer** uses `SectionHeading`.
  - Poppins is only used by product cards, product pages, shop-by-room, products and our-store, but its 6 files are also fetched on cart and checkout. **The import path that causes this was not identified in this audit** (no import of `lib/fonts/poppins` was found in the cart, checkout or the shared layout files); check the built cart HTML for `<link rel="preload" as="font">`.
- **Fix:**

```tsx
// 1) Logo text as SVG paths (export the wordmark as outlines), so Playfair is not needed in the layout.
//    src/components/store/brand-logo.tsx
<svg viewBox="0 0 120 32" aria-label="Ganga Handmade Export">
  <path d="…outlined wordmark…" fill="currentColor" />
</svg>
// then remove Playfair_Display from src/app/layout.tsx and give the delivery label
// (delivery-timeline.tsx:77) a font that is already loaded, e.g. className="font-heading".
```

```tsx
// 2) Footer heading without Oswald (src/components/store/site-footer.tsx:51)
<h2 className="mt-6 text-center text-2xl font-semibold tracking-[0.08em] text-white uppercase sm:text-3xl">
  {title}
</h2>
```

```ts
// 3) Fewer Poppins weights, only if the design allows (each weight is a separate ~8 KB file).
//    src/lib/fonts/poppins.ts
weight: ["400", "500", "600"],   // now: 300 to 800 (6 files)
```
  Design check needed first: weight 300 is used on `/our-store`, 800 on the room cards and product tabs.
- **Expected result:** Playfair removal = **-38 KB on every page** (measured file size). Oswald = -13 KB on every page except home. Poppins trim = up to -24 KB (3 files). LCP effect: Not measured.

### 4.2 Render-blocking CSS

- **Kya problem hai:** 3 stylesheets block the first paint (22 KB + 2 KB + 2 KB). Lighthouse's render-blocking insight estimates **750 ms** savings on home mobile (simulated).
- **Kyun ho rahi hai:** Tailwind output is one global CSS file loaded with `<link rel="stylesheet">`.
- **Fix:** Next has an experimental option that puts the CSS in the HTML (documented in `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/inlineCss.md`):

```ts
// next.config.ts
const nextConfig: NextConfig = {
  experimental: {
    staleTimes: { dynamic: 30 },
    inlineCss: true,   // CSS goes into <style> tags in the HTML
  },
  // ...
};
```
- **Trade-off (from the Next docs):** good for new visitors, but the CSS is not cached separately for returning visitors, and the HTML grows (home document today: 31 KB transferred, measured). **Not tested here: measure before and after.**
- **Expected result:** Lighthouse estimate up to 750 ms on home mobile; real gain Not measured.

### 4.3 First-row product images are lazy (`/products`)

- **Kya problem hai:** On desktop `/products` the LCP element is a card image with `loading="lazy"`. Lighthouse reports a 389 ms resource load delay and fails `lcp-lazy-loaded` and `lcp-discovery`.
- **Fix:** let `ProductCard` take a `priority` flag and set it for the first row only:

```tsx
// src/components/store/product-card.tsx
export function ProductCard({ product, headingAs: Heading = "h3", priority = false }:
  { product: ProductCardData; headingAs?: "h2" | "h3"; priority?: boolean }) {
  // ...
  <ProductPhoto /* existing props */ priority={priority} />
}

// src/app/(store)/products/page.tsx (where the cards are mapped)
{products.map((p, index) => (
  <ProductCard key={p.id} product={p} headingAs="h2" priority={index < 4} />
))}
```
  `ProductPhoto` already supports `priority` (used on the product page gallery).
- **Expected result:** removes the 389 ms discovery delay on desktop `/products`. Mobile effect: Not measured.

### 4.4 Placeholder drawings: lazy and unsized

- **Kya problem hai:** `rug-illustration.tsx` renders `<img loading="lazy">` without `width`/`height`. On the no-photo product page this image is the LCP element (4.6 s mobile, 410 ms load delay).
- **Fix:**

```tsx
// src/components/store/rug-illustration.tsx
<img
  src={`/rug-art/${file}`}
  alt="Illustration of a hand-woven carpet"
  width={600} height={840}              // the drawings are 600 x 840
  loading={priority ? "eager" : "lazy"}
  fetchPriority={priority ? "high" : undefined}
  decoding="async"
/>
```
- **Expected result:** removes `unsized-images` and `lcp-lazy-loaded` for products without photos. Gain in seconds: Not measured.

### 4.5 Main thread and TBT (mobile)

- **Kya problem hai:** TBT 311 to 546 ms on mobile. Home main thread under 4x CPU slowdown: script evaluation 1,565 ms, other 1,217 ms, style and layout 1,155 ms, parsing and compiling 334 ms.
- **Kyun ho rahi hai:** the largest script is the React + Next runtime (`20box33a0_n53.js`: 70 KB gzip, 1,037 ms scripting). App code is small (store components 10 to 22 KB gz per route). Style and layout cost comes from 924 DOM elements on the home page.
- **Fix (app side):**
  1. Idea (not tested): mount the `<Toaster />` only on the client after the first paint (`sonner`, 9.2 KB gz in every page's chunks). Caveat: `toast()` comes from the same package, so pages whose components import `toast` still download it; the gain is only on pages that never call `toast()`.

```tsx
// src/components/ui/sonner.tsx: render the Toaster lazily (sketch)
"use client";
import dynamic from "next/dynamic";
export const Toaster = dynamic(() => import("./sonner-impl").then((m) => m.Toaster), { ssr: false });
// move the current Toaster component into sonner-impl.tsx
```
  2. Keep long lower sections under `Deferred` (`content-visibility: auto`), already used on the home page.
  3. About 35 hidden shop-menu links stay in the DOM for SEO; removing them would save about 100 elements but hide the category links from search engines (kept on purpose).
- **Expected result:** sonner = up to about -9 KB gz on some pages (analyzer figure). TBT change: Not measured. The 70 KB React/Next runtime cannot be reduced from app code.

### 4.6 Image bytes (Cloudinary)

- **Kya problem hai:** Lighthouse's image insight estimates 20 to 28 KB savings per card image (for example home card 27.8 KB; products 24, 20, 18 KB).
- **Fix:** try a lower quality mode in the Cloudinary URL and check the look on real photos:

```ts
// src/components/store/product-photo.tsx: Cloudinary transformation string
// now:      c_limit,w_${w},f_auto,q_auto
// try:      c_limit,w_${w},f_auto,q_auto:eco     // smaller files, slightly lower quality
```
- **Expected result:** Lighthouse estimate only; **needs a visual check by you** because it changes photo quality. Real gain: Not measured.

### 4.7 Back/forward cache (bfcache)

- **Kya problem hai:** Lighthouse `bf-cache` fails on `/products`, `/cart`, `/checkout`: "Pages with cache-control: no-store cannot enter back/forward cache".
- **Kyun:** dynamic responses of these routes (and some requests) carry `Cache-Control: no-store` in `next start`. **Behaviour on Vercel was not checked.**
- **Fix:** check the response headers on the live site first (`curl -I https://<site>/products`). If `no-store` is still there, find which `fetch`/route sets it.
- **Expected result:** instant Back navigation; Not measured.

### 4.8 What is already fine (no action)

- **Images:** `next/image` + Cloudinary with `f_auto,q_auto`, AVIF/WebP, `srcset` widths on `ProductPhoto`, first product photo `fetchpriority=high` and preloaded, other slides load later. CLS is 0 on every page.
- **JavaScript:** first-load scripts are 214 to 229 KB transferred (15 to 17 requests); login dialog, mobile menu and the 3D viewer load on demand; FAQ is plain `<details>`.
- **Third-party scripts:** none on first load. Razorpay `checkout.js` is added only when the customer pays (`checkout-form.tsx:41`). No analytics, chat or tag manager exists in the code.
- **Compression:** Lighthouse text-compression audit passes (no uncompressed text files) on `next start`. Live brotli/CDN: Not measured.
- **Caching:** pages use Cache Components (`"use cache"`, 1 h revalidate, 1 day expire); `/rug-art/*.svg` has `Cache-Control: public, max-age=31536000, immutable`; image optimizer cache is 1 day.
- **Database / API:** not part of this lab run (server TTFB 6 to 52 ms is local, with cached pages). Neon is in `us-east-2` and the function region is pinned to `iad1`; real latency from India: Not measured in this audit (the earlier audit measured about 0.3 s per query warm).

### 4.9 Next.js security advisories (not performance, but do not skip)

- **Kya hua:** during this audit `next build` printed "Your version of Next.js is affected by a known security vulnerability" (the first build attempt even stopped with `SecurityFatalError`; the second continued with a warning). `npm audit --omit=dev` (run 2026-11-20; it was clean on 2026-11-16) now lists **7 advisories for `next` 16.0.0 to 16.4.4, severity moderate**:
  - information disclosure across root params when a `"use cache"` function is called through `unstable_cache()`
  - cache leak across root param values in nested `"use cache"` functions
  - cross-user cache disclosure and poisoning in `"use cache"` with binary arguments
  - cache poisoning of shared fallback shells in Cache Components via request-supplied placeholder route params
  - SVG rejection bypass in image optimization
  - HttpOnly cookie exposure through an internal response header on Edge runtime routes
  - cross-client response injection in self-hosted apps that forward fetched responses
- **Why it matters here:** this project uses `cacheComponents: true` and `"use cache"` on many functions (admin and storefront data), so the cache-related ones are relevant. Some items concern self-hosting or the Edge runtime; which ones apply on Vercel was not checked.
- **Fix:** `package.json` pins `"next": "16.4.3"`. `npm view next dist-tags.latest` = **16.4.6** (same minor line). Upgrade, then run `npm run build`, `npm test` and the checklist below:

```bash
npm install next@16.4.6      # also bump eslint-config-next to the matching version if one exists
npm audit --omit=dev         # should be clean
npm run build && npm test
```
  The upgrade was **not** done in this audit. Performance after the upgrade: Not measured.

### 4.10 Heading-order regression found and fixed during this audit

- A recent style change made the labels "Available offers" and "Estimated delivery timeline" `<p>` instead of `<h2>`. That left an `<h3>` ("Care", and policy headings in the product tabs) directly after the page `<h1>`: Lighthouse accessibility dropped from 100 to **99** on the product pages (`heading-order`).
- **Fixed:** those headings in `src/components/store/product-tabs.tsx` are now `<h2>` (same look). Re-measured: heading-order passes, accessibility is 100 on all 6 pages (table in section 2). **This fix is in the working copy and not committed.**

## 5. Bundle Size Analysis

Source: `next analyze` on the production build, compressed (gzip) size, home route `/` (the analyzer also counts lazy chunks such as the login dialog, mobile menu and 3D viewer, so it is higher than what is downloaded at first load: **measured first-load scripts are 214 KB on home, 217 KB on product**).

| Library / File | Size (KB gz) | Zaroori hai? | Alternative |
|---|---|---|---|
| `next` + `react-dom` runtime (framework baseline) | 224.1 | Haan | none |
| `@base-ui/react` (+ `@base-ui/utils` 7.3, `@floating-ui/utils` 4.2) | 25.7 (+11.5) | Haan: login dialog, mobile menu sheet, confirm dialogs. Already loaded on demand | consolidate with Radix (used in admin) only if a rewrite is worth it |
| `app/globals.css` (Tailwind output) | 21.6 | Haan | `inlineCss` (section 4.2) moves it into the HTML |
| store components (`src/components/store`) | 10.4 | Haan | none |
| `sonner` (toasts) | 9.2 | Haan, but only after an action | lazy mount (section 4.5) |
| `tailwind-merge` | 8.2 | Haan (class merging in `cn`) | none without risk |
| `src/components/ui` | 5.8 | Haan | none |
| `lucide-react` | 3.7 | Haan (tree-shaken, only used icons) | none |
| `class-variance-authority` | 0.8 | Haan | none |
| `use-sync-external-store` | 0.8 | Haan | none |

Per route (analyzer total, compressed): `/` 335 KB, `/products` 336 KB, `/products/[slug]` 354 KB, `/cart` 335 KB, `/checkout` 336 KB, `/admin` 310 KB, `/admin/products/[id]` 356 KB. Server-only packages (`drizzle-orm`, `pg`, `next-auth`, `zod`) do not appear in the client bundle. Radix packages (`dropdown-menu`, `select`, `tooltip`) are admin only.

Other transfer numbers (home, mobile, Lighthouse): total 690 KB / 50 requests = fonts 227 KB (11), scripts 214 KB (15), images 179 KB (12), document 31 KB, CSS 27 KB (3).

## 6. Quick Wins (1 ghante mein)

1. Remove Playfair from the layout (logo as SVG paths): **-38 KB on every page** (4.1).
2. Footer heading without Oswald: -13 KB on every page except home (4.1).
3. `priority` on the first row of `/products` cards (4.3).
4. `width`/`height` + eager first image in `rug-illustration.tsx` (4.4).
5. Upgrade Next.js to 16.4.6 and run build + tests (4.9). Security first.
6. Commit the heading-order fix (4.10).

## 7. Bade Fixes (zyada time lagega)

1. Find and remove the reason Poppins (6 files, ~48 KB) is fetched on cart and checkout, and decide on trimming Poppins weights (needs design check).
2. Try `experimental.inlineCss` and measure it on mobile (4.2). Needs before/after runs.
3. Lazy-mount the toast library (4.5).
4. Try `q_auto:eco` for card images and check photo quality by eye (4.6).
5. Check the **live** site: compression, CDN cache headers, Vercel region, bfcache headers, real TTFB with Neon (section 0 and 4.7).
6. Move the Neon database closer to the users, or keep the Vercel region next to it (decision for you; earlier audit: about 0.3 s per query warm from India).
7. Measure **INP** with real data (Vercel Speed Insights or Chrome UX Report) once the site is live.
8. Test signed-in pages (cart with items, checkout, account, admin lists): they were not measured.

## 8. Fix Checklist

- [ ] Upgrade `next` to 16.4.6 (and `eslint-config-next`), `npm audit --omit=dev` clean, `npm run build`, `npm test`
- [ ] Commit the `product-tabs.tsx` heading fix (accessibility 100 on all pages)
- [ ] Logo text as SVG paths, remove Playfair from `app/layout.tsx`, fix `delivery-timeline.tsx:77` font
- [ ] Footer heading without Oswald (`site-footer.tsx:51`)
- [ ] Find why Poppins preloads on cart/checkout; fix it
- [ ] Decide Poppins weights (design check for 300 and 800)
- [ ] `priority` for the first row of product cards on `/products`
- [ ] `width`/`height` and eager first image in `rug-illustration.tsx`
- [ ] Try `inlineCss` and compare mobile LCP and TBT
- [ ] Lazy-mount `sonner`
- [ ] Try `q_auto:eco` for card images (visual check)
- [ ] Check bfcache / `Cache-Control: no-store` on the live site
- [ ] Check live-site compression, CDN headers and Vercel region in the dashboard
- [ ] Decide on Neon region
- [ ] Measure INP and signed-in pages
- [ ] Re-run Lighthouse (section 9) and tick the targets

## 9. Next Steps

**Re-test after the fixes (same method):**

```bash
npm run build && npx next start -p 3200          # production build, not `next dev`
npx lighthouse http://localhost:3200/ --output=json --output-path=home-mobile-1.json --quiet \
  --only-categories=performance,accessibility,best-practices,seo \
  --chrome-flags="--headless=new"                 # mobile (default)
npx lighthouse http://localhost:3200/ --preset=desktop --output=json --output-path=home-desktop-1.json --quiet
npx next analyze -o                               # bundle numbers (built in)
```

Run mobile **at least 3 times per page and take the median** (one run can be 10 points off). Do not run builds or other heavy programs at the same time. Then run PageSpeed Insights on the live URL for field data (CrUX) and INP.

**Targets (Google "good" ranges, plus a realistic goal for the lab):**

| Metric | Today (mobile, home) | Target |
|---|---|---|
| LCP | 3.9 s | 2.5 s or less (first goal: under 3.5 s on every page, product page now 4.6 s) |
| TBT | 342 ms | 200 ms or less |
| CLS | 0 | keep 0.1 or less |
| FCP | 1.7 s | keep 1.8 s or less |
| INP | Not measured | 200 ms or less (field data) |
| Lighthouse Performance, mobile | 68 to 79 | 85 or more (stretch: 90) |
| Lighthouse Performance, desktop | 96 to 99 | keep 90 or more |
| Accessibility / Best Practices / SEO | 100 / 100 / 100 | keep 100 |
| `npm audit --omit=dev` | 1 moderate (next 16.4.3) | 0 |
