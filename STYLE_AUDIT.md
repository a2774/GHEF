# Style audit: Ganga Handmade Export

Audit date: 2026-11-13. **Step 1 only: no code was changed.** The only files added are this report and the screenshots in `docs/style-audit/screenshots/`.
Stack checked: Next.js 16 (App Router), React 19, Tailwind 4, shadcn-style components (Base UI + Radix), next/font, Cloudinary.

## 0. How this was measured, and what could not be checked

- **No live URL was given** (the prompt still had `[https://yourwebsite.com]`), so everything ran on a **local production build** (`next build` + `next start`, port 3200).
- **Static scan**: a script read all 227 source files (23,848 lines) and counted colours, arbitrary values, tokens, fonts, spacing, radius, shadows, buttons, inputs, icons and states. Counts are by regular expression, so a count can be off by a few; the file and line numbers are exact.
- **Browser scan**: headless Chrome opened 17 pages at 360, 390, 768, 1024, 1280 and 1536 px (the five main pages) or 390 and 1280 px (the rest). For each page it measured headings, body text, spacing, contrast, tap targets, small text, images, button and input looks, focus rings, and horizontal overflow. It took **40 screenshots** (`docs/style-audit/screenshots/`, names like `home-390.jpg`, `products-1280.jpg`).
- **Contrast**: computed from real colours on the page, text by text. **Text on top of a photo cannot be measured** by any automatic tool (the tool only sees the colour behind the photo). Those items are listed separately as "needs a human look".
- **Not checked**, and why:
  - **Admin pages (except the login page)**: they need a signed-in session, which a fresh headless browser does not have. I only did the static scan of their code (it is complete) and I did not sign in.
  - **/account, signed-in cart, checkout and wishlist**: need a customer login. Signed out, `/account` sends the visitor to the home page (so `account-*.jpg` is really the home page) and cart, checkout and wishlist show a "Log in" box.
  - **Hover and loading states**: counted in code only; hover cannot be shown in a still screenshot.
  - **Full-page screenshots of long pages show some photos as empty boxes** because those photos load when scrolled into view. That is a screenshot limit, not a site bug.

---

## 1. Summary

**Overall consistency score: 6 / 10** (storefront 6.5, admin 7, the shared UI library between them 5).

The storefront has a clear warm look (cream, brown, pill buttons, serif accents) and the pages are well built: no page scrolls sideways at any of the six widths, every image has alt text, no heading skips a level, and spacing inside each page is tidy. The weak spot is that the look is **held together by hard-coded values instead of the design tokens**, and **three different "mini styles" live side by side**.

### Top 5 problems in simple words

1. **The tokens are not really used.** The storefront defines a warm palette (`--foreground #2b2622`, `--muted-foreground #6c6257`, ...), but the code uses 55 other hard-coded colours 176 times, mostly neutral greys like `#111`, `#555`, `#333`, `#666` (40 + 15 + 8 + 5 uses). They are in 10 near-duplicate groups. So text is sometimes warm brown, sometimes plain grey, on the same page.
2. **Dark mode is half-built and dead.** `.dark` has 29 tokens and the code has 21 `dark:` classes, but nothing ever switches dark mode on. When I forced it on as a test, headings and product names became invisible (115 contrast failures on home, 70 on products). Either finish it or remove it.
3. **The product page, the "Our store" page and the rest of the site look like three different shops.** Product page: black `#111` uppercase buttons with 6 px corners and 3 px option boxes, Poppins font. Rest of the site: dark-brown pill buttons, Bricolage font. Our store: its own Poppins copy, 9.6 px corner button, light-weight text, its own greys.
4. **The shared pop-ups, menus and toasts are in the admin's blue-grey style, but the storefront uses some of them.** The "Cancel order" and "Delete address" confirmation boxes (storefront) use `alert-dialog.tsx`, written in the admin's `slate` colours, while the login box uses the cream storefront style. Toasts, dropdowns, selects and tooltips are all admin style too.
5. **Small things hurt phones.** 19 footer links are 36 px high on every page; size, colour and quantity buttons on the product page are 36 to 46 px; filter tick boxes are 20 px; labels are 9.6 to 11.2 px on room cards and the product page; the brand name in the header is cut to "Ganga Handm..." at 360 and 390 px. One real contrast failure: the grey `#8a7f74` on "Our store" (3.7 to 3.9:1, needs 4.5:1).

---

## 2. Design token inventory

Where tokens live: `src/app/globals.css` (`@theme inline` lines 20 to 69, `:root` lines 71 to 105, `.dark` lines 107 to 139, base layer 141 to 161), `src/app/layout.tsx` (fonts), `src/lib/fonts/*.ts` (fonts).
"Uses" counts Tailwind utilities such as `bg-muted`, `text-muted-foreground`, plus `var(--token)`.

### Colour tokens (light mode)

| Token | Value | Uses | Status |
|---|---|---|---|
| `--background` | `#fbf8f2` | 7 (+ page body) | OK |
| `--foreground` | `#2b2622` | 14 | OK |
| `--card` | `#ffffff` | 16 | OK |
| `--card-foreground` | `#2b2622` | 0 | **Unused, duplicate of `--foreground`** |
| `--popover` | `#fbf8f2` | 2 | **Duplicate of `--background`** |
| `--popover-foreground` | `#2b2622` | 2 | Duplicate of `--foreground` |
| `--primary` | `#2b2622` | 17 | **Duplicate of `--foreground`** |
| `--primary-foreground` | `#fbf8f2` | 23 | **Duplicate of `--background`** |
| `--secondary` | `#efe7da` | 6 | **Duplicate of `--muted`** |
| `--secondary-foreground` | `#2b2622` | 3 | Duplicate of `--foreground` |
| `--muted` | `#efe7da` | 87 | OK |
| `--muted-foreground` | `#6c6257` | 65 | OK |
| `--accent` | `#c9b596` | 1 | Almost unused |
| `--accent-foreground` | `#2b2622` | 0 | **Unused** |
| `--destructive` | `oklch(0.577 0.245 27.325)` | 40 | OK |
| `--border` | `#ddd1bf` | 26 (+ default for every element) | OK |
| `--input` | `#ddd1bf` | 12 | **Duplicate of `--border`** |
| `--ring` | `#8d7c63` | 13 | OK |
| `--ink` | `#1f1c19` | 8 | OK |
| `--chart-1` to `--chart-5` | grey `oklch(...)` | 0 each | **Unused** (5 tokens, and they are neutral grey, not warm) |
| `--sidebar`, `-foreground`, `-primary`, `-primary-foreground`, `-accent`, `-accent-foreground`, `-border`, `-ring` | grey `oklch(...)` | 0 each | **Unused** (8 tokens) |

### Dark mode, radius, type tokens

| Token | Value | Uses | Status |
|---|---|---|---|
| `.dark { ... }` block | 29 tokens | never switched on | **Dead** (`next-themes` is not installed; no code adds the `dark` class). 21 `dark:` classes exist, all in `src/components/ui/*` |
| `--radius` | `0.75rem` | base of `--radius-sm` to `--radius-4xl` | OK |
| `--radius-sm/md/lg/xl/2xl/3xl/4xl` | 0.6x to 2.6x of radius | see section 4.7 | OK, but bypassed by `rounded-[6px]`, `[3px]`, `[4px]` |
| `--text-display` | `clamp(3rem, 7.6vw, 6rem)` | 3 | OK (home, about, services h1) |
| `--text-title` | `clamp(2.25rem, 4.6vw, 3.75rem)` | 17 | OK |
| `--font-sans` | `"Rupee Fallback", Inter` | body | OK |
| `--font-heading` | `"Rupee Fallback", Bricolage Grotesque` | h1 to h3 | OK |
| `--font-mono` | Geist Mono | 108 uses in admin, 1 in the store | OK |
| `--font-logo` | Playfair Display | 2 (footer seal, delivery timeline) | OK, rarely used |
| `--font-oswald`, `--font-cormorant`, `--font-poppins` | | see section 4.1 | OK |
| `.liquid-glass` | `rgb(31 28 25 / 0.62)` + blur | header, gallery arrows, buttons on photos | OK |
| Shadows | none defined as tokens | | Missing: shadows are written by hand (section 4.7) |

### Fonts: loaded vs used

| Family | Loaded as | Where used | Status |
|---|---|---|---|
| Inter | variable 100 to 900 (root layout) | body text everywhere | OK |
| Bricolage Grotesque | variable 200 to 800 (root layout) | `h1`, `h2`, `h3` by default | OK |
| Playfair Display | 400 to 900 (root layout, not preloaded) | footer seal, delivery timeline label | Used in 2 places only |
| Geist Mono | 100 to 900 (root layout, not preloaded) | admin (108 uses) | Storefront: 1 use |
| Oswald | 500, 600, 700 (`lib/fonts/oswald.ts`) | `SectionHeading` (home headings) | The code only uses `font-semibold` (600) with Oswald: **500 and 700 look unused** |
| Cormorant Garamond | 500, 600, 700 (`lib/fonts/cormorant.ts`) | maker section, collection card names | OK |
| Poppins | 300 to 800, **two copies**: `lib/fonts/poppins.ts` and its own copy in `app/(store)/our-store/page.tsx:14` | products, product page, our-store | **Declared twice**; 300 is used (our-store, product discount), 800 is used (room cards, product tabs) |

So the storefront has **6 font families** (Inter, Bricolage, Oswald, Cormorant, Poppins, Playfair) for a 17-page site.

---

## 3. Hard-coded values

### 3.1 Colours that bypass the tokens (storefront and shared UI)

176 uses of 55 distinct hex values. Top offenders with the token they should use (nearest by colour distance; "distance" 0 means identical, under 30 means almost the same):

| File:line (first uses) | Value | Uses | Should use |
|---|---|---|---|
| `app/(store)/products/page.tsx:80, 93, 193` | `#111` | 40 | `text-ink` (`#1f1c19`, distance 20) or `text-foreground` |
| `app/(store)/products/page.tsx:205`, `products/[slug]/page.tsx:121, 159` | `#555` | 15 | `text-muted-foreground` (`#6c6257`, distance 26) |
| `app/(store)/our-store/page.tsx:100, 102, 113` | `#1f1c19` | 9 | `text-ink` (identical) |
| `app/(store)/products/page.tsx:91, 196`, `components/store/price-range.tsx:63` | `#333` | 8 | `text-foreground` (distance 23) |
| `components/store/product-experience.tsx:211, 216, 239` | `#ddd` | 7 | `border-border` (`#ddd1bf`, distance 21) |
| `app/(store)/our-store/page.tsx:103, 127, 147` | `#5c544c` | 6 | `text-muted-foreground` (distance 24) |
| `components/store/delivery-timeline.tsx:47, 51, 62` | `#7a1f2b` | 6 | a new "brand wine" token (no match); also `#6b1a1a` x2 in `available-offers.tsx:72, 98` |
| `app/(store)/our-store/page.tsx:99, 130, 169` | `#f3ede3` | 5 | `bg-muted` (distance 12) |
| `app/(store)/products/page.tsx:96, 203`, `product-card.tsx:91` | `#666` | 5 | `text-muted-foreground` (distance 17) |
| `components/store/available-offers.tsx:54, 85` | `#2b2622` | 5 | `text-foreground` (identical) |
| `components/store/trust-badges.tsx:17-19` | `#3a3633` | 4 | `text-foreground` (distance 28) |
| `components/store/founder-story.tsx:65, 75` | `#c9a96a` | 2 | `--accent` (`#c9b596`) or a new "gold" token |
| `components/store/product-card.tsx:88`, `product-experience.tsx:177` | `#cc0c39` | 2 | `text-destructive` or a new "sale price" token |
| `components/store/product-card.tsx:45` | `#f5a623` | 2 | a new "star" token |
| `components/store/product-experience.tsx:211, 239` | `#f5f5f5` | 2 | `bg-muted` or `bg-background` |
| `app/(store)/our-store/page.tsx:194, 207, 117` | `#8a7f74`, `#6b625a` | 2 + 1 | `text-muted-foreground`. **`#8a7f74` also fails contrast** (see 4.2) |
| `components/ui/button.tsx:20, 22`, `badge.tsx:20, 22`, `select.tsx:19` | `#bef264`, `#a3e635`, `#0b0f19`, `#1a233a` | 4+2+2+2 | the admin lime and navy: they should be tokens (`--brand`, `--brand-dark`), not hex inside shared components |

**Near-duplicate colour groups** in the storefront (RGB distance 28 or less, should each be one colour):

| Group | Uses |
|---|---|
| `#111111`, `#1f1c19`, `#090807`, `#0b0f19`, `#1f1a17`, `#0f1111`, `#0b132b` (seven "almost black") | 40 + 9 + 2 + 2 + 1 + 1 + 1 |
| `#555555`, `#5c544c`, `#4a4a4a`, `#6b625a`, `#4a4541` (five mid greys/browns) | 15 + 6 + 3 + 1 + 1 |
| `#333333`, `#2b2622`, `#3a3633` | 8 + 5 + 4 |
| `#dddddd`, `#f3ede3`, `#d9d9d9`, `#ece6dc`, `#e3ddd2`, `#ece4d4`, `#e0e0e0` (light lines and fills) | 7 + 5 + 3 + 1 + 1 + 1 + 1 |
| `#666666`, `#7a7064`, `#6f6666` | 5 + 1 + 1 |
| `#faf7f2`, `#f5f5f5`, `#eeeeee`, `#fffaf0`, `#fef9ec` (near-white fills) | 2 + 2 + 2 + 1 + 1 |
| `#7a1f2b`, `#6b1a1a` (wine reds) | 6 + 2 |
| `#8a7f74`, `#8a7a5c`; `#c9a96a`, `#b8a06a` | 2 + 1; 2 + 1 |
| `#f0e2b6`, `#ecd9a4`, `#f6e3a1` (pale golds) | 1 + 1 + 1 |

### 3.2 Hard-coded colours in the admin

`#bef264` (lime) **122 times in admin files** (top: `product-form.tsx` 21, `admin-nav.tsx` 12, `coupon-manager.tsx` 10), `#0b132b` 22, `#0b0f19` 17, `#a3e635` 16, `#1a233a` 5. Two navy blues (`#0B132B` and `#0B0F19`, tooltip and sidebar use the first, buttons the second). The shared `Button` already has a `brand` variant (`#bef264`) and a `brandDark` variant, **but admin code never uses them**: it writes the hex again by hand (`admin/login-form.tsx` has 7 hard-coded colours, `admin/product-form.tsx` 27).
Admin also uses Tailwind's palette: `slate` 1,146 times (`slate-200` 166, `slate-500` 165, `slate-950` 158, `slate-400` 147), `emerald` 152, `amber` 67, `rose` 62, `blue` 39, `violet` 21, `pink` 18. The storefront uses **none** of these palettes, so storefront and admin share no colour.

### 3.3 Arbitrary sizes (not on the Tailwind scale)

352 arbitrary colour values, 268 arbitrary size values, 100 other. Files with the most: `product-experience.tsx` 55, `admin/product-form.tsx` 43, `our-store/page.tsx` 32, `admin/dashboard-client.tsx` 30, `admin/admin-nav.tsx` 29, `product-tabs.tsx` 25, `ui/button.tsx` 25, `ui/sonner.tsx` 25.

| Value | Uses | Where | Should be |
|---|---|---|---|
| `text-[11px]` | 78 (all admin) | `admin/product-form.tsx:90, 737`, others | `text-xs` (12 px) or one `text-2xs` token |
| `text-[10px]` | 62 (all admin) | admin tables and badges | same |
| `text-[0.95rem]` | 15 | product page, product tabs/FAQ | `text-base` (16 px) |
| `text-[1.05rem]` | 6 | our-store | `text-base` or `text-lg` |
| `text-[0.7rem]`, `[0.8rem]`, `[0.65rem]`, `[0.6rem]`, `[0.55rem]` | 4, 4, 2, 1, 1 | `shop-by-room.tsx:87`, `delivery-timeline.tsx:63, 76` | one "label" size, at least 12 px |
| `text-[1.6rem]`, `[1.65rem]`, `[1.7rem]`, `[1.75rem]`, `[2rem]` | 1, 1, 2, 1, 2 | `product-experience.tsx`, `product-faq.tsx:80`, `founder-story.tsx` | the `text-2xl` / `text-3xl` scale |
| `rounded-[6px]` | 6 | `product-experience.tsx:250, 276, 290, 312, 324` | `rounded-md` (the token) |
| `rounded-[3px]` | 3 | `product-experience.tsx:211, 239` (size and colour boxes) | `rounded-sm` |
| `rounded-[4px]` | 2 | store badges | `rounded-sm` |
| `size-[18px]` | 7 (admin) | admin icons | `size-4` or `size-5` |
| `tracking-[0.2em]`, `[0.18em]`, `[0.14em]`, `[0.12em]`, `[0.1em]`, `[0.08em]` | 4, 1, 3, 2, 2, 1 | uppercase labels | one or two tracking values (`tracking-widest`) |
| `max-w-[1000px]`, `max-w-[800px]` | 1, 1 | `our-store/page.tsx:137`, `product-tabs.tsx` | `max-w-4xl` / `max-w-5xl` |
| `min-h-[70vh]` | 2 | `not-found.tsx`, `error.tsx` | OK (one-off page height) |

---

## 4. Issues found

### 4.1 Typography

Headings per page, measured in the browser (desktop 1280 px / phone 390 px):

| Page | h1 (size, weight, font) | h2 | h3 |
|---|---|---|---|
| Home | 96 / 48 px, 600, Bricolage, tracking -3.4 px | **Oswald 36 px uppercase 600**, spaced | room cards **26 px 800 uppercase**; product names 16 px 500; **maker name 60 px (Cormorant 500)** |
| About | 96 / 48, 600, Bricolage | **59 px 600** ("Made slowly") | 30 px 600 |
| Services (custom, bulk) | 96 / 48, 600, Bricolage | 24 px 600 **and** 59 px 600 on the same page | none |
| Cart, Checkout, Wishlist, Contact, Track | **59 / 36**, 600, Bricolage | (cart: 24 px) | none |
| Policies | 59 / 36, 600, Bricolage | 24 px 600 | none |
| Products | **48 / 36, 500, Poppins**, colour `#111` | 16 px 500 (card names are h2 here) | none |
| Product page | **30 / 25.6, 600, Poppins** | **12 px uppercase** ("Available offers"), **10.4 px uppercase** ("Estimated delivery timeline"), 36 px Oswald ("People also bought"), **28 px 500 grey** ("FAQs") | 20 px 600 |
| Our store | **60 / 36, 500, Poppins**, centred | 36 px 500 | 20 / 18 px 500 |
| Admin login | 24 px **700** | none | none |

(The browser reports the first family name in the font list, which is "Rupee Fallback" for most headings; the real font is the second in the list: Bricolage by default, Poppins where `poppinsClass` or the our-store copy is used.)

Problems:

- **4 heading fonts** (Bricolage, Poppins, Oswald, Cormorant) and **5 different h1 sizes** (96, 59, 60, 48, 30 px) across the storefront. Home, about and services use the "display" size; cart and policy pages use the "title" size; products, product and our-store each use their own.
- **h2 style is not stable**: 59 px (`text-title`) is used as a section h2 on about and services, while the same pages use 24 px h2 elsewhere. `text-title` is 17 uses, `text-display` 3.
- **A non-heading styled as a heading, and a heading styled as a label.** Maker name is an `h3` at 60 px (bigger than any h2): `founder-story.tsx`. "Available offers" and "Estimated delivery timeline" are `h2` at 10 to 12 px (`available-offers.tsx:70`, `delivery-timeline.tsx:49`): semantic headings with a label look.
- **No heading skips a level** on any audited page (checked at 1280 px, header and footer excluded). The earlier Lighthouse note about card names under the products `h1` was fixed (cards are `h2` there).
- **Body text has 5 sizes**: 18 px (body default `text-lg`, `globals.css:146`), 16 px (cards, forms), 15.2 px (`text-[0.95rem]`, product page), 16.8 px (our-store, weight 300), 14 px. Line heights 28, 29.25, 24.7, 27.3 px. Only `leading-relaxed` (31) and a few `leading-tight/snug` are used, no scale.
- **Weights**: store `semibold` 78, `medium` 45, `light` 8 (all in our-store and one product discount), `extrabold` 2; admin `bold` 201 and `semibold` 162. Admin and store do not share a heading weight.
- **Letter spacing**: `tracking-tight` 91 and `tracking-wide` 89, plus six hand-written values (0.08em to 0.2em) on uppercase labels.

### 4.2 Colours and contrast

- **Real failure**: `app/(store)/our-store/page.tsx:194` and `:207`, grey `#8a7f74` text. On `#faf7f2`: **3.66:1** (four "01 to 04" step numbers), on white: **3.91:1** ("The carpet city of India"). Needs 4.5:1. Fix: use `text-muted-foreground` (`#6c6257`, about 5.4:1).
- **Needs a human look (text on photos)**: white text over photos with a dark gradient: room cards (`shop-by-room.tsx:80-90`: name 26 px, "Carpets" **10.4 px**, "View all" **11.2 px**), collection card names, the maker caption. The tool measured 1.2:1 because it saw the cream box behind the photo, which is wrong. The large names are probably fine; the **10.4 px and 11.2 px labels over photos** are the risky ones.
- **Contrast on all other audited pages: 0 failures** (products, product, cart, checkout, wishlist, about, contact, track, policies, services, admin login), after the earlier fixes. 215 to 219 text items checked on home.
- **Header**: white brand text on the glass pill. On light pages (cart, products) the pill is grey (`rgb(31 28 25 / 0.62)` over cream) and the text now passes (about 4.6:1) but the pill looks muddy compared with the dark hero (`cart-390.jpg`).
- **Dark mode**: see the top-5 list. With `.dark` forced on: home **115 failures of 219**, products **70 of 106**. `dark-products-1280.jpg` shows the page title "All products" and every product name almost invisible, because `#111`, `#666`, `#cc0c39` stay dark on a near-black page. The product illustrations also sit in dark boxes. In the admin, the 1,146 `slate` classes have no dark versions either (but the admin is never in dark mode).

### 4.3 Spacing and layout

Page container (measured, 1280 px wide):

| Pages | `main` | Top padding | Bottom | Side gutters |
|---|---|---|---|---|
| Products, Cart, Checkout, Wishlist, Contact, Track | `max-w-7xl` | **160 px** (`pt-40`) | 80 px | 32 px (16 on phone, 24 on tablet) |
| Policies | 768 px wide, `max-w-3xl` | 160 px | 80 px | **24 px** (16 on phone) |
| About, Services | sections | **176 px** (`pt-44`) | **96 px** | 32 px |
| Our store | sections | 160 px, then **112 px** blocks (`py-28`) | | 32 px, plus `max-w-[1000px]`, `max-w-4xl` |
| Product page | no `main` padding | breadcrumb `pt-32` (**128 px**) | | 32 px |
| Home | sections | **64 px** between sections (`sectionTop`) | | 32 px, maker section `max-w-6xl` (1152) |

- **Two spacing systems.** The home page uses the tight `section-spacing.ts` values (40 / 64 px). Inner pages use loose ones: `py-20` (80 px) 12 times, `lg:py-28` (112) 6, `lg:py-32` (128) 5, `py-16` 2. The first-screen gap under the fixed header is 128, 160 or 176 px depending on the page.
- **Side gutters are consistent** (`px-4 sm:px-6 lg:px-8`, used 70 / 52 / 49 times) except the policy pages (24 px on desktop) and a few `px-5`, `px-8`.
- **Gaps**: `gap-4` 21, `gap-3` 20, `gap-2` 19, `gap-8` 15, `gap-10` 8, plus `lg:gap-6/12/16/20`, `gap-1.5`, `gap-0.5` and others. Card grids: product cards use `gap-x-4 gap-y-10`, room cards `gap-1.5`, collection cards `gap-1.5`, category rails `gap-4`, our-store crafts `gap-4 lg:gap-6`. No single "card gap".
- `max-w-7xl` is the standard container (47 uses); `max-w-md` 10, `max-w-2xl` 6 are text widths (fine).

### 4.4 Components

**Buttons** (rendered, 1280 px, store pages):

| Look | Height / corners / colours | Where |
|---|---|---|
| Dark-brown pill, large | 56 px, full round, `#2b2622` / cream | "Send enquiry", "Shop the collection", "Ask for a custom carpet" |
| Dark-brown pill, medium | 48 px, `#2b2622` | "Log in" (cart, checkout, wishlist) |
| Dark-brown pill, small | 44 px, `#2b2622` | "Custom size or design" |
| Cream pill | 48 px, cream with dark text | "Join" (footer newsletter, on every page) |
| Outline pill | 44 px, transparent, brown border | "Bulk or export" and similar (11 uses) |
| Glass pill on photo | 56 px, `.liquid-glass` | "Explore Collection", hero |
| **Product page buttons** | 48 px, **6 px corners**, `#111` fill, **uppercase** 14 px / 12.8 px | "Add to cart", "Buy now" (`product-experience.tsx:290, 312`) |
| **Option boxes** | 36 px, **3 px corners**, `#ddd` border | size and colour (`product-experience.tsx:211, 239`) |
| **Our-store button** | 48 px, **9.6 px corners**, `#1f1c19`, uppercase | `our-store/page.tsx` |
| Admin lime pill | h-9, full round, `#bef264` | admin everywhere |

- **Defaults are never used in the store**: the shared `Button` default is `h-8 text-sm rounded-lg`, but all 29 store uses override it (`h-12`, `h-14`, `h-11`, `rounded-full`, `text-base`, `w-full`). So the real "store button" lives in 29 class strings, not in the component.
- **Unused `Button` variants**: `secondary`, `link`, `brand`, `brandDark`; unused sizes: `lg`, `pill`, `icon`, `icon-xs`, `icon-lg`. **Used**: store `default` 13, `outline` 11, `ghost` 3, `destructive` 2; admin `default` 22, `outline` 10, `destructive` 4, `ghost` 3.
- **Raw `<button>`** (not the component): store 28 (2 with a background), admin 51 (14 with a background).
- **Disabled and loading states**: `disabled:` is defined in the shared `Button`; loading text ("Placing your order...", "Signing in...") is written by hand per form, with no shared spinner (admin uses `Loader2` in some places).

**Inputs, selects, checkboxes**:

| Look | Where |
|---|---|
| 48 px, `rounded-2xl` (21.6 px), white, `#ddd1bf` border | enquiry form, track form (`fieldClass`) |
| 48 px, `rounded-xl` (16.8 px) | login dialog, profile form |
| 44 px, `rounded-xl`, white | products page selects (`products/page.tsx:33`) |
| 48 px, `rounded-xl`, slate border `#e2e8f0` | admin login |
| 36 px, slate | admin forms (`h-9`, `text-xs`) |

- **12 separate `fieldClass` / `inputClass` constants** repeat the field style instead of the shared `Input`: store `enquiry-form.tsx:12`, `login-dialog.tsx:16`, `profile-form.tsx:9`, `track-order-form.tsx:20`, `products/page.tsx:33`; admin `product-form.tsx:53/55`, `coupon-form.tsx:10/12`, `login-form.tsx:8`, `team-form.tsx:18`, `banner-manager.tsx:25`, `settings/page.tsx:12`, `orders/[id]/page.tsx:15`.
- Corner radius for a form field is `rounded-xl` in some places and `rounded-2xl` in others (enquiry and track vs login and profile).
- **Error text**: storefront consistent (`text-base text-destructive`, `role="alert"`, 15 places). Admin consistent in its own way (rose box in forms, `text-xs`). Not shared.
- **Checkboxes**: `size-5 accent-[#111]` (`products/page.tsx:93`), 20 px (below the 44 px tap size); admin uses native boxes.

**Product cards, rails, badges, price, ratings**:
- Card image box `aspect-[3/4]`, name 16 px 500, price `Rs. 6,999.00` (`formatPriceTag`, red `#cc0c39` when discounted), discount badge, stars `#f5a623`. Same everywhere it appears (home rails, products, wishlist). Good.
- **Price format is not the same everywhere**: cards print `Rs. 6,999.00`; the product page, cart, offers and the admin print `₹4,999` (`formatPaise`). Two formats for the same price.
- The **skeleton does not match the card** in the rails: `product-rail.tsx:17` draws `aspect-[4/5]` rounded boxes, but the card is `aspect-[3/4]` with square corners. `collection.tsx:16` has the same `4/5` + rounded mismatch.

**Header, navigation, footer**:
- Same header and footer on every page, and the same mobile menu (`mobile-menu-390.jpg`). Good.
- **Brand name is cut** at 360 and 390 px: "Ganga Handm..." (`site-header.tsx:69`, `truncate`), visible in `cart-390.jpg`.
- Footer: 19 links of **36 px** height (`site-footer.tsx:82`, `py-1.5`).

**Dialogs, toasts, dropdowns, tooltips (two UI libraries)**:

| Component | Library | Look | Used in |
|---|---|---|---|
| `dialog.tsx` (login) | Base UI | cream `bg-popover`, `rounded-xl` base, overridden to `rounded-3xl`, ring, no shadow | storefront login |
| `alert-dialog.tsx` (confirm) | Base UI | **white, `rounded-2xl`, `shadow-2xl`, slate text** (`:47`) | admin **and storefront** (`order-actions.tsx:55`, `delete-address-button.tsx:16`) |
| `sheet.tsx` | Base UI | popover tokens | storefront mobile menu |
| `dropdown-menu.tsx` | Radix | white, `rounded-xl`, `shadow-xl`, slate (`:20`) | admin |
| `select.tsx` | Radix | slate with **lime focus ring `#bef264`** (`:19`) | admin team form |
| `tooltip.tsx` | Radix | navy `#0B132B`, `rounded-xl` (`:20`) | admin sidebar |
| `sonner.tsx` toasts | Sonner | white, `rounded-2xl`, `shadow-xl`, slate (`:17`) | **both** (root layout) |

So the storefront mixes cream cards (login, empty states) with admin-style white pop-ups (confirm boxes, toasts). `rounded-xl`, `rounded-2xl` and `rounded-3xl` are all used for pop-ups.

**Icons**: one set, `lucide-react` (92 distinct icons), plus 5 inline SVG files (brand seal, density icon, founder-story squiggle, Instagram icon in `TrafficClient.tsx`, dashboard chart). **Stroke widths are mixed**: `1.5` (13 uses, store header and menu), `1.75` (3), `2` default, `2.5`, `3`, `5`. Sizes: `size-4` 84, `size-3.5` 73, `size-5` 33, `size-3` 31, then 8, 11, 6, 1.5, 2.5, 4.5 ... The thin 1.5 stroke is only in the storefront header; everywhere else the default 2.

**Border radius and shadow, all values** (counts):
- Storefront: `rounded-full` 63, `rounded-3xl` 41, `rounded` (4 px) 20, `rounded-2xl` 18, `rounded-xl` 10, `rounded-md` 6, `rounded-[6px]` 6, `rounded-lg` 4, `rounded-[3px]` 3, `rounded-[4px]` 2.
- Admin: `rounded-full` 137, `rounded-xl` 91, `rounded-2xl` 51, `rounded-lg` 44, `rounded` 31, `rounded-md` 15.
- Shadows: admin `shadow-2xs` 104 and `shadow-xs` 43 (soft), plus `sm` 9, `2xl` 3; the storefront has almost none (one custom `shadow-[0_1px_8px...]` in the certificates strip, one `2xl`); shared UI uses `xl` / `2xl` (dialogs, toasts). The lime button has its own `shadow-[0_10px_24px_-10px_rgba(101,163,13,0.8)]` in `login-form.tsx`.

### 4.5 Images

- Card images: `3:4` on home, products and wishlist, `3:4` room and collection cards. Gallery main photo `4:3`, thumbnails `4:5` (rendered 0.8). Cart and admin list: small squares. So **the same product is 3:4 in the grid, 4:3 in the gallery and 4:5 in the thumbnails**. Crops are done with `object-cover` so nothing is stretched.
- **Alt text**: 0 images missing `alt` on all 17 pages. Decorative images use `alt=""` (room cards, after the recent fix).
- **Blurry**: 1 image on our-store is shown larger than its file; nothing else.
- Illustration placeholders (products without photos) are `0.71` ratio (the drawing is 600x840) inside the `3:4` box: they look fine but are slightly narrower than photos.

### 4.6 Responsive (360, 390, 768, 1024, 1280, 1536 px)

- **Horizontal scroll: none** on any audited page at any width.
- **Overlap or cut-off**: only the header brand name (above). No overlapping text found by measurement; screenshots checked for home, products, cart, login dialog and mobile menu.
- **Tap targets under 44 px** (block-level elements, inline text links excluded), phone 390:
  - **Every page**: 19 footer links, 163x36 px.
  - Home: phone number button on the maker photo, 196x40.
  - Products: 37 of 63 small. Filter checkboxes 20x20, filter `summary` rows 358x28 (8), price-slider inputs 358x32, "Filters" 358x28.
  - Product page: size/colour boxes 60 to 92 x 36 (`h-9`), quantity buttons **40x46**.
  - Admin login: show-password button 36x36, "Back to the store" link 135x20.
- **Text under 12 px (phone)**: home 16 items (room cards "Carpets" 10.4 px x8, "View all" 11.2 px x8), product page 5 (9.6 px delivery step labels x3, 10.4 px "Estimated delivery timeline", 11.2 px), admin login 11 px. In admin code `text-[10px]` x62 and `text-[11px]` x78 (not measurable without a session).

### 4.7 States and interaction

- Counts: `hover:` 264, `focus-visible:` 38, `focus:` 82 (admin inputs use plain `focus:`), `disabled:` 30, `active:` 11, `aria-invalid:` 13 (shadcn parts only).
- **Keyboard focus**, measured by tabbing 28 times on each page: every focused element showed a ring or outline except two on `/products`: the **price slider handles** (`price-range.tsx`, the real inputs are `pointer-events-none` overlays) and the **"Sort by" select** (`products/page.tsx:290`, `focus:outline-none`).
- 20 files use `outline-none` without any `focus-visible:` style in the same file (list in section 8). Most are shadcn parts that add a ring somewhere else; the two above are real gaps.
- **Loading skeletons**: home rails (`aspect-[4/5]`, see above), products (now matches, CLS 0), product page (`product-skeleton.tsx`, matches `4/3` and `4/5`), cart and wishlist (`h-64` grey block), checkout and account (`h-80` grey block). Lighthouse shows CLS 0 to 0.003 on all audited pages, so nothing visibly jumps; the cart/checkout/wishlist/account blocks are only a rough placeholder.
- **Empty states**: storefront all the same (`rounded-3xl bg-muted p-10 text-center`, 6 places). Admin all the same (`py-8 text-center text-xs text-slate-500`, 11 places). Consistent inside each.

### 4.8 Store vs admin

Different on purpose, and each is consistent inside itself:

| | Storefront | Admin |
|---|---|---|
| Palette | cream, brown tokens, plus neutral hard-coded greys | slate + lime `#bef264` + navy `#0B132B` |
| Corners | pill buttons, `rounded-3xl` cards | `rounded-xl` fields, `rounded-full` buttons, `rounded-2xl` cards |
| Text size | 16 to 18 px | 12 px (`text-xs` 379 uses) with 10 to 11 px labels |
| Heading font | Bricolage, Poppins, Oswald, Cormorant | Bricolage bold (700) |

**Drift in shared components**: `Button` and `Input` defaults fit neither (h-8, 14 px), both sides override them; `alert-dialog`, `dropdown-menu`, `select`, `tooltip` and toasts are written for the admin and leak into the storefront (confirm boxes, toasts); the `brand` variants are admin colours inside a shared file.

---

## 5. Issue table

| # | Area | Problem | Page / file:line | Impact | Effort | Suggested fix | Needs my approval? |
|---|---|---|---|---|---|---|---|
| 1 | Tokens | 55 hard-coded storefront colours (176 uses), 10 near-duplicate groups (7 "almost blacks", 5 greys) | `products/page.tsx`, `product-experience.tsx` (34), `our-store/page.tsx` (23), `available-offers.tsx` (15), `product-tabs.tsx` (14) | **High** | Medium | Map each group to one token (`ink`, `foreground`, `muted-foreground`, `border`, `muted`); add tokens for wine, gold, star, sale price | **Yes**: greys become slightly warmer |
| 2 | Tokens | Duplicate tokens: `primary` = `foreground`, `primary-foreground` = `background`, `secondary` = `muted`, `input` = `border`, `popover` = `background`, 3 more foregrounds equal | `globals.css:71-105` | Low | Easy | Keep one token per value (or alias with `var()`), document it | No |
| 3 | Tokens | 13 unused tokens (`chart-1..5`, 8 `sidebar-*`) and dead `.dark` block (29 tokens) | `globals.css:91-95, 97-104, 107-139` | Low | Easy | Delete if dark mode is not planned | No |
| 4 | Dark mode | `.dark` never applied; forced on: 115 / 70 contrast failures, invisible headings | whole site; `dark-home-1280.jpg`, `dark-products-1280.jpg` | Medium | Hard (to finish) or Easy (to remove) | Remove the dead dark tokens and the 21 `dark:` classes, **or** finish it by moving all hard-coded colours to tokens first (issue 1) | **Yes** (decision) |
| 5 | Colour | Real contrast failure: `#8a7f74` text, 3.66 to 3.91:1 | `our-store/page.tsx:194, 207` | **High** | Easy | `text-muted-foreground` | Yes (colour gets darker) |
| 6 | Colour | Small white labels over photos can't be verified, 10.4 and 11.2 px | `shop-by-room.tsx:87-90`, collection cards | Medium | Easy | Check by eye; raise to 12 px and strengthen the bottom gradient | Yes |
| 7 | Typography | 6 font families, 4 of them for headings; 5 different h1 sizes | home, about, products, product, our-store | **High** | Medium | Pick one heading font for the inner pages and one size per level; keep Oswald and Cormorant only on the home page | **Yes** |
| 8 | Typography | Poppins declared twice (`lib/fonts/poppins.ts` and `our-store/page.tsx:14`) | `our-store/page.tsx:14` | Low | Easy | Import the shared one | No |
| 9 | Typography | Unused weights: Oswald 500 and 700 | `lib/fonts/oswald.ts` | Low | Easy | Load 600 only (check first) | No |
| 10 | Typography | Body text in 5 sizes and 4 line heights (18 / 16 / 15.2 / 16.8 / 14 px) | product page, our-store, cards | Medium | Medium | One body size (16 or 18) and one small size | Yes |
| 11 | Typography | `h3` maker name at 60 px; `h2` labels at 10 to 12 px | `founder-story.tsx`, `available-offers.tsx:70`, `delivery-timeline.tsx:49` | Low | Easy | Make the level match the look (use `p` or `div` for labels, `h2` for the maker name) | No (same look) |
| 12 | Typography | 140 admin labels at `text-[10px]` / `[11px]`, 7 storefront labels at 9.6 to 11.2 px | `admin/product-form.tsx:90, 737`, `shop-by-room.tsx:87`, `delivery-timeline.tsx:63, 76` | Medium | Easy | Smallest size 12 px | Yes (text gets bigger) |
| 13 | Spacing | Two spacing systems (home 40/64 px; inner pages 80/112/128 px); top gap 128, 160 or 176 px | `section-spacing.ts`, `about`, `services`, `our-store`, `products/[slug]` | Medium | Medium | One top-of-page padding and one section padding scale | **Yes** |
| 14 | Spacing | Policy pages use 24 px gutters and 768 px width, the rest 32 px | `policies/[slug]/page.tsx` | Low | Easy | Fine as a reading width; align gutter to 32 px | No |
| 15 | Buttons | Product page and our-store buttons differ from the rest (6 px / 9.6 px corners, `#111`, uppercase, boxes 3 px) | `product-experience.tsx:211, 239, 250-324`, `our-store/page.tsx` | **High** | Medium | Use the shared pill `Button` (or one second variant), and move the colours to tokens | **Yes** |
| 16 | Buttons | Shared `Button` default is never used in the store (29 overrides); `secondary`, `link`, `brand`, `brandDark` and 5 sizes unused; admin re-writes `#bef264` 122 times | `ui/button.tsx`, `admin/*` | Medium | Medium | Put the store pill into the component (sizes `md/lg`), use `variant="brand"` in admin | Yes (store defaults change) |
| 17 | Inputs | 12 local `fieldClass`/`inputClass` constants; `rounded-xl` vs `rounded-2xl` fields | listed in 4.4 | Medium | Medium | One `Input` look per side, remove the constants | Yes (corners change) |
| 18 | Pop-ups | Admin-style confirm box, toast, dropdown, select and tooltip used on the storefront; login dialog is cream | `alert-dialog.tsx:47`, `sonner.tsx:17`, `order-actions.tsx:55`, `delete-address-button.tsx:16` | **High** | Medium | Give `alert-dialog` and `sonner` storefront tokens (store uses a cream variant) or a `tone` prop | **Yes** |
| 19 | Pop-ups | Pop-ups use three radii (`xl`, `2xl`, `3xl`) | `dialog.tsx`, `alert-dialog.tsx`, login dialog | Low | Easy | One pop-up radius | Yes |
| 20 | Price | `Rs. 6,999.00` on cards, `₹4,999` on product page, cart and admin | `lib/format.ts` (`formatPriceTag` vs `formatPaise`) | Medium | Easy | One price format | **Yes** |
| 21 | Skeleton | Rail skeletons `aspect-[4/5]` rounded, cards are `3/4` square | `product-rail.tsx:17`, `collection.tsx:16` | Low | Easy | `aspect-[3/4]`, no rounding | No |
| 22 | Header | Brand name cut to "Ganga Handm..." at 360 and 390 px; header pill is grey on light pages | `site-header.tsx:69`, `cart-390.jpg` | Medium | Easy | Shorter name or smaller text on phones; darker pill on light pages | Yes |
| 23 | Tap size | 19 footer links 36 px; product size/colour boxes 36 px, quantity 40x46; filter boxes 20 px; admin show-password 36 px | `site-footer.tsx:82`, `product-experience.tsx:211, 239, 250`, `products/page.tsx:93`, `admin/login-form.tsx` | **High** (phones) | Easy | Add vertical padding (`py-3`) or `min-h-11`; negative margin keeps the look | No (looks the same if padding is hidden) |
| 24 | Focus | No focus ring on the price slider handles and the Sort select | `price-range.tsx`, `products/page.tsx:290` | Medium | Easy | Add `focus-visible:ring` styles | No |
| 25 | Focus | 20 files with `outline-none` and no `focus-visible` in the file | section 8 | Low | Easy | Review the 5 non-shadcn ones | No |
| 26 | Icons | Stroke width 1.5 only in the header; default 2 elsewhere; 5 inline SVGs | `site-header`, `account-button.tsx`, `mobile-menu.tsx` | Low | Easy | One stroke width | Yes |
| 27 | Radius | `rounded` (4 px) 20 times plus `[3px]`, `[4px]`, `[6px]`; `rounded-3xl` 41 vs `rounded-2xl` 18 for the same kind of card | storefront | Low | Medium | Use the radius tokens only | Yes |
| 28 | Shadow | No shadow tokens; storefront has almost none, admin uses `2xs`/`xs` 147 times, pop-ups `xl` / `2xl` | `ui/*`, `admin/*` | Low | Easy | Define 3 shadow tokens | No |
| 29 | Images | Same product at 3:4, 4:3 and 4:5 in grid, gallery and thumbnails | cards, gallery | Low | Hard | Leave (the gallery is deliberately wider); document it | No |
| 30 | Store vs admin | Shared `Button`, `Input`, `Badge` hold admin colours (lime/navy hex) | `ui/button.tsx:20-22`, `badge.tsx:20-22`, `select.tsx:19` | Medium | Medium | Add `--brand` / `--brand-dark` tokens | No |

---

## 6. Per-page consistency matrix

OK = follows the shared style. **Problem** = differs from the rest. "n/a" = could not be checked (needs login).

| Page | Heading style | Buttons | Spacing | Colours | Responsive |
|---|---|---|---|---|---|
| Home | OK (display h1, Oswald section headings by design); maker name `h3` at 60 px **problem** | OK | OK (home system) | **Problem**: labels over photos unverified | Brand name cut; 19 footer links 36 px |
| /products | **Problem**: Poppins 48 px weight 500 | OK | OK | Hard-coded `#111`, `#555` | 37 small targets (filters) |
| Product (photos) | **Problem**: Poppins 30 px; labels as h2 | **Problem**: 6 px black uppercase | **Problem**: 128 px top | Hard-coded `#111`, `#ddd` (34) | Option boxes 36 px, small text 9.6 px |
| Product (no photos) | same as above | same | same | same | same |
| /cart | OK (title) | OK | OK | OK | OK |
| /checkout | OK | OK | OK | OK | OK |
| /account | n/a (redirects to home when signed out) | n/a | n/a | n/a | n/a |
| /wishlist | OK | OK | OK | OK | OK |
| /about | OK (display h1; h2 at 59 px) | OK | **Problem**: 176 / 96 px | OK | OK |
| /contact | OK | OK | OK | OK | OK |
| /our-store | **Problem**: own Poppins, weight 500/300 | **Problem**: 9.6 px corners | **Problem**: 160 / 112 px, `max-w-[1000px]` | **Problem**: `#8a7f74` fails contrast; 23 hard-coded | OK |
| /track | OK | OK | OK | OK | OK |
| /policies/* | OK | OK | 24 px gutters (small difference) | OK | OK |
| /services/* | OK; h2 at 24 and 59 px on one page | OK | 176 / 96 px | OK | OK |
| Login dialog | OK (cream) | OK | OK | OK | OK |
| Mobile menu | OK | OK | OK | OK | OK |
| Admin login | OK within admin (24 px 700) | Lime pill (admin style) | OK | slate + lime | show-password 36 px |
| Other admin pages | n/a (needs login; code scan only) | n/a | n/a | slate/lime, 1,146 slate classes | n/a |

---

## 7. What is already good

- **No horizontal scroll at 360 to 1536 px** on any audited page, and no cut-off buttons except the header brand name.
- **Alt text on every image** (0 missing on 17 pages); decorative images are empty on purpose.
- **Heading order is clean** on every audited page; one `h1` per page.
- **Contrast is clean** on 10 of the 11 audited storefront pages (only our-store fails); text sizes of 16 px and over for body and forms.
- **Consistent page chrome**: same header, footer, mobile menu and side gutters (`px-4 sm:px-6 lg:px-8`, 32 px at desktop) on all store pages; `max-w-7xl` container on 47 places.
- **Empty and error states are uniform** inside each side (storefront 6 + 15, admin 11).
- **Card look is the same** on home, products and wishlist (3:4 image, name, price, stars, badge).
- **One icon library** (lucide); one font stack for body.
- **Keyboard focus works** on 16 of 17 pages (only the price slider and the Sort select have no ring).
- **Layout stability**: Lighthouse CLS is 0 to 0.003 on all audited pages.
- **Store and admin are each self-consistent** (storefront cream/brown, admin slate/lime) and the split is deliberate.

---

## 8. Priority plan

**Group A: quick wins (easy, no visible design change unless marked)**
1. Issue 5: our-store grey to `text-muted-foreground` (**approval**: colour darker).
2. Issue 23: tap sizes with hidden padding (footer links, option boxes, checkboxes, show-password).
3. Issue 24: focus rings on the price slider and the Sort select.
4. Issue 21: skeleton `aspect-[3/4]` for rails and collections.
5. Issues 2, 3, 8, 9: delete unused and duplicate tokens, the duplicate Poppins copy, unused font weights.
6. Issue 11: heading levels that do not match the look.
7. Issue 14: policy gutters (optional).

**Group B: medium (visible change, ask first)**
8. Issue 1: replace the 55 hard-coded colours with tokens (greys get warmer).
9. Issue 12 and 6: smallest text 12 px.
10. Issue 20: one price format.
11. Issues 22 and 26: header brand name on phones, one icon stroke.
12. Issues 17 and 19: one field look and one pop-up radius.
13. Issue 28: three shadow tokens.

**Group C: bigger changes (ask first)**
14. Issue 7: one heading font and one size per level.
15. Issues 15 and 16: product page and our-store buttons onto the shared `Button` (this changes the product page look).
16. Issue 18 and 30: storefront variants of the confirm box, toast and other shared parts; brand colour tokens.
17. Issue 13: one spacing scale for the inner pages.
18. Issue 4: finish or remove dark mode.
19. Issue 10 and 27: body text scale and radius scale.

---

## 9. Before / after checklist

Tick after the fixes. Same method each time: `next build`, `next start`, then the browser scan and the static scan.

- [ ] Hard-coded hex colours in the storefront: 176 uses / 55 values → under 20 uses, only brand colours that have a token
- [ ] Near-duplicate colour groups: 10 → 0
- [ ] Duplicate tokens: 7 → 0; unused tokens: 13 + dead dark block → 0 (or dark mode finished and tested)
- [ ] Forced-dark contrast failures: 115 (home) and 70 (products) → 0, or `.dark` removed
- [ ] Contrast failures on audited pages: 5 on our-store → 0
- [ ] Text-over-photo labels checked by eye and at least 12 px
- [ ] Heading fonts: 4 → 1 or 2 (documented); h1 sizes: 5 → 2
- [ ] Body text sizes: 5 → 2
- [ ] Smallest text: 9.6 px (store), 10 px (admin) → 12 px
- [ ] Button looks in the store: 7 → 2 or 3; product page buttons use the shared component
- [ ] `fieldClass`/`inputClass` constants: 12 → 0
- [ ] Storefront pop-ups, toasts: all in storefront tokens
- [ ] One price format on every page
- [ ] Tap targets under 44 px: 19 footer links + product page boxes + filter boxes → 0
- [ ] Focus ring on price slider and Sort select
- [ ] Top-of-page spacing: 3 values (128 / 160 / 176) → 1
- [ ] Brand name not cut at 360 and 390 px
- [ ] Skeleton shapes match the real cards (rails, collections)
- [ ] No horizontal scroll at 360, 390, 768, 1024, 1280, 1536 (keep at 0)
- [ ] Images without alt: 0 (keep); Lighthouse CLS under 0.1 on all pages (keep)
- [ ] `npm run build`, `npm run lint`, `npm test` pass after each group

---

## 10. Appendix

### A. Files with `outline-none` and no `focus-visible:` in the same file (20)
`app/(store)/products/page.tsx`, `app/admin/(panel)/enquiries/page.tsx`, `orders/[id]/page.tsx`, `preview/PreviewClient.tsx`, `settings/limited-textarea.tsx`, `settings/page.tsx`, `support/SupportClient.tsx`, `components/admin/category-manager.tsx`, `coupon-form.tsx`, `dashboard-client.tsx`, `inventory-client.tsx`, `order-filters.tsx`, `product-form.tsx`, `team-form.tsx`, `components/store/price-range.tsx`, `product-viewer.tsx`, `components/ui/alert-dialog.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `select.tsx`.

### B. Most-used colours (hex, storefront + admin)
`#bef264` 126 (admin lime), `#111111` 40, `#0b132b` 23, `#0b0f19` 19, `#a3e635` 18, `#555555` 15, `#1f1c19` 9, `#333333` 8, `#1a233a` 7, `#dddddd` 7, `#5c544c` 6, `#7a1f2b` 6, `#f3ede3` 5, `#666666` 5, `#2b2622` 5. 61 distinct values, 365 uses, 74 of them in admin files only.

### C. Per-page numbers (390 px phone)

| Page | Small tap targets | Text under 12 px | Contrast failures | Overflow |
|---|---|---|---|---|
| Home | 20 / 78 | 16 | 31 (all text over photos, unverified) | 0 |
| Products | 37 / 63 | 0 | 0 | 0 |
| Product (photos) | 30 / 64 | 5 | 0 | 0 |
| Cart / Checkout / Wishlist | 19 / 27 | 0 | 0 | 0 |
| About / Contact / Track | 19 / 28 to 34 | 0 | 0 | 0 |
| Our store | 19 / 31 | 0 | **5** (`#8a7f74`) | 0 |
| Policies / Services | 19 / 26 to 34 | 0 | 0 | 0 |
| Admin login | 2 / 5 | 1 | 0 | 0 |

### D. Screenshots
`docs/style-audit/screenshots/`: `home-390 / 768 / 1280`, `products-390 / 1280`, `product-photos-390 / 1280`, `product-seed-390 / 1280`, `cart`, `checkout`, `wishlist`, `account` (shows the home page, signed out), `about`, `contact`, `our-store`, `track`, `policy-privacy`, `policy-shipping`, `service-custom`, `service-bulk`, `admin-login` (each at 390 and 1280), `login-dialog-390 / 1280`, `mobile-menu-390`, `dark-home-1280`, `dark-products-1280`. Full-page captures; photos below the first screen may appear as empty boxes.

---

## 11. Step 3 progress: Group A done (2026-11-16)

Measured on a local production build (`next build` + `next start`, port 3200, phone width 390 px). `tsc`, `eslint`, the 47 tests and `next build` pass.

| Issue | Status | What was done |
|---|---|---|
| 5 | **Done** | The grey `#8a7f74` on `/our-store` (step numbers, "The carpet city of India") is now `text-muted-foreground`; the text is now `#6c6257`, about 5.6:1 on cream and 6:1 on white (computed; the colour was read back from the page for the step numbers). |
| 23 | **Done** | Footer links 36 px → **44 px** (the list moved up 4 px so the first line stays in place; the footer is about 8 px taller per link). Size and colour boxes on the product page keep their 36 px look but the tap area is **46 px** (a hidden extension). Quantity buttons 40 → **44 px** wide. Filter tick boxes keep their look; the whole row now reacts from 10 px above and below. Admin show-password button 36 → 44 px. |
| 24 | **Done** | Keyboard focus on the price slider thumb (halo) and on the Sort select (2 px outline), checked in headless Chrome. |
| 21 | **Done** | Skeletons in `product-rail.tsx` and `collection.tsx` are `3/4` with square corners, like the cards. |
| 3 | **Partly** | The 13 unused `chart-*` and `sidebar-*` tokens are removed. The dead `.dark` block was **left in** because it belongs to the dark-mode decision (issue 4). |
| 9 | **Done** | Oswald loads weight 600 only (the only weight used). |
| 11 | **Done** | Maker name is an `h2` (same look, Cormorant). "Available offers" and "Estimated delivery timeline" are `p` with the heading font kept (same look, still labelling their `section`). |
| 8 | **Not done on purpose** | Sharing one Poppins file would make `/our-store` preload Poppins 700 and 800 as well (2 more font files). The two copies use the same CSS variable and never load on the same page, so there is no conflict. |
| 2 | **Not done** | Duplicate tokens are harmless; aliasing them with `var()` gives no visible gain. |
| 14 | **Not done** | Optional (policy gutters). |

Overflow at 390 px is still 0 on home, products, product and our-store. Groups B and C still need your approval.
