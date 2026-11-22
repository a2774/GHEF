import { relations, sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const productStatus = pgEnum("product_status", ["draft", "active", "archived"]);

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    parentId: integer("parent_id").references((): AnyPgColumn => categories.id, {
      onDelete: "restrict",
    }),
  },
  (table) => [index("categories_parent_id_idx").on(table.parentId)],
);

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull(),
    material: text("material").notNull(),
    color: text("color").notNull(),
    status: productStatus("status").notNull().default("draft"),
    isFeatured: boolean("is_featured").notNull().default(false),
    isBestseller: boolean("is_bestseller").notNull().default(false),
    // Ships from ready stock instead of being woven to order.
    isReadyToDispatch: boolean("is_ready_to_dispatch").notNull().default(false),
    // Room slugs from ROOMS in lib/catalog-taxonomy.ts, e.g. "living-room".
    rooms: text("rooms").array().notNull().default(sql`'{}'::text[]`),
    pileHeight: text("pile_height"),
    backing: text("backing"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("products_category_id_idx").on(table.categoryId)],
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    size: text("size").notNull(),
    color: text("color").notNull(),
    sku: text("sku").notNull().unique(),
    pricePaise: integer("price_paise").notNull(),
    mrpPaise: integer("mrp_paise").notNull(),
    stock: integer("stock").notNull().default(0),
  },
  (table) => [
    uniqueIndex("product_variants_product_size_color_idx").on(
      table.productId,
      table.size,
      table.color,
    ),
  ],
);

export const productImages = pgTable(
  "product_images",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    publicId: text("public_id").notNull().unique(),
    url: text("url").notNull(),
    alt: text("alt").notNull().default(""),
    isPrimary: boolean("is_primary").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("product_images_product_id_idx").on(table.productId)],
);

export const orderStatus = pgEnum("order_status", [
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
  "return_requested",
  "returned",
  "refunded",
]);

export const paymentStatus = pgEnum("payment_status", ["unpaid", "paid", "failed", "refunded"]);

export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    orderNumber: text("order_number").notNull().unique(),
    userId: text("user_id").references((): AnyPgColumn => users.id, { onDelete: "set null" }),
    idempotencyKey: text("idempotency_key").unique(),
    customerName: text("customer_name").notNull(),
    customerEmail: text("customer_email").notNull(),
    customerPhone: text("customer_phone").notNull(),
    shippingAddress: text("shipping_address").notNull(),
    status: orderStatus("status").notNull().default("pending"),
    paymentStatus: paymentStatus("payment_status").notNull().default("unpaid"),
    paymentMethod: text("payment_method").notNull(),
    subtotalPaise: integer("subtotal_paise").notNull(),
    discountPaise: integer("discount_paise").notNull().default(0),
    // Human readable breakdown, e.g. "Buy 3: -₹2,000 · Prepaid: -₹500".
    discountNote: text("discount_note"),
    shippingPaise: integer("shipping_paise").notNull().default(0),
    totalPaise: integer("total_paise").notNull(),
    courier: text("courier"),
    trackingNumber: text("tracking_number"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("orders_created_at_idx").on(table.createdAt),
    index("orders_user_id_idx").on(table.userId),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    variantId: integer("variant_id").references(() => productVariants.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    size: text("size").notNull(),
    color: text("color").notNull(),
    sku: text("sku").notNull(),
    unitPricePaise: integer("unit_price_paise").notNull(),
    quantity: integer("quantity").notNull(),
  },
  (table) => [index("order_items_order_id_idx").on(table.orderId)],
);

export const adminRole = pgEnum("admin_role", ["owner", "admin", "staff"]);

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: adminRole("role").notNull().default("staff"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminSessions = pgTable("admin_sessions", {
  tokenHash: text("token_hash").primaryKey(),
  email: text("email").notNull().default(""),
  role: adminRole("role").notNull().default("staff"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: serial("id").primaryKey(),
    actor: text("actor").notNull(),
    action: text("action").notNull(),
    entity: text("entity").notNull(),
    entityId: text("entity_id"),
    details: text("details"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("audit_logs_created_at_idx").on(table.createdAt)],
);

export const banners = pgTable("banners", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  linkUrl: text("link_url").notNull(),
  position: integer("position").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const storeSettings = pgTable("store_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const authAttempts = pgTable("auth_attempts", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  windowStartedAt: timestamp("window_started_at", { withTimezone: true }).notNull(),
});

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { withTimezone: true, mode: "date" }),
  image: text("image"),
  phone: text("phone").unique(),
  phoneVerified: timestamp("phone_verified", { withTimezone: true, mode: "date" }),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerAccountId] }),
    index("accounts_user_id_idx").on(table.userId),
  ],
);

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.identifier, table.token] })],
);

export const addressType = pgEnum("address_type", ["home", "work"]);

export const addresses = pgTable(
  "addresses",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    fullName: text("full_name").notNull(),
    phone: text("phone").notNull(),
    pincode: text("pincode").notNull(),
    state: text("state").notNull(),
    city: text("city").notNull(),
    locality: text("locality").notNull(),
    house: text("house").notNull(),
    landmark: text("landmark"),
    type: addressType("type").notNull().default("home"),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("addresses_user_id_idx").on(table.userId)],
);

export const paymentRecordStatus = pgEnum("payment_record_status", [
  "created",
  "paid",
  "failed",
  "refunded",
]);

export const payments = pgTable(
  "payments",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    providerOrderId: text("provider_order_id").notNull().unique(),
    providerPaymentId: text("provider_payment_id").unique(),
    status: paymentRecordStatus("status").notNull().default("created"),
    amountPaise: integer("amount_paise").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("payments_order_id_idx").on(table.orderId)],
);

export const returnStatus = pgEnum("return_status", ["requested", "approved", "rejected"]);

export const returnRequests = pgTable("return_requests", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .unique()
    .references(() => orders.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  status: returnStatus("status").notNull().default("requested"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const reviewStatus = pgEnum("review_status", ["pending", "approved", "rejected"]);

export const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    body: text("body").notNull(),
    status: reviewStatus("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("reviews_product_user_idx").on(table.productId, table.userId),
    index("reviews_status_idx").on(table.status),
  ],
);

export const couponType = pgEnum("coupon_type", ["percent", "fixed"]);

export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  type: couponType("type").notNull(),
  // A percentage for percent coupons, paise for fixed coupons.
  value: integer("value").notNull(),
  minCartPaise: integer("min_cart_paise").notNull().default(0),
  maxUses: integer("max_uses"),
  usedCount: integer("used_count").notNull().default(0),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const carts = pgTable("carts", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  couponId: integer("coupon_id").references(() => coupons.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cartItems = pgTable(
  "cart_items",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    variantId: integer("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("cart_items_user_variant_idx").on(table.userId, table.variantId)],
);

export const wishlistItems = pgTable(
  "wishlist_items",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.productId] })],
);

export const enquiryType = pgEnum("enquiry_type", ["custom", "bulk", "cleaning", "wall_to_wall"]);

export const enquiries = pgTable("enquiries", {
  id: serial("id").primaryKey(),
  type: enquiryType("type").notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const stockAlerts = pgTable(
  "stock_alerts",
  {
    id: serial("id").primaryKey(),
    variantId: integer("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    notifiedAt: timestamp("notified_at", { withTimezone: true }),
  },
  (table) => [uniqueIndex("stock_alerts_variant_email_idx").on(table.variantId, table.email)],
);

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  consentedAt: timestamp("consented_at", { withTimezone: true }).notNull().defaultNow(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  variants: many(productVariants),
  images: many(productImages),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
}));
