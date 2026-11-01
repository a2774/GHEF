import { connection } from "next/server";

import { auth } from "./customer";

// Auth.js creates random values, so private pages must render per request.
export async function getCustomerSession() {
  await connection();
  return auth();
}
