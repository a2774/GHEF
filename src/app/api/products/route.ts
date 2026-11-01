import { connection, NextResponse } from "next/server";

import { getFeaturedProducts } from "@/server/services/products";

export async function GET() {
  await connection();
  const products = await getFeaturedProducts();
  return NextResponse.json({ products });
}
