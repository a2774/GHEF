import type { SocketConnectOpts } from "node:net";

import { drizzle } from "drizzle-orm/node-postgres";
import { Client, Pool, type ClientConfig } from "pg";

import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Run `neon env pull` to create .env.local.");
}

const connectionUrl = new URL(process.env.DATABASE_URL);
connectionUrl.searchParams.set("sslmode", "verify-full");

// On dual-stack networks (especially on Windows), Node attempts IPv6 first.
// If the local network or ISP blackholes IPv6, standard socket connects hang
// until timeout (~20-50s), which triggers Next.js "use cache" prerender timeouts.
// Forcing family: 4 on the underlying pg socket ensures instant (<400ms) connection.
class IPv4Client extends Client {
  constructor(config?: string | ClientConfig) {
    super(config);
    const socket = (this as unknown as { connection: { stream: { connect: (...args: unknown[]) => unknown } } })
      .connection.stream;
    const origConnect = socket.connect;
    socket.connect = function (...args: unknown[]) {
      if (typeof args[0] === "number") {
        const [port, host, ...rest] = args as [number, string, ...unknown[]];
        return origConnect.call(this, { port, host, family: 4 } as SocketConnectOpts, ...rest);
      }
      return origConnect.apply(this, args as [SocketConnectOpts]);
    };
  }
}

function createPool() {
  const pool = new Pool({
    connectionString: connectionUrl.href,
    Client: IPv4Client,
    max: 5,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 30_000,
    keepAlive: true,
  });
  // Without a listener, an idle connection dropped by Neon would crash the process.
  pool.on("error", (error) => console.error("Idle database connection closed:", error.message));
  return pool;
}

// Dev reloads re-run this module, so keep one pool instead of opening a new one each time.
const globalForDb = globalThis as typeof globalThis & { dbPool?: Pool };

export const pool = globalForDb.dbPool ?? createPool();
if (process.env.NODE_ENV !== "production") globalForDb.dbPool = pool;

export const db = drizzle({ client: pool, schema });

const transientCodes = new Set(["ECONNRESET", "ETIMEDOUT", "EPIPE", "08P01", "57P01"]);

const transientMessage = /connection terminated|timeout exceeded when trying to connect/i;

function isTransient(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const { code, message, cause } = error as { code?: string; message?: string; cause?: unknown };
  return (
    (code !== undefined && transientCodes.has(code)) ||
    transientMessage.test(message ?? "") ||
    isTransient(cause)
  );
}

export async function withDbRetry<T>(run: () => Promise<T>, attempts = 3): Promise<T> {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await run();
    } catch (error) {
      if (attempt >= attempts || !isTransient(error)) throw error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 500));
    }
  }
}
