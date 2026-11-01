# Ganga Handmade Export: Marketplace Implementation Plan

Date: 2026-11-01. Ye plan Amazon/Flipkart-style master brief ko maujooda project par map karta hai. Status yahan sach ke hisaab se update hoga: koi feature tabhi complete maana jayega jab code aur test dono hon.

## 1. Current architecture

| Layer | Abhi kya hai |
|---|---|
| Framework | Next.js 16.4.3, App Router, Turbopack, Cache Components on |
| Language | TypeScript strict |
| UI | Tailwind 4, shadcn/ui (Base UI), Lucide, Bricolage Grotesque + Inter |
| Database | Neon Postgres, Drizzle ORM, `pg`, 4 migrations |
| Images | Cloudinary signed upload, `next-cloudinary` delivery |
| Email | Resend REST (key baaki) |
| Admin auth | Env login, database sessions, attempt limit |
| Customer auth | Nahi hai |
| Tests | Nahi hain |

```text
src/
  app/(store)/        storefront pages
  app/admin/          admin login aur panel
  app/api/            route handlers
  components/store/   storefront UI
  components/admin/   admin UI
  components/ui/      shadcn components
  server/db/          schema, connection, seed
  server/services/    business logic
  server/actions/     server actions
  server/auth/        session logic
  lib/                shared helpers
docs/  drizzle/  public/images/
```

## 2. Reuse

Storefront sections, product page, Cloudinary utility, admin products/categories/orders, enquiry, newsletter, email helper aur retry logic. Inme se kuch dobara nahi banega.

## 3. Key decisions

| Topic | Decision | Reason |
|---|---|---|
| ORM | Drizzle hi rahega, Prisma nahi | Brief kehta hai maujooda database reuse karo |
| Money | Integer paise | Float nahi, fixed-precision; existing data aur Razorpay dono paise use karte hain |
| Router | App Router | Pehle se yahi hai |
| Customer auth | Auth.js + Drizzle adapter (Phase 4) | Google OAuth aur email/password dono; admin auth alag rehne ke baad merge |
| Admin roles | Users table par `role` (Phase 7) | Env login se owner/admin/staff par migrate |
| Bag | Browser bag hatakar database cart (Phase 5) | Login ke baad persistent aur server-priced |
| Design | Apple-style brand hi, commerce density ke saath | Pehle chuna hua hero aur identity bache; Amazon ka look copy nahi |
| Forms | Zod aur React Hook Form Phase 4 se | Abhi ka manual validation dheere migrate |
| Shipping | Configurable PIN rules, courier API baad mein | Delivery date ka vaada config ke bina nahi |
| Rate limits | Database-backed, `auth_attempts` reuse | Hosting ke baad Upstash par shift ho sakta hai |

## 4. Route structure

| Route | Purpose | Phase |
|---|---|---|
| `/` | Homepage | Done, sections baad mein |
| `/products` | Listing, search, filters, sort | 3 |
| `/products/[slug]` | Product detail | Done, upgrades 3 |
| `/cart` | Cart | 5 |
| `/wishlist` | Wishlist | 5 |
| `/checkout` | Multi-step checkout | 6 |
| `/account/*` | Profile, addresses, orders, reviews, returns | 4, 6 |
| `/orders/[orderNumber]/track` | Tracking | 6 |
| `/policies/*`, `/about`, `/contact` | Static pages | 2 |
| `/admin/*` | Admin modules | 7 |
| `/api/payments/razorpay/*` | Payment orders, webhooks | 6 |
| `/api/auth/*` | Auth.js | 4 |

## 5. Database additions

`users`, `accounts`, `sessions`, `verification_tokens`, `addresses`, `carts`, `cart_items`, `wishlist_items`, `payments`, `coupons`, `reviews`, `shipments`, `return_requests`, `banners`, `notifications`, `audit_logs`, `settings`. `categories.parent_id` Phase 2 mein aaya. Inventory abhi `product_variants.stock` mein rahega; reservation table Phase 6 mein agar zaroorat ho. Migrations additive rahenge, koi reset nahi.

## 6. Phases

| Phase | Scope | Status |
|---|---|---|
| 1 | Inspection aur plan | Done |
| 2 | Header search, nested categories, footer cleanup | Started; banners, carousel, policy pages baaki |
| 3 | Listing, filters, sort, pagination | Listing done; suggestions, zoom, quick view, reviews baaki |
| 4 | Customer auth, Google, login modal, resume action | Email/password, modal, resume, profile aur logout tested; Google code ready par credentials baaki; email verification, password reset aur mobile OTP baaki |
| 5 | Wishlist, database cart, coupons | Done aur tested; shipping aur coupon usage count checkout ke saath Phase 6 mein; guest wishlist/card heart baaki |
| 6 | Addresses, checkout, Razorpay, orders, returns | COD flow, addresses, orders, cancel, returns aur status rules tested; Razorpay code ready par test keys ke bina live test nahi hua; shipping rates, invoice aur courier tracking baaki |
| 7 | Admin roles, customers, coupons, banners, reports, audit | Roles, team, audit, customers, payments, returns, inventory, reviews, banners, settings aur dashboard metrics done; banner images, CSV reports aur per-state shipping baaki |
| 8 | Security, tests, SEO, README, deployment | Rate limits, headers, secrets check, sitemap, robots, metadata, structured data, policy pages aur README done; automated browser tests aur strict CSP baaki |

## 7. Required from owner

Abhi ke liye ye sab dummy/placeholder rahenge, aur project email `gangahandmadeexport@gmail.com` hai (owner decision, 2026-11-01). Placeholder ka matlab: code taiyar, par feature "not configured" dikhayega. Fake payment, email ya OTP success kabhi nahi dikhega. Inme se koi feature asli account jude bina complete nahi maana jayega.

| Item | Needed for | Phase |
|---|---|---|
| `AUTH_SECRET` | Customer login (hum generate kar sakte hain) | 4 |
| Google OAuth Client ID aur Secret | Google Sign-In | 4 |
| `RESEND_API_KEY` aur verified domain | Verification, reset, order emails | 4 |
| SMS/OTP provider | Mobile OTP | 4 |
| Razorpay test key ID, secret, webhook secret | Payments | 6 |
| Shipping rules, PIN list, COD policy | Checkout | 6 |
| GST details aur policies | Invoice aur legal pages | 6 |
| Production domain aur hosting | Deployment | 8 |
