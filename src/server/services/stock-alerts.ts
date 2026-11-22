import { and, eq, gt, inArray, isNull } from "drizzle-orm";

import { siteName, siteUrl } from "@/lib/site";
import { db, withDbRetry } from "@/server/db";
import { products, productVariants, stockAlerts } from "@/server/db/schema";

import { sendEmail } from "./notifications";

export async function addStockAlert(variantId: number, email: string) {
  return withDbRetry(async () => {
    const [variant] = await db
      .select({ id: productVariants.id })
      .from(productVariants)
      .innerJoin(products, eq(productVariants.productId, products.id))
      .where(and(eq(productVariants.id, variantId), eq(products.status, "active")));
    if (!variant) return false;

    // Re-subscribing after an earlier alert starts a fresh one.
    await db
      .insert(stockAlerts)
      .values({ variantId, email })
      .onConflictDoUpdate({
        target: [stockAlerts.variantId, stockAlerts.email],
        set: { notifiedAt: null, createdAt: new Date() },
      });
    return true;
  });
}

/**
 * Emails everyone waiting on these variants that are now in stock. Each alert
 * is marked first, so a retry never sends the same email twice.
 */
export async function sendBackInStockAlerts(variantIds: number[]) {
  if (variantIds.length === 0) return 0;
  // Without an email provider, leave alerts waiting rather than marking them sent.
  if (!process.env.RESEND_API_KEY) {
    console.warn("Back-in-stock emails skipped: set RESEND_API_KEY.");
    return 0;
  }

  const waiting = await withDbRetry(async () =>
    db
      .select({
        id: stockAlerts.id,
        email: stockAlerts.email,
        title: products.title,
        slug: products.slug,
        size: productVariants.size,
        color: productVariants.color,
      })
      .from(stockAlerts)
      .innerJoin(productVariants, eq(stockAlerts.variantId, productVariants.id))
      .innerJoin(products, eq(productVariants.productId, products.id))
      .where(
        and(
          inArray(stockAlerts.variantId, variantIds),
          isNull(stockAlerts.notifiedAt),
          gt(productVariants.stock, 0),
          eq(products.status, "active"),
        ),
      )
      .limit(500),
  );

  let sent = 0;
  for (const alert of waiting) {
    const [claimed] = await withDbRetry(async () =>
      db
        .update(stockAlerts)
        .set({ notifiedAt: new Date() })
        .where(and(eq(stockAlerts.id, alert.id), isNull(stockAlerts.notifiedAt)))
        .returning({ id: stockAlerts.id }),
    );
    if (!claimed) continue;

    const ok = await sendEmail({
      to: alert.email,
      subject: `${alert.title} is back in stock`,
      text: [
        `Good news: ${alert.title} (${alert.color}, ${alert.size}) is back in stock.`,
        "",
        `${siteUrl}/products/${alert.slug}`,
        "",
        `You asked ${siteName} to tell you once. We will not email you about it again.`,
      ].join("\n"),
    });
    if (ok) {
      sent += 1;
    } else {
      // Release it so the next restock tries again.
      await withDbRetry(async () =>
        db.update(stockAlerts).set({ notifiedAt: null }).where(eq(stockAlerts.id, alert.id)),
      );
    }
  }
  return sent;
}
