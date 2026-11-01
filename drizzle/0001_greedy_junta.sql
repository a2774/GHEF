CREATE TABLE "newsletter_subscribers" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"consented_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "newsletter_subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
-- Remove the first sample catalogue. It has no colour data, and seed replaces it.
DELETE FROM "products";--> statement-breakpoint
DROP INDEX "product_variants_product_size_idx";--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN "color" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "product_variants_product_size_color_idx" ON "product_variants" USING btree ("product_id","size","color");