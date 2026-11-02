-- Migration 0009 (storefront features) for the Neon SQL Editor.
-- Use this if `npm run db:migrate` cannot be run. Safe to run more than once.
-- console.neon.tech -> your project -> SQL Editor -> pick the same branch and
-- database as DATABASE_URL -> paste everything -> Run.

ALTER TYPE "public"."enquiry_type" ADD VALUE IF NOT EXISTS 'cleaning';
ALTER TYPE "public"."enquiry_type" ADD VALUE IF NOT EXISTS 'wall_to_wall';

ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "is_ready_to_dispatch" boolean DEFAULT false NOT NULL;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "rooms" text[] DEFAULT '{}'::text[] NOT NULL;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "pile_height" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "backing" text;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "discount_note" text;

CREATE TABLE IF NOT EXISTS "stock_alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"variant_id" integer NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"notified_at" timestamp with time zone
);

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'stock_alerts_variant_id_product_variants_id_fk') THEN
		ALTER TABLE "stock_alerts" ADD CONSTRAINT "stock_alerts_variant_id_product_variants_id_fk"
			FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;
	END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "stock_alerts_variant_email_idx" ON "stock_alerts" USING btree ("variant_id", "email");

-- Record it, so a later `npm run db:migrate` does not try to apply 0009 again.
DO $$
BEGIN
	IF to_regclass('drizzle.__drizzle_migrations') IS NOT NULL
		AND NOT EXISTS (SELECT 1 FROM drizzle.__drizzle_migrations WHERE created_at = 1793642226632) THEN
		INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
		VALUES ('9bc3c260a3a09b6186e3cedb03a9dc84f1222307d5a39e519a6925b6e739e4cb', 1793642226632);
	END IF;
END $$;

-- Check: should list 4 columns.
SELECT column_name FROM information_schema.columns
WHERE table_name = 'products' AND column_name IN ('is_ready_to_dispatch', 'rooms', 'pile_height', 'backing');
