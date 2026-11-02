import { connection, NextResponse } from "next/server";

import { getFeaturedProducts } from "@/server/services/products";

export async function GET() {
  await connection();
  try {
    const products = await getFeaturedProducts();
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Failed to load products API:", error);
    return NextResponse.json(
      { error: "Failed to load products." },
      { status: 500 },
    );
  }
}
