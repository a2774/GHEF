export type ComingSoonCollection = {
  name: string;
  slug: string;
  /** Matches the name or slug of the real category that will replace this stand-in. */
  match: RegExp;
  /** A picture in the public folder shown until the real collection arrives. */
  photo: string;
};

/**
 * The planned collections the shop does not have yet: those with no real category whose name or
 * slug matches. Once the shop has one (for example a "Dari" category with products), its
 * stand-in drops out of this list, so the real card replaces it with nothing else to change.
 */
export function pendingCollections<T extends ComingSoonCollection>(
  planned: readonly T[],
  categories: readonly { name: string; slug: string }[],
): T[] {
  return planned.filter(({ match }) => !categories.some(({ name, slug }) => match.test(name) || match.test(slug)));
}
