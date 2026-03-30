import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, ArrowLeftRight, TrendingUp } from "lucide-react";
import { currencies, convertCurrency, fetchExchangeRate, formatCurrency, getFallbackExchangeRate } from "@/lib/currency";

export function CurrencyConverter() {
  const [amount, setAmount] = useState<number>(0);
  const [fromCurrency, setFromCurrency] = useState<string>("USD");
  const [toCurrency, setToCurrency] = useState<string>("BDT");
  const [exchangeRate, setExchangeRate] = useState<number>(() => convertCurrency(1, "USD", "BDT"));
  const [rateDate, setRateDate] = useState<string | null>(null);
  const [rateSource, setRateSource] = useState<"live" | "fallback">("fallback");
  const [rateError, setRateError] = useState<string | null>(null);
  const [isLoadingRate, setIsLoadingRate] = useState<boolean>(true);

  useEffect(() => {
    const controller = new AbortController();
    const fallback = getFallbackExchangeRate(fromCurrency, toCurrency);

    setIsLoadingRate(true);
    setRateError(null);

    fetchExchangeRate(fromCurrency, toCurrency, controller.signal)
      .then((snapshot) => {
        setExchangeRate(snapshot.rate);
        setRateDate(snapshot.date);
        setRateSource(snapshot.source);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setExchangeRate(fallback.rate);
        setRateDate(fallback.date);
        setRateSource(fallback.source);
        setRateError(error instanceof Error ? error.message : "Live exchange rates are temporarily unavailable.");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingRate(false);
        }
      });

    return () => controller.abort();
  }, [fromCurrency, toCurrency]);

  const result = useMemo(() => amount * exchangeRate, [amount, exchangeRate]);
  const formattedRateDate = useMemo(() => {
    if (!rateDate) {
      return null;
    }

    return new Date(`${rateDate}T00:00:00Z`).toLocaleDateString(undefined, {
      dateStyle: "medium",
    });
  }, [rateDate]);

  const fromInfo = currencies.find(c => c.code === fromCurrency) || currencies[0];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Currency Converter</h1>
        <p className="text-muted-foreground font-medium">Quick and easy global exchange rate conversion.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" /> Exchange Tool
          </CardTitle>
          <CardDescription>
            Live reference rates via Frankfurter, with built-in fallback estimates if the feed is unavailable.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Amount</Label>
                <div className="relative">
                   <span className="absolute left-3 top-2.5 text-muted-foreground font-bold">{fromInfo.symbol}</span>
                   <Input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(Number(e.target.value))} 
                    className="pl-12 text-lg font-bold h-12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">From</Label>
                  <Select value={fromCurrency} onValueChange={setFromCurrency}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map(c => (
                        <SelectItem key={c.code} value={c.code}>{c.code} ({c.symbol})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">To</Label>
                  <Select value={toCurrency} onValueChange={setToCurrency}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map(c => (
                        <SelectItem key={c.code} value={c.code}>{c.code} ({c.symbol})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center space-y-4">
               <div className="p-4 rounded-full bg-primary/10 text-primary">
                 <ArrowLeftRight className="h-8 w-8" />
               </div>
               
               <div className="text-center space-y-1">
                 <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Converted Amount</p>
                 <p className="text-5xl font-black text-primary tracking-tight animate-in zoom-in-50 duration-500">
                   {formatCurrency(result, toCurrency)}
                 </p>
               </div>

               <div className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-muted border text-sm font-medium">
                 1 {fromCurrency} = {formatCurrency(exchangeRate, toCurrency)}
               </div>

               <p className="text-xs text-muted-foreground text-center max-w-xs leading-relaxed">
                 {isLoadingRate && "Refreshing live reference rate..."}
                 {!isLoadingRate && rateSource === "live" && (
                   <>Live reference rate{formattedRateDate ? ` from ${formattedRateDate}` : ""}.</>
                 )}
                 {!isLoadingRate && rateSource === "fallback" && "Using stored fallback estimates while the live rate feed is unavailable."}
               </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-muted/30 border border-dashed flex items-start gap-3">
             <TrendingUp className="h-5 w-5 text-primary shrink-0 mt-0.5" />
             <p className="text-xs text-muted-foreground leading-relaxed">
               Source: <span className="text-foreground font-bold">{rateSource === "live" ? "Frankfurter daily reference rates" : "Built-in fallback table"}</span>
               {formattedRateDate ? ` updated ${formattedRateDate}.` : "."}{" "}
               {rateError ? `${rateError} ` : ""}
               Final transaction amounts may still differ from your bank, card network, or money transfer provider.
             </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
