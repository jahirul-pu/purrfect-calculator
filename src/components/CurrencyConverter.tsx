import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, ArrowLeftRight, TrendingUp } from "lucide-react";
import { currencies, convertCurrency, formatCurrency } from "@/lib/currency";

export function CurrencyConverter() {
  const [amount, setAmount] = useState<number>(0);
  const [fromCurrency, setFromCurrency] = useState<string>("USD");
  const [toCurrency, setToCurrency] = useState<string>("BDT");

  const result = useMemo(() => 
    convertCurrency(amount, fromCurrency, toCurrency)
  , [amount, fromCurrency, toCurrency]);

  const fromInfo = currencies.find(c => c.code === fromCurrency) || currencies[0];
  const toInfo = currencies.find(c => c.code === toCurrency) || currencies[0];

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
          <CardDescription>Using standardized rates for estimation.</CardDescription>
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
                 1 {fromCurrency} = {formatCurrency(convertCurrency(1, fromCurrency, toCurrency), toCurrency)}
               </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-muted/30 border border-dashed flex items-start gap-3">
             <TrendingUp className="h-5 w-5 text-primary shrink-0 mt-0.5" />
             <p className="text-xs text-muted-foreground leading-relaxed">
               Note: These are <span className="text-foreground font-bold">Standardized Estimations</span> based on common market averages. For real-time financial transactions, please refer to your bank's official daily exchange rates.
             </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
