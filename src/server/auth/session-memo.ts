type Entry<T> = { value: T; checkedAt: number; validUntil: number };

/**
 * A short memory of admin sessions that were just checked against the database.
 *
 * The session lives in the database, so every admin page used to wait for a round trip to it
 * (about 0.3 s from India, and a 3 to 5 second reconnect when the connection had gone idle),
 * even when the page's own data came from the cache. An entry is used for at most `ttlMs`,
 * and never past the moment the session itself expires. It is kept in this server process only.
 */
export function createSessionMemo<T>(ttlMs: number, maxEntries: number) {
  const entries = new Map<string, Entry<T>>();

  return {
    get(key: string, now = Date.now()): T | undefined {
      const entry = entries.get(key);
      if (!entry) return undefined;
      if (now - entry.checkedAt >= ttlMs || now >= entry.validUntil) {
        entries.delete(key);
        return undefined;
      }
      return entry.value;
    },

    set(key: string, value: T, validUntil: number, now = Date.now()) {
      // Delete first so the key moves to the back; the oldest entries are dropped when full.
      entries.delete(key);
      entries.set(key, { value, checkedAt: now, validUntil });
      while (entries.size > maxEntries) {
        const oldest = entries.keys().next().value;
        if (oldest === undefined) break;
        entries.delete(oldest);
      }
    },

    delete(key: string) {
      entries.delete(key);
    },

    get size() {
      return entries.size;
    },
  };
}
