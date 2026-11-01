# Roadmap: Ganga Handmade Export E-commerce Website

Requirements ke liye [PRD.md](PRD.md) dekhein. Samay andaze hain, aur ek developer ke full-time kaam par based hain.

**Status:** ⬜ baaki · 🟨 chal raha hai · ✅ ho gaya

| Phase | Kaam | Andaza | Status |
|---|---|---|---|
| 0 | Foundation | 2-3 din | 🟨 |
| 1 | Backend + admin core | 1-2 hafte | ⬜ |
| 2 | Storefront | 1-2 hafte | ⬜ |
| 3 | Cart, checkout, payment | 1 hafta | ⬜ |
| 4 | Order management + accounts | 1 hafta | ⬜ |
| 5 | Launch prep | 3-5 din | ⬜ |
| 6 | V2 features | Launch ke baad | ⬜ |

**MVP ka kul andaza:** 5-7 hafte

## Phase 0: Foundation

- [x] Next.js, TypeScript, Tailwind
- [x] shadcn/ui
- [x] Neon Postgres connect
- [x] Brand logo, colors aur fonts
- [x] Frontend aur backend folder structure
- [x] Hero section final: Cinematic + liquid glass floating pill
- [x] Homepage, product page, bag aur newsletter ka pehla version
- [ ] Database connection ka end-to-end test

**Done jab:** `npm run build` pass ho aur app database se data padh sake.

## Phase 1: Backend + admin core

- [ ] Poora database schema aur migrations
- [ ] Sample data (seed)
- [ ] Admin login aur role check
- [ ] Admin layout aur dashboard
- [ ] Product CRUD, size-wise variants ke saath
- [ ] Image upload
- [ ] Categories aur collections

**Done jab:** owner bina code ke product daal sake aur wo database mein save ho.

## Phase 2: Storefront

- [ ] Header, footer, mobile menu
- [ ] Home page, database ke data se
- [ ] Collection page, filters aur sorting ke saath
- [ ] Product page aur size selector
- [ ] Search
- [ ] Enquiry forms
- [ ] Policy aur about pages
- [ ] Cookie banner aur preferences page
- [ ] Consent records
- [ ] Consent ke baad GA4 aur browsing events
- [ ] SEO metadata, canonical URLs, breadcrumbs
- [ ] Product aur organization structured data

**Done jab:** customer mobile par product dhoondh kar size-wise price dekh sake, aur consent se pehle koi tracking script load na ho.

## Phase 3: Cart, checkout, payment

- [ ] Cart
- [ ] Offer engine aur coupons, unit tests ke saath
- [ ] Address aur checkout flow
- [ ] Razorpay test mode
- [ ] Payment webhook verification
- [ ] COD aur pincode check
- [ ] Stock kam karna
- [ ] Checkout aur purchase analytics events

**Done jab:** test payment aur COD dono se order ban jaye aur amount server par sahi calculate ho.

## Phase 4: Order management + accounts

- [ ] Admin order list, detail aur status update
- [ ] Invoice
- [ ] Customer login
- [ ] Order history aur tracking number
- [ ] Order emails
- [ ] Admin: coupons, customers, enquiries
- [ ] Admin MFA aur audit logs
- [ ] Data access, correction aur deletion requests

**Done jab:** order shuru se delivered tak admin se chal sake.

## Phase 5: Launch prep

- [ ] Asli products aur photos
- [ ] Sitemap, robots.txt, Search Console, Bing Webmaster Tools
- [ ] AEO: FAQ aur buying-guide content
- [ ] GEO: facts, brand pages, AI crawler policy
- [ ] Performance aur image optimization
- [ ] Mobile aur browser testing
- [ ] Security check: rate limits, admin routes, env secrets
- [ ] Privacy notice, cookie list aur retention policy ka lawyer review
- [ ] Breach response plan aur vendor list
- [ ] Backup restore test
- [ ] Domain aur production hosting
- [ ] Razorpay live mode
- [ ] Analytics funnel verify
- [ ] Ek asli order se poora test

**Done jab:** live site par ek asli order safal ho.

## Phase 6: V2

PRD ke order mein:

1. Reviews
2. Wishlist
3. Shiprocket aur live tracking
4. Back-in-stock alerts
5. CSV bulk upload
6. Admin se homepage banners
7. WhatsApp alerts
8. Delivery timeline
9. Video section
10. Session replay aur heatmaps
11. A/B testing
12. Buying guides aur blog
13. GDPR review, agar EU/UK mein bechna ho
14. SOC 2 audit, agar B2B clients maangein

## Owner ko kya dena hai

| Kab tak | Kya |
|---|---|
| Phase 2 se pehle | Pehle 10-20 products ki photos, sizes, prices |
| Phase 3 se pehle | Offer rules, COD pincodes, Razorpay account |
| Phase 5 se pehle | Policies, GST details, domain, grievance contact, lawyer review |
