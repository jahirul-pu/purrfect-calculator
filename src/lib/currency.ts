export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  rateToUsd: number; // 1 USD = X Currency
}

export interface ExchangeRateSnapshot {
  rate: number;
  date: string | null;
  source: "live" | "fallback";
}

export const currencies: CurrencyInfo[] = [
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳", rateToUsd: 110 },
  { code: "USD", name: "US Dollar", symbol: "$", rateToUsd: 1 },
  { code: "EUR", name: "Euro", symbol: "€", rateToUsd: 0.92 },
  { code: "GBP", name: "British Pound", symbol: "£", rateToUsd: 0.79 },
  { code: "INR", name: "Indian Rupee", symbol: "₹", rateToUsd: 83 },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", rateToUsd: 151 },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", rateToUsd: 1.52 },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", rateToUsd: 1.35 },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", rateToUsd: 0.90 },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", rateToUsd: 7.23 },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", rateToUsd: 1.35 },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", rateToUsd: 3.67 },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼", rateToUsd: 3.75 },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", rateToUsd: 4.74 },
];

export function convertCurrency(amount: number, fromCode: string, toCode: string): number {
  const from = currencies.find(c => c.code === fromCode);
  const to = currencies.find(c => c.code === toCode);
  
  if (!from || !to) return amount;
  
  // Convert to USD first, then to target
  const inUsd = amount / from.rateToUsd;
  return inUsd * to.rateToUsd;
}

export function getFallbackExchangeRate(fromCode: string, toCode: string): ExchangeRateSnapshot {
  return {
    rate: convertCurrency(1, fromCode, toCode),
    date: null,
    source: "fallback",
  };
}

export async function fetchExchangeRate(
  fromCode: string,
  toCode: string,
  signal?: AbortSignal,
): Promise<ExchangeRateSnapshot> {
  if (fromCode === toCode) {
    return {
      rate: 1,
      date: new Date().toISOString().slice(0, 10),
      source: "live",
    };
  }

  const endpoint = new URL("https://api.frankfurter.dev/v2/rates");
  endpoint.searchParams.set("base", fromCode);
  endpoint.searchParams.set("quotes", toCode);

  const response = await fetch(endpoint.toString(), { signal });

  if (!response.ok) {
    throw new Error(`Live exchange request failed with status ${response.status}.`);
  }

  const data = await response.json() as Array<{
    date?: string;
    quote?: string;
    rate?: number;
  }>;

  const quote = data.find((entry) => entry.quote === toCode);
  const rate = quote?.rate;

  if (typeof rate !== "number") {
    throw new Error(`Live exchange request did not include a ${toCode} rate.`);
  }

  return {
    rate,
    date: quote?.date ?? null,
    source: "live",
  };
}

export function formatCurrency(amount: number, code: string): string {
  const currency = currencies.find(c => c.code === code) || currencies[0];
  
  // Requirement: Use BDT instead of symbol if BDT is chosen
  if (code === "BDT") {
    return `BDT ${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }
  
  return `${currency.symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}
