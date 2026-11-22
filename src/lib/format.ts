const rupees = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatPaise(paise: number) {
  if (typeof paise !== "number" || !Number.isFinite(paise)) return "₹0";
  return rupees.format(paise / 100);
}

const priceTag = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** A price as printed on the shop cards, e.g. 699900 paise → "Rs. 6,999.00". */
export function formatPriceTag(paise: number) {
  if (typeof paise !== "number" || !Number.isFinite(paise)) return "Rs. 0.00";
  return `Rs. ${priceTag.format(paise / 100)}`;
}

const rupeeAmount = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** The rupee figure without the ₹ sign, e.g. 122500 paise → "1,225". */
export function formatRupeeAmount(paise: number) {
  if (typeof paise !== "number" || !Number.isFinite(paise)) return "0";
  return rupeeAmount.format(paise / 100);
}
