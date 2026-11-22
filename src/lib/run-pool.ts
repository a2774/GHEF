/**
 * Runs `worker` for every item, but never more than `limit` at the same time. Used for photo
 * uploads: all at once would fight over the same internet connection, one by one is slow.
 * A worker must handle its own errors; one that throws would stop the rest.
 */
export async function runWithLimit<T>(
  items: readonly T[],
  limit: number,
  worker: (item: T, index: number) => Promise<void>,
): Promise<void> {
  let next = 0;
  const lanes = Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, async () => {
    while (next < items.length) {
      const index = next;
      next += 1;
      await worker(items[index], index);
    }
  });
  await Promise.all(lanes);
}
