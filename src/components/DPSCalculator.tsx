import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  PiggyBank,
  Percent,
  ShieldCheck,
  Calculator,
  TrendingUp,
  ArrowDownRight,
  Coins,
  Banknote,
  CalendarRange,
  Wallet,
} from "lucide-react";
import { calculateDPS, type DPSResult } from "@/lib/fdrDpsCalc";

function formatBDT(amount: number): string {
  return `৳ ${amount.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Common monthly installment presets used in BD banks
const INSTALLMENT_PRESETS = [500, 1000, 2000, 5000, 10000, 25000, 50000];

export function DPSCalculator() {
  const [monthlyInstallment, setMonthlyInstallment] = useState<number>(5000);
  const [interestRate, setInterestRate] = useState<number>(9.0);
  const [years, setYears] = useState<number>(5);
  const [isTinLinked, setIsTinLinked] = useState<boolean>(false);
  const [result, setResult] = useState<DPSResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const taxRate = isTinLinked ? 0.10 : 0.15;

  const handleCalculate = () => {
    const r = calculateDPS(monthlyInstallment, interestRate, years, taxRate);
    setResult(r);
    setShowResult(true);
  };

  return (
    <div className="space-y-6">
      {/* ── Input Card ── */}
      <Card className="border-sky-500/20 shadow-lg shadow-sky-500/5">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/10">
              <PiggyBank className="h-5 w-5 text-sky-600" />
            </div>
            DPS Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Monthly Installment */}
          <div className="grid gap-2">
            <Label htmlFor="dps-installment" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Monthly Installment (BDT)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground font-bold text-sm">৳</span>
              <Input
                id="dps-installment"
                type="number"
                className="pl-8"
                value={monthlyInstallment}
                onChange={(e) => setMonthlyInstallment(parseFloat(e.target.value) || 0)}
              />
            </div>
            {/* Quick presets */}
            <div className="flex flex-wrap gap-1.5">
              {INSTALLMENT_PRESETS.map((preset) => (
                <button
                  key={preset}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-md border transition-all duration-200 ${
                    monthlyInstallment === preset
                      ? "bg-sky-500 text-white border-sky-500 shadow-sm"
                      : "bg-muted/50 text-muted-foreground hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700"
                  }`}
                  onClick={() => setMonthlyInstallment(preset)}
                >
                  ৳{preset.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Interest Rate */}
          <div className="grid gap-2">
            <Label htmlFor="dps-rate" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Interest Rate (Annual %)
            </Label>
            <div className="relative">
              <Input
                id="dps-rate"
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
              />
              <Percent className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Term Duration */}
          <div className="grid gap-2">
            <Label htmlFor="dps-years" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Term Duration (Years)
            </Label>
            <Select value={String(years)} onValueChange={(v) => setYears(parseInt(v))}>
              <SelectTrigger id="dps-years">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 10].map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y} {y === 1 ? "Year" : "Years"} ({y * 12} Months)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tax Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-semibold">Tax Status</p>
                <p className="text-[11px] text-muted-foreground">
                  {isTinLinked ? "e-TIN Linked (10% Tax)" : "Standard (15% Tax)"}
                </p>
              </div>
            </div>
            <Switch
              id="dps-tax-toggle"
              checked={isTinLinked}
              onCheckedChange={setIsTinLinked}
            />
          </div>

          {/* Calculate Button */}
          <Button
            id="dps-calculate-btn"
            className="w-full h-12 text-base font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-lg shadow-sky-600/25 transition-all duration-300 hover:shadow-sky-600/40 hover:scale-[1.01]"
            onClick={handleCalculate}
          >
            <Calculator className="h-5 w-5 mr-2" />
            Calculate Maturity
          </Button>
        </CardContent>
      </Card>

      {/* ── Result Card ── */}
      {showResult && result && (
        <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 space-y-4">
          {/* Hero maturity amount */}
          <Card className="bg-gradient-to-br from-sky-500/10 via-sky-500/5 to-transparent border-sky-500/30 overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-400/5 via-transparent to-transparent pointer-events-none" />
            <CardContent className="pt-8 pb-8 text-center space-y-3 relative z-10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600/80">
                Total Maturity Amount
              </p>
              <p className="text-4xl md:text-5xl font-black text-sky-600 animate-in zoom-in-75 duration-500">
                {formatBDT(result.maturityAmount)}
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 text-xs font-bold">
                  <CalendarRange className="h-3 w-3" />
                  {result.totalMonths} months
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold">
                  <TrendingUp className="h-3 w-3" />
                  {((result.netInterest / result.totalPrincipalInjected) * 100).toFixed(2)}% Net Yield
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stat Grid */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-dashed shadow-none col-span-2">
              <CardContent className="pt-5 pb-5 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-violet-500/10 text-violet-600 shrink-0">
                  <Wallet className="h-4 w-4" />
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Principal Injected</p>
                  <p className="text-xl font-bold">{formatBDT(result.totalPrincipalInjected)}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatBDT(result.monthlyInstallment)} × {result.totalMonths} months
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-dashed shadow-none">
              <CardContent className="pt-5 pb-5 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 shrink-0">
                  <Coins className="h-4 w-4" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Gross Interest</p>
                  <p className="text-lg font-bold truncate">{formatBDT(result.grossInterest)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-dashed shadow-none">
              <CardContent className="pt-5 pb-5 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 shrink-0">
                  <ArrowDownRight className="h-4 w-4" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tax Deducted</p>
                  <p className="text-lg font-bold truncate text-rose-600">{formatBDT(result.taxDeducted)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-dashed shadow-none">
              <CardContent className="pt-5 pb-5 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Net Yield</p>
                  <p className="text-lg font-bold truncate text-emerald-600">{formatBDT(result.netInterest)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-dashed shadow-none">
              <CardContent className="pt-5 pb-5 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 shrink-0">
                  <Banknote className="h-4 w-4" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Maturity</p>
                  <p className="text-lg font-bold truncate">{formatBDT(result.maturityAmount)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Visual breakdown bar */}
          <Card className="overflow-hidden">
            <div className="p-4 border-b bg-muted/30 font-bold text-xs uppercase tracking-widest">
              Maturity Composition
            </div>
            <CardContent className="pt-5 pb-5 space-y-3">
              <div className="h-6 rounded-full overflow-hidden flex bg-muted/40">
                <div
                  className="bg-sky-500 transition-all duration-700 flex items-center justify-center"
                  style={{ width: `${(result.totalPrincipalInjected / result.maturityAmount) * 100}%` }}
                >
                  <span className="text-[9px] font-bold text-white mix-blend-difference">
                    {((result.totalPrincipalInjected / result.maturityAmount) * 100).toFixed(0)}%
                  </span>
                </div>
                <div
                  className="bg-emerald-500 transition-all duration-700 flex items-center justify-center"
                  style={{ width: `${(result.netInterest / result.maturityAmount) * 100}%` }}
                >
                  <span className="text-[9px] font-bold text-white mix-blend-difference">
                    {((result.netInterest / result.maturityAmount) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-6 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                  <span className="text-muted-foreground font-medium">Principal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-muted-foreground font-medium">Net Interest</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer note */}
          <div className="p-4 rounded-lg border bg-muted/30 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              DPS interest calculated using the arithmetic progression formula:{" "}
              <code className="px-1 py-0.5 rounded bg-muted font-mono text-[10px]">
                I = P × n(n+1)/2 × r/12
              </code>.
              Tax rate: <strong>{isTinLinked ? "10% (e-TIN)" : "15% (Standard)"}</strong> deducted from gross interest at maturity.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
