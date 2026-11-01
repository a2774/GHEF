# Ganga Handmade Export

E-commerce website for handmade carpets, rugs and home decor, with a customer storefront and a role-based admin panel.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Neon Postgres, Drizzle ORM, Auth.js, Cloudinary, Razorpay and Resend.

Project documents: [PRD](docs/PRD.md), [implementation plan](docs/IMPLEMENTATION_PLAN.md), [audit](docs/AUDIT.md), [roadmap](docs/ROADMAP.md).

## Getting started

Requires Node.js 20.19 or newer.

```bash
npm install
```

```bash
neon env pull
```

Copy `.env.example` to `.env.local` if you are not using `neon env pull`, then fill in the values below.

```bash
npm run db:migrate
```

```bash
npm run db:seed
```

```bash
npm run dev
```

Open <http://localhost:3000>. The admin panel is at <http://localhost:3000/admin/login>.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build (needs a database connection) |
| `npm run start` | Production server |
| `npm run lint` | ESLint |
| `npm test` | Unit tests |
| `npm run db:generate` | Create a migration from `src/server/db/schema.ts` |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Add the sample catalogue |

Migrations use `DATABASE_URL_UNPOOLED`. The app uses the pooled `DATABASE_URL`. Test risky migrations on a Neon branch first, and never reset a production database to apply a schema change.

## Configuration

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL`, `DATABASE_URL_UNPOOLED` | Yes | Neon Postgres |
| `AUTH_SECRET` | Yes | Customer sessions. Generate with `openssl rand -base64 32` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Yes | Owner login for the admin panel |
| `NEXT_PUBLIC_SITE_URL` | Yes | Public site address, used for SEO links |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | For uploads | Product images |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Optional | Google Sign-In. The button appears when both are set |
| `RESEND_API_KEY`, `NOTIFY_EMAIL`, `EMAIL_FROM` | Optional | Owner email alerts |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | Optional | Online payments. The option appears when the keys are set |

`NEXT_PUBLIC_` values are compiled into the browser build, so rebuild after changing them. Never commit `.env.local`.

### Google Sign-In

1. In Google Cloud Console, create an OAuth client of type Web application.
2. Add the redirect URI `https://YOUR_DOMAIN/api/auth/callback/google`, plus `http://localhost:3000/api/auth/callback/google` for development.
3. Set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`, then restart the server.

### Razorpay

1. In the Razorpay dashboard, switch to Test Mode and generate a key pair.
2. Set `NEXT_PUBLIC_RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`, then rebuild.
3. Add a webhook to `https://YOUR_DOMAIN/api/payments/razorpay/webhook` for `payment.captured` and `payment.failed`, and set `RAZORPAY_WEBHOOK_SECRET`.
4. Test a successful and a failed payment before switching to live keys.

### Cloudinary

Copy the cloud name, API key and API secret from the Cloudinary console. Uploads are signed on the server, and the secret never reaches the browser.

### Email

Set `RESEND_API_KEY`. Resend's shared sender only reaches the account owner's address, so verify a domain and set `EMAIL_FROM` before sending to customers.

## Project structure

```text
src/app/(store)/      storefront pages
src/app/admin/        admin panel
src/app/api/          route handlers
src/components/       store, admin and shadcn UI components
src/server/db/        schema, connection, seed
src/server/services/  business logic
src/server/actions/   server actions
src/server/auth/      customer and admin auth
drizzle/              migrations
docs/                 product and planning documents
```

## Deployment

1. Create a production Neon branch and set all required variables on the host.
2. Set `NEXT_PUBLIC_SITE_URL` to the public HTTPS address.
3. Run `npm run db:migrate` against production before deploying.
4. Build with `npm run build` and start with `npm run start`, or deploy to a Node host such as Vercel.
5. Replace the sample catalogue and placeholder photos, and review the policy pages with a lawyer.
6. Configure the Razorpay webhook and Google redirect URI for the production domain.
7. Confirm that the host sets `x-forwarded-for`, because rate limits use it. Behind no proxy, this header can be spoofed.
8. Place one real test order from start to finish.

## Testing

`npm test` runs pricing, coupon, order status, Razorpay signature and redirect tests. Browser checks are manual for now, using the flows in [the implementation plan](docs/IMPLEMENTATION_PLAN.md).
