import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Banknote, Percent, Wallet, ReceiptText, PieChart } from "lucide-react";
import { calculateLoan } from "@/lib/loanCalc";
import { formatCurrency, currencies } from "@/lib/currency";

export function LoanCalculator({ currency }: { currency: string }) {
  const activeCurrency = currencies.find(c => c.code === currency) || currencies[0];
  const symbol = activeCurrency.code === "BDT" ? "BDT" : activeCurrency.symbol;

  const [amount, setAmount] = useState<number>(0);
  const [rate, setRate] = useState<number>(0);
  const [years, setYears] = useState<number>(0);
  const [months, setMonths] = useState<number>(0);

  const result = useMemo(() => calculateLoan(amount, rate, years, months), [amount, rate, years, months]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Loan Calculator</h1>
        <p className="text-muted-foreground font-medium">Calculate monthly payments and total interest costs.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wallet className="h-4 w-4" /> Loan Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="amount" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Loan Amount (Principal)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground font-bold">{symbol}</span>
                  <Input id="amount" type="number" className="pl-12" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="rate" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Interest Rate (% Yearly)</Label>
                <div className="relative">
                  <Percent className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="rate" type="number" step="0.1" value={rate} onChange={(e) => setRate(parseFloat(e.target.value) || 0)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="years" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Years</Label>
                  <Input id="years" type="number" value={years} onChange={(e) => setYears(parseInt(e.target.value) || 0)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="months" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Months</Label>
                  <Input id="months" type="number" value={months} onChange={(e) => setMonths(parseInt(e.target.value) || 0)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-7 space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-8 pb-8 text-center space-y-4">
               <div className="space-y-1">
                 <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Estimated Monthly Payment</p>
                 <p className="text-5xl font-black">{formatCurrency(result.monthlyPayment, currency)}</p>
               </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
             <Card className="border-dashed shadow-none">
               <CardContent className="pt-6 flex items-start gap-4">
                 <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                   <ReceiptText className="h-5 w-5" />
                 </div>
                 <div className="space-y-1">
                   <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Payment</p>
                   <p className="text-xl font-bold">{formatCurrency(result.totalPayment, currency)}</p>
                 </div>
               </CardContent>
             </Card>

             <Card className="border-dashed shadow-none">
               <CardContent className="pt-6 flex items-start gap-4">
                 <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600">
                   <PieChart className="h-5 w-5" />
                 </div>
                 <div className="space-y-1">
                   <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Interest</p>
                   <p className="text-xl font-bold">{formatCurrency(result.totalInterest, currency)}</p>
                 </div>
               </CardContent>
             </Card>
          </div>

          <div className="p-4 rounded-lg border bg-muted/30 flex items-start gap-3">
             <Banknote className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
             <p className="text-xs text-muted-foreground leading-relaxed">
               This calculator uses the standard Equated Monthly Installment (EMI) formula. Actual lender rates and fees may vary.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
