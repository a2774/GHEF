# PRD: Ganga Handmade Export E-commerce Website

| | |
|---|---|
| Status | Draft 1 |
| Date | 2026-11-01 |
| Brand name | Ganga Handmade Export (GHE) |
| Reference | carpetplanet.in (sirf features aur flow ka idea, design/content copy nahi karna) |

## 1. Goal

Handmade carpets aur rugs online bechne ke liye apni website, jisme teen hisse hon:

- **Frontend:** customer browse kare, size chune aur order kare
- **Backend:** products, orders, payments aur offers ka logic
- **Admin panel:** owner bina code ke products, orders aur offers sambhale

Business goals:

- **Discovery:** Google aur AI answer engines dono par mile (SEO, AEO, GEO)
- **Insight:** user behavior samajh kar conversion badhana (analytics)
- **Trust:** customer data ka zimmedari se use (cookie consent, DPDP Act, GDPR readiness, SOC 2 style controls)

Details ke liye sections 12 aur 13 dekhein.

## 2. Success metrics (launch ke baad)

| Metric | Target |
|---|---|
| Mobile par home page load (LCP) | 2.5 second se kam |
| Checkout complete karne wale carts | Launch data aane par baseline banegi |
| Admin se naya product daalne ka samay | 5 minute se kam |
| Payment aur order status mismatch | 0 |
| Core Web Vitals | Key pages par "Good" |
| Organic traffic aur AI referrals | Launch ke baad baseline, phir har mahine growth |
| Analytics events bina consent ke | 0 |
| Data deletion request ka response | Policy mein tay samay ke andar |

## 3. Users

| User | Zaroorat |
|---|---|
| Home buyer | Room aur budget ke hisaab se carpet dhoondna, size ke hisaab se price dekhna |
| Interior designer / bulk buyer | Custom size ya bulk order ki enquiry |
| Store owner (admin) | Stock, orders, offers aur enquiries sambhalna |

## 4. Scope

### MVP (launch ke liye zaroori)

**Frontend**
- Home: offer ticker, hero, room tiles, bestsellers, new arrivals, shop by color, brand story
- Collection page: category, room, color, size aur price filters; sorting; pagination
- Product page: gallery, size selector, sale price + MRP, offers, stock status, description, FAQ
- Cart, checkout, order confirmation
- Customer login aur order history
- Search
- Enquiry forms: bulk aur custom carpet
- Policy pages: privacy, terms, shipping, return
- Mobile-first responsive design
- Cookie consent banner aur preferences page
- Privacy notice, grievance contact aur data request form
- SEO, AEO aur GEO basics (section 13)

**Backend**
- Product, variant, category, order, customer aur coupon APIs
- Offer engine (section 6)
- Razorpay payment + webhook verification, COD
- Stock check aur order par stock kam karna
- Order emails
- Admin APIs ke liye role-based access
- Consent records, audit logs aur data export/delete workflow
- Consent-gated analytics events (section 12)

**Admin panel (`/admin`)**
- Secure login
- Dashboard: aaj ke orders, sales, low stock
- Products: add/edit, photos, size-wise price aur stock
- Categories aur collections
- Orders: status update, tracking number, invoice
- Coupons aur offers
- Customers
- Enquiries
- Data requests aur audit log
- Har product ke SEO fields (title, description, image alt)

### V2 (launch ke baad)

- Reviews aur ratings, admin approval ke saath
- Wishlist
- Back-in-stock alert
- Shiprocket integration aur live tracking
- CSV se bulk product upload
- Homepage banners admin se badalna
- WhatsApp order alerts
- Estimated delivery timeline
- Influencer/video section
- Session replay aur heatmaps
- A/B testing
- Buying guides aur blog
- SOC 2 Type I/II audit, agar B2B ya enterprise clients maangein

### Abhi scope mein nahi

- Multi-vendor marketplace
- Mobile app
- International shipping aur multi-currency
- Hindi language version

## 5. Key user flows

**Kharidna:** Home → Collection → Product → size chunna → Cart → Address → Payment (Razorpay/COD) → Confirmation

**Admin product:** Login → Products → New → details, photos, sizes → Publish → site par dikhe

**Order fulfil:** Naya order → Confirm → Pack → Tracking number → Shipped → Delivered

## 6. Business rules

Ye reference site se liye gaye examples hain. Final percentage owner tay karega.

| Rule | Default |
|---|---|
| 3 carpets par | 10% off |
| 4 carpets par | 15% off |
| Coupon code | Admin se banega |
| Prepaid order | Extra 5% off |
| COD | Sirf chune hue pincodes par |
| Price | Hamesha variant (size) ka; product par koi ek price nahi |
| Discount stacking | Tay karna hai (section 10) |
| Money | Database mein paise (integer) mein, GST-inclusive |

Price aur discount hamesha server par calculate honge. Browser se aayi value par kabhi bharosa nahi karna.

## 7. Data model

| Table | Main fields |
|---|---|
| `User` | name, email, phone, role (customer/admin) |
| `Address` | userId, line1, city, state, pincode |
| `Category` | name, slug, type (material/room/shape), parentId |
| `Product` | title, slug, description, material, color, pileHeight, status, isFeatured |
| `ProductImage` | productId, url, alt, position |
| `ProductVariant` | productId, size, color, sku, pricePaise, mrpPaise, stock |
| `Order` | orderNumber, userId, status, paymentStatus, paymentMethod, totals, shippingAddress (snapshot) |
| `OrderItem` | orderId, variantId, title, size, unitPricePaise, quantity |
| `Payment` | orderId, razorpayOrderId, razorpayPaymentId, status, amountPaise |
| `Coupon` | code, type, value, minCart, usageLimit, startsAt, endsAt, isActive |
| `Enquiry` | type (bulk/custom), name, phone, message, status, createdAt |
| `NewsletterSubscriber` | email, consentedAt |
| `ConsentRecord` | userId/anonymousId, categories, policyVersion, grantedAt, withdrawnAt |
| `DataRequest` | userId, type (access/correct/delete), status, createdAt, completedAt |
| `AuditLog` | actorId, action, entity, entityId, createdAt |

`OrderItem` mein title aur price ki copy rakhni hai, taaki product badalne par purane orders na badlein.

## 8. Tech stack aur folder structure

| Kaam | Tool |
|---|---|
| Frontend + backend | Next.js (App Router) + TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| Database | Neon Postgres (project `aged-lab-57945058`) |
| Images | Cloudinary (details `.env.local` mein, abhi Test environment) |
| Payment | Razorpay |
| Shipping | Shiprocket (V2) |
| Owner email alerts | Resend, `gangahandmadeexport@gmail.com` par |

Frontend aur backend ek hi Next.js project mein rahenge, lekin folders alag honge:

```text
src/
  app/
    (store)/        # Frontend: customer pages
    admin/          # Frontend: admin panel pages
    api/            # Backend: HTTP routes
  components/
    ui/             # shadcn components
    store/          # Storefront components
  server/           # Backend: database aur business logic
    db/             # Connection aur schema
    services/       # Products, orders, offers
  lib/              # Shared utilities
```

## 9. UI design

**Direction:** Apple jaisa clean, minimal aur premium lifestyle brand. Carpet ki photo hi design ka hero hai, text kam aur shopping aasan. Hero: Cinematic room photo, fixed liquid glass floating navbar, headline "A softer way to live."

| Token | Value | Use |
|---|---|---|
| Background | `#FBF8F2` | Page, soft ivory |
| Text / primary | `#2B2622` | Charcoal: headings, body, buttons |
| Ink | `#1F1C19` | Footer aur navbar glass |
| Accent | `#C9B596` | Sand: chhote highlights |
| Muted | `#EFE7DA` | Beige cards aur sections |
| Border | `#DDD1BF` | Lines |

- **Typography:** headings ke liye Bricolage Grotesque, body ke liye Inter; bade, tight headings aur 18px body text
- **Shape:** rounded corners aur pill buttons
- **Layout:** saara content `max-w-7xl mx-auto` mein, navbar scroll par fixed
- **Spacing:** bade margins, photos ko jagah milni chahiye
- **Mobile:** sticky add-to-cart, 44px se bade touch targets, filters bottom sheet mein
- **Accessibility:** WCAG AA contrast, keyboard navigation, har image par alt text
- **Components:** shadcn ke Button, Badge, Sheet, Dialog, Accordion, Select, Table, Form

## 10. Open questions

| Sawal | Kisko tay karna hai |
|---|---|
| Domain | Owner |
| Kya discounts ek saath judenge, aur max kitna? | Owner |
| Kaunse pincodes par COD? | Owner |
| Return policy kya hogi? | Owner |
| GST rate aur invoice format | Owner + CA |
| Hosting: Vercel Pro ya VPS? | Owner + developer |
| Customer login: phone OTP ya email? | Owner + developer |
| Kya EU/UK customers ko bechna hai? (GDPR ka scope isi se tay hoga) | Owner |
| Privacy notice aur grievance officer ki final details | Owner + lawyer |
| Kya kisi B2B client ko SOC 2 report chahiye? | Owner |

## 11. Risks

| Risk | Bachav |
|---|---|
| Achhi product photos nahi hongi | Launch se pehle photoshoot, 10-20 products se shuru |
| Ek hi piece do logon ko bik jaye | Payment ke samay stock transaction mein check |
| Razorpay webhook miss ho | Idempotent handler + admin mein payment status |
| COD par fake orders | Pincode limit aur COD confirmation |
| Reference site ka content copy ho jaye | Sirf apni photos aur apna text |
| Bina consent tracking chal jaye | Scripts consent milne ke baad hi load hon, launch se pehle test |
| Compliance ko sirf banner samajh lena | Launch se pehle lawyer se privacy review |

## 12. Analytics, consent aur compliance

Ye product requirements hain, legal advice nahi. Launch se pehle lawyer se review zaroori hai.

### Analytics aur user behavior

| Layer | Tool | Kaam |
|---|---|---|
| Traffic + funnel | Google Analytics 4 | Sources, conversion, e-commerce reports |
| Search | Google Search Console, Bing Webmaster Tools | Keywords, indexing |
| Behavior (V2) | Microsoft Clarity ya PostHog | Heatmaps, session replay, drop-off |
| Business data | Admin dashboard | Sales, stock, top products |

**Track hone wale events:** `view_item_list`, `view_item`, `select_size`, `filter_applied`, `search`, `add_to_cart`, `remove_from_cart`, `begin_checkout`, `add_payment_info`, `purchase`, `enquiry_submitted`

**Rules:**
- Events mein naam, phone, email ya address nahi jayenge
- Session replay mein form inputs mask honge
- Checkout aur account pages replay se bahar rahenge

### Cookies

| Category | Example | Default |
|---|---|---|
| Necessary | Login session, cart, security | Hamesha on |
| Analytics | GA4 | Off, consent ke baad on |
| Behavior | Clarity/PostHog | Off, consent ke baad on |
| Marketing | Meta Pixel, Google Ads | Off, consent ke baad on |

- Banner par Accept all, Reject all aur Manage options teeno barabar dikhenge
- User kabhi bhi footer ke link se choice badal sakta hai
- Consent ka record policy version ke saath save hoga
- Cookie list privacy page par rahegi

### DPDP Act (India, primary)

India mein customer data ke liye Digital Personal Data Protection Act, 2023 aur uske Rules mukhya law hain. Obligations phases mein lagu hote hain, isliye current dates lawyer se confirm karni hain.

- Saaf bhasha mein privacy notice: kya data, kyun, aur rights kaise use karein
- Purpose ke hisaab se consent, aur withdraw karna utna hi aasan
- Sirf zaroori data lena (data minimization)
- Access, correction, deletion aur grievance ka raasta
- Sensitive data par security safeguards aur access logs
- Breach response plan
- Bachchon ka data na lena; site 18+ kharidaron ke liye
- Retention policy: zaroorat khatam hone par data hatana, tax/invoice records ko chhodkar

### GDPR (sirf agar EU/UK customers hon)

Abhi site India ke liye hai. Agar EU/UK ko target kiya gaya to GDPR lagu hoga. Isliye shuru se:

- Consent, access, deletion aur export ka flow DPDP ke saath hi banega
- Har vendor ki list rakhi jayegi (processors)
- International launch se pehle legal basis, DPA aur transfer rules ka review hoga

### SOC 2 (controls ab, audit baad mein)

SOC 2 koi feature nahi hai jo code mein add ho jaye. Ye independent CPA firm ka audit hai, jisme kharcha aur kai mahine ka process lagta hai. Ek B2C carpet store ke liye launch par zaroori nahi hai. Isliye MVP mein sirf uske controls apnayenge:

- Admin par MFA aur role-based access
- Audit logs
- Encrypted connections, secrets sirf env mein
- Backups aur restore test
- Dependency aur vulnerability scanning
- Incident response ka likha hua process
- Vendor list

Audit tabhi hoga jab koi B2B ya enterprise client maange.

## 13. SEO, AEO aur GEO

| Goal | Matlab | Target |
|---|---|---|
| SEO | Google search mein ranking | Category aur product keywords |
| AEO | Direct answers (featured snippets, voice) | "Hand tufted vs hand knotted" jaise sawal |
| GEO | ChatGPT, Gemini, Perplexity jaise AI answers mein zikr | Brand aur product mentions |

### SEO

- Har page par unique title, meta description aur canonical
- Saaf URLs: `/collections/hand-tufted`, `/products/<slug>`
- `sitemap.xml`, `robots.txt` aur breadcrumbs
- Structured data: Product, Offer, BreadcrumbList, Organization, LocalBusiness
- Server-rendered content, optimized images aur alt text
- Filter URLs par canonical/noindex, taaki duplicate pages na banein
- Google Business Profile, agar showroom ho

### AEO

- Product aur guide pages par seedhe sawal-jawab
- Har page par pehle chhota, saaf jawab, phir detail
- FAQ markup sirf tab jab sawal page par dikh rahe hon
- Topics: carpet size kaise chunein, material comparison, cleaning, room guide

### GEO

- Apna unique content: bunai ka process, Bhadohi jaisi origin details agar sach hon, kaarigar ki kahani
- Bina JavaScript ke bhi padhne layak HTML
- Saaf facts: material, size, pile height, warranty, delivery
- Author, business details aur policies saaf likhi hon
- Asli reviews aur trusted sites par brand mentions
- `robots.txt` mein AI crawlers ke liye soch-samajh kar policy
- AI referrals ko analytics mein alag track karna

Koi bhi tool AI answers mein aane ki guarantee nahi deta. Har claim sach aur prove karne layak hona chahiye, jaise "100% handmade" ya customer numbers.
