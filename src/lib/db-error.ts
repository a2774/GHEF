type ErrorLike = { message?: string; code?: string; cause?: unknown };

/**
 * Drizzle wraps Postgres errors as "Failed query: <sql>", hiding the real
 * reason in `cause`. This returns the useful part, plus a hint when the
 * database is behind the code.
 */
export function describeDbError(error: unknown) {
  let current = error as ErrorLike | undefined;
  let root = current;
  for (let depth = 0; current && depth < 5; depth += 1) {
    root = current;
    current = current.cause as ErrorLike | undefined;
  }
  const message = (root?.message ?? String(error)).split("\n")[0];
  // 42703: undefined column, 42P01: undefined table.
  const missingSchema =
    root?.code === "42703" || root?.code === "42P01" || /(column|relation) .* does not exist/.test(message);
  return missingSchema ? `${message}. The database is missing a migration: run \`npm run db:migrate\`.` : message;
}
