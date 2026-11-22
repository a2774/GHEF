export type StockChange = { variantId: number; change: number };

/**
 * Adds up the changes made to the same variant and drops those that come to nothing. One UPDATE
 * that joins a list of values would apply only one of two rows for the same variant, so the list
 * must have each variant once.
 */
export function mergeStockChanges(changes: readonly StockChange[]): StockChange[] {
  const totals = new Map<number, number>();
  for (const { variantId, change } of changes) totals.set(variantId, (totals.get(variantId) ?? 0) + change);
  return [...totals].filter(([, change]) => change !== 0).map(([variantId, change]) => ({ variantId, change }));
}
