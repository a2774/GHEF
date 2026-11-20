/** Moves one item to a new place in the list and returns a new list. */
export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  if (from === to || from < 0 || from >= list.length || to < 0 || to >= list.length) return [...list];
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/**
 * The first photo is the cover photo of the product. The store already shows the cover first
 * and the rest in saved order, so "first in the list" and "primary" mean the same thing.
 */
export function withPrimaryFirst<T extends object>(list: readonly T[]): (T & { isPrimary: boolean })[] {
  return list.map((item, index) => ({ ...item, isPrimary: index === 0 }));
}
