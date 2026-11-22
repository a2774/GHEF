import assert from "node:assert/strict";
import { test } from "node:test";

import { describeDbError } from "./db-error";

test("unwraps the Postgres cause and hints at migrations", () => {
  const pg = Object.assign(new Error("column products.rooms does not exist"), { code: "42703" });
  const wrapped = new Error("Failed query: select ...\nparams: 1", { cause: pg });
  assert.equal(
    describeDbError(wrapped),
    "column products.rooms does not exist. The database is missing a migration: run `npm run db:migrate`.",
  );
});

test("keeps other errors as they are", () => {
  assert.equal(describeDbError(new Error("connection refused")), "connection refused");
});
