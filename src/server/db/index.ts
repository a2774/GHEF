import type { SocketConnectOpts } from "node:net";

import { drizzle } from "drizzle-orm/node-postgres";
import { Client, Pool, type ClientConfig } from "pg";

import { describeDbError } from "@/lib/db-error";

import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Run `neon env pull` to create .env.local.");
}

const connectionUrl = new URL(process.env.DATABASE_URL);
if (connectionUrl.hostname !== "localhost" && connectionUrl.hostname !== "127.0.0.1") {
  connectionUrl.searchParams.set("sslmode", "verify-full");
}

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
    max: 10,
    // A first connection takes about 3 seconds from India, and much longer when Neon has put the
    // database to sleep or the network is slow. 10 seconds was too short and made whole pages fail
    // with "timeout exceeded when trying to connect".
    connectionTimeoutMillis: 20_000,
    // A new connection to Neon costs a DNS lookup and a TLS handshake to the US, so idle ones are
    // kept for 2 minutes and clicks reuse a warm one. Not longer: Neon and home routers drop idle
    // connections after a few minutes, and a dead one only shows up as a timeout on the next click.
    idleTimeoutMillis: 120_000,
    // Small keep-alive packets stop a router from closing a quiet connection.
    keepAlive: true,
    keepAliveInitialDelayMillis: 10_000,
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

const transientCodes = new Set([
  "ECONNRESET",
  "ECONNREFUSED",
  "ETIMEDOUT",
  "EPIPE",
  "ENOTFOUND",
  "EAI_AGAIN",
  "08000",
  "08003",
  "08006",
  "08P01",
  "57P01",
  "57P03",
]);

const transientMessage =
  /connection terminated|timeout exceeded when trying to connect|server closed the connection|terminating connection|Connection ended unexpectedly/i;

function isTransient(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const { code, message, cause } = error as { code?: string; message?: string; cause?: unknown };
  return (
    (code !== undefined && transientCodes.has(code)) ||
    transientMessage.test(message ?? "") ||
    isTransient(cause)
  );
}

// Five tries with growing waits (0.5 s, 1.5 s, 3.5 s, 6 s: about 11 s in all). A Neon database that went
// to sleep, or a network link from India that dropped its idle connections ("read ECONNRESET"), can take
// several seconds to come back, and four tries within 7 seconds were not always enough.
const retryWaitsMs = [500, 1_500, 3_500, 6_000];

export async function withDbRetry<T>(run: () => Promise<T>, attempts = retryWaitsMs.length + 1): Promise<T> {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await run();
    } catch (error) {
      const retry = attempt < attempts && isTransient(error);
      // Drizzle's own message only says "Failed query"; this prints the real reason in the server log.
      console.warn(`Database query failed (try ${attempt} of ${attempts}${retry ? ", retrying" : ""}): ${describeDbError(error)}`);
      if (!retry) throw error;
      await new Promise((resolve) => setTimeout(resolve, retryWaitsMs[Math.min(attempt, retryWaitsMs.length) - 1]));
    }
  }
}
