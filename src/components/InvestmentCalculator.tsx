import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, Wallet, ArrowUpRight, Percent } from "lucide-react";
import { calculateCompoundInterest } from "@/lib/investmentCalc";
import { formatCurrency, currencies } from "@/lib/currency";

export function InvestmentCalculator({ currency }: { currency: string }) {
  const [initialBalance, setInitialBalance] = useState<number>(0);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(0);
  const [annualRate, setAnnualRate] = useState<number>(0);
  const [years, setYears] = useState<number>(0);

  const results = useMemo(() => 
    calculateCompoundInterest(initialBalance, monthlyContribution, annualRate, years),
  [initialBalance, monthlyContribution, annualRate, years]);

  const finale = results[results.length - 1] || { balance: 0, totalContribution: 0, totalInterest: 0 };
  
  const activeCurrency = currencies.find(c => c.code === currency) || currencies[0];
  const symbol = activeCurrency.code === "BDT" ? "BDT" : activeCurrency.symbol;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Investment & Growth</h1>
        <p className="text-muted-foreground font-medium">Project your wealth over time with compound interest.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" /> Strategy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Initial Investment ({symbol})</Label>
                <Input type="number" value={initialBalance} onChange={(e) => setInitialBalance(Number(e.target.value))} />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Monthly Contribution ({symbol})</Label>
                <Input type="number" value={monthlyContribution} onChange={(e) => setMonthlyContribution(Number(e.target.value))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Expected Return (%)</Label>
                  <div className="relative">
                    <Input type="number" value={annualRate} onChange={(e) => setAnnualRate(Number(e.target.value))} className="pr-8" />
                    <Percent className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Duration (Years)</Label>
                  <Input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground text-center">Final Estimated Balance</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-2 pb-8">
              <p className="text-5xl font-black text-primary animate-in zoom-in-50 duration-500">
                {formatCurrency(finale.balance, currency)}
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold">
                <TrendingUp className="h-3 w-3" />
                {((finale.balance / finale.totalContribution - 1) * 100).toFixed(1)}% Total Growth
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Invested</p>
                <p className="text-2xl font-bold">{formatCurrency(finale.totalContribution, currency)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Interest</p>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(finale.totalInterest, currency)}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <div className="p-4 border-b bg-muted/30 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
               <ArrowUpRight className="h-4 w-4" /> Growth Trajectory
            </div>
            <div className="max-h-[400px] overflow-y-auto overflow-x-hidden divide-y divide-border/50">
              {results.map((res) => (
                <div key={res.year} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold">Year {res.year}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Invested: {formatCurrency(res.totalContribution, currency)}</p>
                  </div>
                  <p className="text-lg font-black tracking-tight">{formatCurrency(res.balance, currency)}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
