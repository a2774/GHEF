export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "return_requested"
  | "returned"
  | "refunded";

const transitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  // "pending" is there so that a confirm pressed by mistake can be undone.
  confirmed: ["pending", "processing", "shipped", "cancelled"],
  processing: ["packed", "shipped", "cancelled"],
  packed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: ["return_requested"],
  return_requested: ["returned", "delivered"],
  returned: ["refunded"],
  cancelled: ["refunded"],
  refunded: [],
};

export function nextStatuses(status: OrderStatus) {
  return transitions[status];
}

export function canTransition(from: OrderStatus, to: OrderStatus) {
  return transitions[from].includes(to);
}

/**
 * A parcel with a tracking number has left the shop, so saving one moves a Confirmed, Processing or
 * Packed order to Shipped. If the owner picked a different status in the same save, that choice wins.
 */
export function statusAfterTracking(
  current: OrderStatus,
  requested: OrderStatus,
  trackingNumber: string | null,
): OrderStatus {
  if (!trackingNumber || requested !== current) return requested;
  return current === "confirmed" || current === "processing" || current === "packed" ? "shipped" : requested;
}

export function isCashOnDelivery(paymentMethod: string) {
  return /cash|cod/i.test(paymentMethod);
}

/**
 * The owner confirms a Pending order by hand. A cash on delivery order can always be confirmed; an online
 * order only once its payment has arrived (it then confirms itself, so this is a safety check).
 */
export function canConfirmOrder(status: OrderStatus, paymentMethod: string, paymentStatus: string) {
  return status === "pending" && (isCashOnDelivery(paymentMethod) || paymentStatus === "paid");
}

export function canCustomerCancel(status: OrderStatus) {
  return status === "pending" || status === "confirmed" || status === "processing";
}

/** The status as the customer reads it: a new cash on delivery order is "Order received", not a worrying "Pending". */
export function customerStatusLabel(status: OrderStatus, paymentMethod: string) {
  if (status === "pending") return isCashOnDelivery(paymentMethod) ? "Order received" : "Awaiting payment";
  return orderStatusLabel(status);
}

export function orderStatusLabel(status: string) {
  const label = status.replace(/_/g, " ");
  return label.charAt(0).toUpperCase() + label.slice(1);
}
