# Code Review: Ganga Handmade Export

**Date:** 2026-11-21  |  **Code:** git `8167895` on `anil-person` (nothing uncommitted)  |  **Scope:** all of `src/` (24,319 lines of TypeScript/TSX), config, CI, docs. Every finding below was **checked against the current code in this pass**, with file and line.
Nothing was changed in this review.

## 1. Health

| Check | Result |
|---|---|
| Type check (`tsc --noEmit`) | clean |
| Lint (`eslint`) | clean |
| Tests (`npm test`) | 47 of 47 pass (12 test files) |
| `npm audit --omit=dev` | 0 vulnerabilities |
| Next.js | 16.4.6 (upgraded from 16.4.3 for 7 security advisories) |
| Build (`next build`) | passes; 76 pages generated |
| Admin pages tested signed in | **no** (this review and the earlier audits could not sign in) |

## 2. Architecture map

```text
Browser  ->  Next.js 16 App Router (Turbopack), React 19, Tailwind 4
               Storefront  src/app/(store)   21 files   + src/components/store  66 files
               Admin       src/app/admin     39 files   + src/components/admin  18 files
               UI parts    src/components/ui 14 files (Base UI + Radix, shadcn style)
               API routes  src/app/api  (auth, enquiries, newsletter, razorpay webhook, products)
             Server Actions  src/server/actions  12 files, 54 exported actions
             Services        src/server/services 22 files (catalog, orders, pricing, settings, cart ...)
             Auth            src/server/auth  admin sessions (own), customers (next-auth v5, JWT)
             Data            src/server/db  Drizzle + pg Pool (Neon, us-east-2), schema 463 lines
Caching: Cache Components, 38 "use cache" functions, tags products / storefront / admin
Images: Cloudinary (srcset), hero as static AVIF/WebP in public/images/hero
Payments: Razorpay (order, signature check, webhook). Email: Resend (owner mails + back-in-stock alerts only)
Hosting: Vercel per README; vercel.json pins region iad1
```

Biggest files: `admin/product-form.tsx` 971, `admin/dashboard-client.tsx` 841, `traffic/TrafficClient.tsx` 657, `support/SupportClient.tsx` 588, `admin/coupon-manager.tsx` 586, `actions/admin-products.ts` 509, `admin/admin-nav.tsx` 508, `abandoned/AbandonedClient.tsx` 506, `db/schema.ts` 463.

## 3. What is solid

- **Every server action is guarded.** All 54 exported actions were listed: admin ones call `requireAdmin()` (with a role), customer ones check the session, public ones (login, register, track order, stock alert) are rate limited.
- **Orders are safe against races and double clicks:** one transaction, `FOR UPDATE` row locks on stock and coupon, an idempotency key, prices recomputed on the server (`priceCart`), stock changed in one SQL statement, cancel and failed payment put stock back.
- **Payments:** Razorpay signature check with `timingSafeEqual`, amount and order id checked against the Razorpay API, webhook signature check, `markPaymentPaid` is safe to call twice and notices a payment that arrives after the order was cancelled.
- **Auth basics:** scrypt password hashes with salt, admin session token stored as SHA-256 hash, cookie `httpOnly` + `sameSite=strict` + `secure` in production, 8 h admin session, open-redirect guard (`isSafePath`), JSON-LD escaped (`<` replaced) on product pages.
- **Secrets:** `.env.local` is ignored by git; a secret-pattern scan of the whole push found nothing.
- **Database access:** retry helper, one pool kept across reloads, IPv4 workaround, indexes on the columns queries use.
- **Money rules are in one place** (`pricing.ts`, `priceCart`): the cart page, checkout and order placement all use it, discounts are floored and capped, and a coupon's use limit is **re-checked under a row lock** when the order is placed, so two buyers cannot both use the last use.
- **Access control is complete on the pages too:** all 25 admin pages call `requireAdmin()` with a role (only the login page does not); action roles match the page roles.
- **Database schema and migrations agree** (`drizzle-kit check`: "Everything's fine", 10 migrations); foreign keys use `cascade` or `set null` sensibly.
- **Delivery dates** are computed from the visitor's own clock after load (`useSyncExternalStore`), so there is no server/browser date mismatch.

## 4. Findings (verified)

### High: things that show something that is not true

| # | Where | What | Why it matters | Suggested fix |
|---|---|---|---|---|
| H1 | `src/app/admin/(panel)/razorpay/RazorpayClient.tsx:118-142` | "Verify payment" returns a **hard-coded result for any input**: captured, ₹38,500, UPI, `signatureValid: true`, a made-up buyer | The owner (menu: Razorpay Gateway, owner only) may trust a fake "verified" and ship or refund | Call the real Razorpay payment lookup (`fetchRazorpayPayment` already exists), or remove the page |
| H2 | `src/app/admin/(panel)/email/EmailClient.tsx:90-110` | "Send test email" waits 0.8 s and shows "successfully delivered via Resend API!". **No email is sent** | The owner thinks email works; real mail needs `RESEND_API_KEY`, `NOTIFY_EMAIL`, `EMAIL_FROM` | Call `sendEmail` from a server action and show the real result, or remove the page |
| H3 | `src/components/store/order-actions.tsx:58` | Cancel dialog says "A refund will be initiated if payment was already made". There is **no refund code anywhere** (no Razorpay refund call; `cancelOrderById` only restocks) | A customer who cancels a paid order gets no refund; the order stays `paymentStatus = paid` and still counts in dashboard revenue | Either add a Razorpay refund call and set `paymentStatus = refunded`, or change the wording to "we will contact you about the refund" |

Related: four more admin modules have **no server data at all** (page.tsx loads nothing; all content is built into the client file): Analytics & Traffic (`traffic/TrafficClient.tsx`, uses `Math.random` jitter), Abandoned Carts, Support Desk, Live Visual Preview. They are in the admin menu (`admin-nav.tsx:59-112`). Treat them as demos until wired to real data.

### Medium

| # | Where | What | Suggested fix |
|---|---|---|---|
| M1 | `services/orders.ts` (`markPaymentFailed`, `placeOrder`) | A pending **online-payment order keeps its stock until Razorpay reports `payment.failed` or the payment window is dismissed**. If the customer closes the tab, the stock stays taken for ever (no timeout job; `vercel.json` has no cron) | A cron route that cancels pending online orders older than, say, 30 minutes and restocks |
| M2 | `services/orders.ts` (`restock`, `markPaymentFailed`) | Cancelled or failed orders **do not give back the coupon use** (`coupons.usedCount` is raised at order time) | Decrease `usedCount` when a pending or cancelled order that used a coupon is restocked |
| M3 | `components/admin/dashboard-client.tsx:88-120`, `services/admin.ts:32+` | The **dashboard chart is made up**: the server returns only totals, and the client multiplies them by fixed factor lists (`[0.12, 0.15, 0.18, ...]`). The range buttons do not change the totals | Return real per-day sums from SQL (`date_trunc`), draw those |
| M4 | `actions/admin-modules.ts:190-197`, `auth/admin-session.ts:107-132` (`lookupAdmin`) | **Deactivating a team member does not end their sessions**: `toggleTeamMember` only flips `isActive`; `lookupAdmin` never checks it. Access continues up to 8 hours (plus the 60 s memo) | Delete that person's `admin_sessions` rows on deactivate, or check `isActive` in `lookupAdmin` |
| M5 | `actions/admin-auth.ts:15, 22-23` | Admin login has a **global bucket of 25 failures per 15 minutes** (`admin-login:account`): anyone can lock the real admin out by failing 25 times from a few IPs. The per-IP limit (5) uses the first `x-forwarded-for` value (reliable on Vercel, spoofable on other hosts). Customer login, register and track-order use the same IP key | Key the global limit by the target email instead, or only count failures for known emails |
| M6 | `services/notifications.ts`, no reset code anywhere | **No "forgot password"** and **no customer emails** (no order confirmation, no shipping mail). Email goes only to the owner and for back-in-stock alerts | Resend is already integrated: add order confirmation and a reset-password flow |
| M7 | `actions/admin-products.ts:491, 507` | Creating or deleting a **category does not clear the storefront cache tag `products`**, so the menu and filters show old categories for up to 1 hour | `updateTag("products")` in both actions |
| M8 | `services/cart.ts:113-134`, `(store)/wishlist/page.tsx` | The **wishlist shows draft and archived products** (no status filter); their links lead to a 404 | Filter `products.status = 'active'` |
| M9 | `.github/workflows/ci.yml` | CI runs only for `main`, `master`, `develop` (not for pushes to `anil-person`); **`npm run test` and the migration step are `continue-on-error: true`**, so a failing test does not fail CI | Remove `continue-on-error` for tests; add the working branch or open PRs into `main` |

### Low

| # | Where | What |
|---|---|---|
| L1 | `app/api/products/route.ts` | Not used anywhere, not cached (`connection()`), public: anyone can trigger database queries. Delete it |
| L2 | `components/admin/order-filters.tsx:34, 110-135` | The date buttons (24 hrs ... 365 days, Custom) only change local state; they are never sent to `listOrders(search, status)`. The orders list also has no pagination (limit 100) |
| L3 | `actions/admin-products.ts` | Dead actions `addProductImage`, `setPrimaryImage`, `removeProductImage` (no callers); two delete actions (`deleteProduct` in the form, `removeProduct` in the list) |
| L4 | `actions/admin-products.ts:196-225`, `:480-493` | `saveProduct` accepts any image `publicId` (`addProductImage` checks it is in the store's folder, `saveProduct` does not). `createCategory` has no schema or length limit |
| L5 | `actions/admin-modules.ts:151` | `moderateReview(id, status)` trusts the TypeScript type; no runtime check of `status` |
| L6 | `(store)/account/page.tsx:21` | Signed-out visitors are redirected to `/`, while the other account pages show the login box |
| L7 | `docs/AUDIT.md` | Dated 2026-11-01 and out of date (it says checkout, payments, reviews, wishlist are missing) |
| L8 | `next.config.ts` | The CSP only has `frame-ancestors` and `base-uri` (no `script-src`). Fine as a start; a real CSP needs nonces for the inline JSON-LD and styles |
| L9 | `auth/customer.ts` session callback | Every `auth()` call does a database query to check the user still exists (a round trip of about 0.3 s from India on every account page and action) |
| L10 | whole project | Tests cover helpers (pricing, offers, order rules, stock merge, safe path...) but **not the money paths** (`placeOrder`, `cancelOrderById`, `markPaymentPaid`, the webhook) |
| L12 | `(panel)/orders/[id]/page.tsx:113`, `actions/admin-orders.ts:27-52` | A **staff** member (the lowest role) can set an order's **payment status to any value**, including "paid" for an online order that Razorpay never captured, or "refunded" (which only changes a label; no refund is made). It is written to the audit log. Consider limiting payment status to the admin role |
| L13 | `actions/cart.ts` (`applyCoupon`) | No rate limit on coupon codes, so a logged-in user can try many codes (login is required, so the risk is small) |
| L14 | `services/admin.ts` (`listOrders`, `listCustomers`, `listPayments`, `listReturns`: `limit(100)`; audit log 200) | The admin lists show only the newest 100 rows with no "next page"; older orders and customers can only be found by search |
| L15 | `actions/cart.ts` (`addToWishlist`) | Accepts any product id, including drafts, which is how drafts get into wishlists (see M8) |
| L16 | `components/admin/banner-manager.tsx` (`handleCreate`), `category-manager.tsx` (`handleCreate`) vs `actions/admin-modules.ts` (`createBanner`), `actions/admin-products.ts` (`createCategory`) | **False success messages.** The actions return nothing when the input is rejected (for example a banner link that is not a site path such as `https://...`, an empty category slug) or when the category already exists (`onConflictDoNothing`). The screen still shows "Banner published!" / "Category created successfully!". Return an error string like `createCoupon` and `createTeamMember` do |
| L11 | styles | The earlier `STYLE_AUDIT.md` still applies (hard-coded colours, mixed heading fonts, storefront using admin-style pop-ups). Group A is done, B and C wait for your approval |

## 5. Suggested order of work

1. **Stop the fake results (H1, H2, H3, plus the 4 demo modules):** remove or wire them. Cheapest and removes the biggest risk of wrong decisions.
2. **Money safety:** M1 (stock held by abandoned online payments) and M2 (coupon uses), then a refund flow or honest wording (H3).
3. **Access control:** M4 (end sessions of deactivated staff) and M5 (lockout rule).
4. **Customer experience:** M6 (order emails, forgot password), M8 (wishlist), M7 (category cache).
5. **Safety net:** M9 (CI that fails on failing tests), L10 (tests for order and payment paths), then L1 to L6 clean-ups.

## 6. What was read, and how closely

| Area | Depth |
|---|---|
| `src/server/**` (all actions, auth, db, services: orders, pricing, coupons, cart, settings, notifications, razorpay), `app/api/**` | read in full |
| Admin pages (all 25: guards, data loading) and the order, return, payment, review, category and team flows | read in full |
| Storefront: checkout client flow, cart controls, filter form, reviews, delivery timeline, hero, header, product and products pages, account and wishlist pages, about, contact, our-store, policies | read in full |
| `src/lib/**` | read in full (small files) |
| Admin client components (`product-form`, `coupon-manager`, `banner-manager`, `admin-nav`, `dashboard-client`) | read for logic and data sources; layout and styling not reviewed line by line |
| The 6 demo modules (traffic, abandoned, razorpay, email, preview, support) | checked where their data comes from and what their buttons do |
| `src/components/ui/**` (shadcn-style parts) | skimmed |
| Whole `src/` | pattern checks: every `target="_blank"` link has `rel="noopener noreferrer"`; `dangerouslySetInnerHTML` only for JSON-LD (escaped where it carries database text); browser storage only for UI preferences and one pending-action note; only 4 `NEXT_PUBLIC_` variables (site URL, app URL, Cloudinary cloud name, Razorpay key id), none secret |

## 7. Limits of this review

- Read-only review of code plus checks run on this PC; the live site, the Vercel settings, and the real database contents were not inspected.
- Admin pages were not exercised signed in. Findings about admin screens come from reading the code.
- Components under `src/components/store` and `src/components/ui` were reviewed at skim level for logic (forms, cart, checkout client flow read in full); their visual style is covered by `STYLE_AUDIT.md`.
