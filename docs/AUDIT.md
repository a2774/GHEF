# Audit aur Implementation Plan

Date: 2026-11-01. Isse [PRD.md](PRD.md) aur [ROADMAP.md](ROADMAP.md) ke saath padhein.

## Current status

| Area | Status | Note |
|---|---|---|
| Next.js, Tailwind, shadcn | Done | Next 16 Cache Components on |
| Homepage aur product page | Done | Illustrations aur temporary photos |
| Bag | Partial | Sirf browser mein, price sirf dikhane ke liye |
| Newsletter aur enquiry | Done | Database mein save, email ke liye Resend key chahiye |
| Admin panel | Is phase mein | Login, dashboard, products, categories, orders |
| Cloudinary | Is phase mein | Signed upload, delete, responsive delivery |
| Orders | Partial | Admin side is phase mein; orders banane ke liye checkout chahiye |
| Checkout aur payment | Missing | Razorpay account chahiye |
| Collection listing, search, customer login | Missing | Agla phase |
| Reviews, wishlist, shipping integration | Missing | V2 |

## Security findings

| Finding | Severity | Plan |
|---|---|---|
| Newsletter aur enquiry APIs par rate limit nahi | Medium | Attempt limiter inhi forms par bhi lagana |
| Bag ki price browser se aati hai | Medium | Checkout mein price hamesha server par dobara nikalni hai |
| Privacy page aur cookie banner nahi hai | High for launch | Launch se pehle banana |
| `npm audit`: 25 warnings | Low/Medium | Launch se pehle upgrades review karna |
| Footer links placeholder hain | Low | Pages banne par jodna |

## Admin security design

- Password sirf server par, `ADMIN_EMAIL` aur `ADMIN_PASSWORD` env se
- Random session token; database mein sirf uska SHA-256 hash
- Cookie: httpOnly, sameSite strict, production mein secure, 8 ghante ki expiry
- Logout par session database se delete hota hai
- Login limit: har IP par 15 minute mein 5 koshish, aur poore account par 25
- Har admin page aur server action `requireAdmin` chalata hai

## Implementation order

1. Database: images, orders, sessions, login attempts
2. Admin login aur layout
3. Cloudinary utility aur product images
4. Dashboard, products, categories, orders
5. Storefront par Cloudinary images
6. Agla phase: collection pages, search, checkout, Razorpay, customer login

## Decisions

- Categories hi abhi collections ka kaam karengi; alag collection table zaroorat par banegi.
- Variant ka `size` hi carpet ka dimension hai.
- Refund abhi manual hai: admin gateway par refund karke status update karta hai, jab tak Razorpay nahi judta.
