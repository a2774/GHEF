const rupees = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatPaise(paise: number) {
  if (typeof paise !== "number" || !Number.isFinite(paise)) return "₹0";
  return rupees.format(paise / 100);
}

const rupeeAmount = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** The rupee figure without the ₹ sign, e.g. 122500 paise → "1,225". */
export function formatRupeeAmount(paise: number) {
  if (typeof paise !== "number" || !Number.isFinite(paise)) return "0";
  return rupeeAmount.format(paise / 100);
}
