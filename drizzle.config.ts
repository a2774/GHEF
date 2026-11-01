import { existsSync } from "node:fs";

import { defineConfig } from "drizzle-kit";

if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

// Migrations need a direct connection, not the pooled one.
const connectionUrl = new URL(process.env.DATABASE_URL_UNPOOLED!);
connectionUrl.searchParams.set("sslmode", "verify-full");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: connectionUrl.href },
});
