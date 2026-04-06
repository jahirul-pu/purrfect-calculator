import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Slider } from "@/components/ui/slider";
import { InsightBox } from "@/components/InsightBox";
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
import { getDPSInsight } from "@/lib/insights";

function formatBDT(amount: number): string {
  return `৳ ${amount.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

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

  const insight = useMemo(() => {
    if (!result) return null;
    return getDPSInsight(
      result.totalPrincipalInjected,
      result.netInterest,
      result.maturityAmount,
      result.monthlyInstallment,
      years
    );
  }, [result, years]);

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
          {/* Monthly Installment Slider */}
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Monthly Installment (BDT)
              </Label>
              <span className="text-sm font-black tabular-nums text-sky-600">
                {formatBDT(monthlyInstallment)}
              </span>
            </div>
            <Slider
              value={[monthlyInstallment]}
              onValueChange={([v]) => setMonthlyInstallment(v)}
              min={500}
              max={100000}
              step={500}
              className="w-full"
            />
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

          {/* Interest Rate Slider */}
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Interest Rate (Annual %)
              </Label>
              <span className="text-sm font-black tabular-nums text-sky-600">
                {interestRate}%
              </span>
            </div>
            <Slider
              value={[interestRate]}
              onValueChange={([v]) => setInterestRate(v)}
              min={3}
              max={15}
              step={0.25}
              className="w-full"
            />
          </div>

          {/* Term Duration */}
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Term Duration (Years)
              </Label>
              <span className="text-sm font-black tabular-nums text-sky-600">
                {years} yrs ({years * 12} months)
              </span>
            </div>
            <Slider
              value={[years]}
              onValueChange={([v]) => setYears(v)}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
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
            <Toggle id="dps-tax-toggle" pressed={isTinLinked} onPressedChange={setIsTinLinked} aria-label="Toggle DPS tax status" />
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
              <p className="text-4xl md:text-5xl font-black text-sky-600 animate-in zoom-in-75 duration-500 tabular-nums">
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
                  <p className="text-xl font-bold tabular-nums">{formatBDT(result.totalPrincipalInjected)}</p>
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
                  <p className="text-lg font-bold truncate tabular-nums">{formatBDT(result.grossInterest)}</p>
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
                  <p className="text-lg font-bold truncate text-rose-600 tabular-nums">{formatBDT(result.taxDeducted)}</p>
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
                  <p className="text-lg font-bold truncate text-emerald-600 tabular-nums">{formatBDT(result.netInterest)}</p>
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
                  <p className="text-lg font-bold truncate tabular-nums">{formatBDT(result.maturityAmount)}</p>
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

          {/* Insight */}
          {insight && <InsightBox insight={insight} />}

          {/* Footer */}
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
