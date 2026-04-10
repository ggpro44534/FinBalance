import { getLocale } from "../i18n";
import type { AppCurrency } from "../models/Settings";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function createId(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

type AppLanguage = "uk" | "en" | "cs";
type AppDateFormat = "dd.MM.yyyy" | "yyyy-MM-dd";

export const SUPPORTED_CURRENCIES: AppCurrency[] = ["UAH", "USD", "EUR", "CZK"];

const CURRENCY_TO_UAH_RATE: Record<AppCurrency, number> = {
  UAH: 1,
  USD: 43,
  EUR: 50,
  CZK: 2,
};

export function getCurrencyToUAHRate(currency: string): number {
  return CURRENCY_TO_UAH_RATE[currency as AppCurrency] ?? 1;
}

export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
) {
  if (!Number.isFinite(amount)) return 0;
  if (fromCurrency === toCurrency) return amount;

  const amountInUAH = amount * getCurrencyToUAHRate(fromCurrency);
  return amountInUAH / getCurrencyToUAHRate(toCurrency);
}

export function getCurrencyOptionLabel(currency: AppCurrency) {
  switch (currency) {
    case "UAH":
      return "UAH (₴)";
    case "USD":
      return "USD ($)";
    case "EUR":
      return "EUR (€)";
    case "CZK":
      return "CZK (Kč)";
    default:
      return currency;
  }
}

export function formatCurrency(
  value: number,
  currency: string,
  options?: { showDecimals?: boolean; language?: AppLanguage }
) {
  const showDecimals = options?.showDecimals ?? true;
  const language = options?.language ?? "uk";

  try {
    return new Intl.NumberFormat(getLocale(language), {
      style: "currency",
      currency,
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    }).format(value);
  } catch {
    const fallbackAmount = showDecimals ? value.toFixed(2) : value.toFixed(0);
    return `${fallbackAmount} ${currency}`;
  }
}

export function formatDate(
  iso: string,
  format: AppDateFormat = "dd.MM.yyyy",
  language: AppLanguage = "uk"
) {
  if (format === "yyyy-MM-dd") {
    return iso.slice(0, 10);
  }

  const d = new Date(iso);
  return d.toLocaleDateString(getLocale(language), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function toISODate(date = new Date()) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}
