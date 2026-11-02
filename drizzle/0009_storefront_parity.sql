ALTER TYPE "public"."enquiry_type" ADD VALUE 'cleaning';--> statement-breakpoint
ALTER TYPE "public"."enquiry_type" ADD VALUE 'wall_to_wall';--> statement-breakpoint
CREATE TABLE "stock_alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"variant_id" integer NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"notified_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "discount_note" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "is_ready_to_dispatch" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "rooms" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "pile_height" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "backing" text;--> statement-breakpoint
ALTER TABLE "stock_alerts" ADD CONSTRAINT "stock_alerts_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "stock_alerts_variant_email_idx" ON "stock_alerts" USING btree ("variant_id","email");