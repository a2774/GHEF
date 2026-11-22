import { formatPaise } from "@/lib/format";
import type { orderItems, orders } from "@/server/db/schema";
import type { LabelSender } from "@/server/services/store-sender";

type LabelOrder = Pick<
  typeof orders.$inferSelect,
  | "orderNumber"
  | "createdAt"
  | "customerName"
  | "customerPhone"
  | "shippingAddress"
  | "paymentMethod"
  | "paymentStatus"
  | "subtotalPaise"
  | "discountPaise"
  | "discountNote"
  | "shippingPaise"
  | "totalPaise"
  | "courier"
  | "trackingNumber"
>;

type LabelItem = Pick<typeof orderItems.$inferSelect, "title" | "size" | "color" | "unitPricePaise" | "quantity">;

const orderDateFormat = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

const dashed = "border-t-2 border-dashed border-black";
const cell = "border border-black px-2.5 py-2 align-top";

/**
 * The packing slip and shipping label on one A4 page, laid out like the Amazon packing slip: a big
 * "Ship to" block on top (name, address, phone) that is cut out for the parcel, then the order number,
 * a delivery box (date, shipping service, buyer, seller), the products with prices and the totals.
 * Cash on delivery orders show the amount to collect; paid orders show PAID. Black on white, so it prints
 * clearly on any printer. A long order simply continues on a second page.
 */
export function ShippingLabel({
  order,
  items,
  sender,
}: {
  order: LabelOrder;
  items: LabelItem[];
  sender: LabelSender;
}) {
  const addressLines = order.shippingAddress
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !/^phone:/i.test(line));
  const seller = sender.name.toUpperCase();
  const cash = /cash|cod/i.test(order.paymentMethod);
  const paid = order.paymentStatus === "paid";
  const collect = cash && !paid;
  const contact = [sender.phone && `Phone: ${sender.phone}`, sender.email].filter(Boolean).join("  |  ");

  const info: [string, string][] = [
    ["Order Date:", orderDateFormat.format(order.createdAt)],
    ["Shipping Service:", order.courier || "Standard"],
    ["Payment:", cash ? "Cash on delivery" : `Online (${order.paymentMethod})`],
    ["Buyer Name:", order.customerName],
    ["Seller Name:", seller],
  ];
  if (order.trackingNumber) info.push(["Tracking No.:", order.trackingNumber]);

  return (
    <div
      className="bg-white text-black"
      style={{ width: "210mm", minHeight: "297mm", padding: "16mm 18mm", boxSizing: "border-box" }}
    >
      {/* Ship to, and what to do about the money */}
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <p className="text-[14px]">Ship to:</p>
          <div className="mt-2 text-[25px] leading-[1.3] font-bold break-words">
            <p>{order.customerName}</p>
            {addressLines.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
            <p>Phone : {order.customerPhone}</p>
          </div>
        </div>

        <div className="w-[52mm] shrink-0 border-[3px] border-black px-3 py-3 text-center">
          {collect ? (
            <>
              <p className="text-[13px] font-extrabold tracking-widest uppercase">Cash on delivery</p>
              <p className="mt-1 text-[12px] font-semibold">Collect from customer</p>
              <p className="mt-1 text-[30px] leading-none font-extrabold">{formatPaise(order.totalPaise)}</p>
            </>
          ) : paid ? (
            <>
              <p className="text-[38px] leading-none font-extrabold tracking-widest">PAID</p>
              <p className="mt-2 text-[12px] font-semibold">Do not collect any cash</p>
            </>
          ) : (
            <>
              <p className="text-[16px] leading-tight font-extrabold tracking-wide uppercase">Payment pending</p>
              <p className="mt-2 text-[12px] font-semibold">Confirm before dispatch</p>
            </>
          )}
        </div>
      </div>

      <div className={`my-6 ${dashed}`} />

      {/* Order */}
      <p className="text-[20px] font-bold">Order ID: {order.orderNumber}</p>
      <p className="text-[14px]">Thank you for buying from {seller}.</p>

      <div className="mt-3 flex border border-black text-[13px] leading-[1.75]">
        <div className="w-[44%] p-3">
          <p className="font-bold">Delivery address:</p>
          <p>{order.customerName}</p>
          {addressLines.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
        <div className="flex-1 p-3">
          <table className="w-full border-collapse">
            <tbody>
              {info.map(([label, value]) => (
                <tr key={label}>
                  <td className="w-[44%] align-top">{label}</td>
                  <td className="align-top break-words">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Products */}
      <table className="mt-3 w-full border-collapse text-[13px] leading-[1.6]">
        <thead>
          <tr className="text-left">
            <th className={`${cell} w-[16mm]`}>Quantity</th>
            <th className={cell}>Product Details</th>
            <th className={`${cell} w-[26mm]`}>Unit price</th>
            <th className={`${cell} w-[52mm] text-center`}>Order Totals</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td className={`${cell} text-center`}>{item.quantity}</td>
              <td className={cell}>
                <p className="font-bold">{item.title}</p>
                <p>
                  <strong>Size:</strong> {item.size}
                  {item.color ? (
                    <>
                      {" "}
                      <strong>Colour:</strong> {item.color}
                    </>
                  ) : null}
                </p>
              </td>
              <td className={cell}>{formatPaise(item.unitPricePaise)}</td>
              {index === 0 && (
                <td className={cell} rowSpan={items.length}>
                  <div className="flex justify-between gap-3">
                    <span className="font-bold">Item subtotal</span>
                    <span>{formatPaise(order.subtotalPaise)}</span>
                  </div>
                  {order.discountPaise > 0 && (
                    <div className="mt-1 flex justify-between gap-3">
                      <span className="font-bold">Discount</span>
                      <span>-{formatPaise(order.discountPaise)}</span>
                    </div>
                  )}
                  <div className="mt-1 flex justify-between gap-3">
                    <span className="font-bold">Shipping</span>
                    <span>{order.shippingPaise === 0 ? "Free" : formatPaise(order.shippingPaise)}</span>
                  </div>
                  <div className="mt-1 flex justify-between gap-3 border-t border-black pt-1">
                    <span className="font-bold">Total</span>
                    <span className="font-bold">{formatPaise(order.totalPaise)}</span>
                  </div>
                  <p className="mt-2 text-[11px]">Prices include taxes.</p>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-4 text-right text-[15px] font-bold">Grand total: {formatPaise(order.totalPaise)}</p>
      {order.discountNote && <p className="text-right text-[11px]">{order.discountNote}</p>}

      <p className="mt-6 text-[13px] leading-snug">
        <strong>Thanks for buying from {seller}.</strong> If anything is wrong with your order, write to us with
        the Order ID above{contact ? ` (${contact})` : ""}.
      </p>

      <div className={`my-6 ${dashed}`} />
    </div>
  );
}
