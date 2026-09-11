export type MonetaryValue = number | string | null | undefined;

const phpCurrencyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  currencyDisplay: "narrowSymbol",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const decimalFormatter = new Intl.NumberFormat("en-PH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function toMonetaryNumber(value: MonetaryValue): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const parsed = Number(String(value ?? "").replaceAll(",", ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatPhpCurrency(value: MonetaryValue): string {
  return phpCurrencyFormatter.format(toMonetaryNumber(value));
}

export function formatMoneyAmount(value: MonetaryValue): string {
  return decimalFormatter.format(toMonetaryNumber(value));
}
