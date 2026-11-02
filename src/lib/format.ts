const rupees = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatPaise(paise: number) {
  if (typeof paise !== "number" || !Number.isFinite(paise)) return "₹0";
  return rupees.format(paise / 100);
}
