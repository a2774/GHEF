import { existsSync } from "node:fs";

import { defineConfig } from "drizzle-kit";

if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
} else if (existsSync(".env")) {
  process.loadEnvFile(".env");
}

const rawUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!rawUrl) {
  throw new Error("DATABASE_URL or DATABASE_URL_UNPOOLED must be set in .env.local or .env");
}

// Migrations prefer a direct unpooled connection, but fall back to DATABASE_URL.
const connectionUrl = new URL(rawUrl);
connectionUrl.searchParams.set("sslmode", "require");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: connectionUrl.href },
});
