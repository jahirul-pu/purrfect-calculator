import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { InsightBox } from "@/components/InsightBox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Landmark,
  Percent,
  ShieldCheck,
  RefreshCcw,
  Calculator,
  TrendingUp,
  ArrowDownRight,
  Coins,
  Banknote,
  ChevronRight,
} from "lucide-react";
import { calculateFDR, type FDRResult } from "@/lib/fdrDpsCalc";
import { getFDRInsight } from "@/lib/insights";

function formatBDT(amount: number): string {
  return `৳ ${amount.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function FDRCalculator() {
  const [depositAmount, setDepositAmount] = useState<number>(100000);
  const [interestRate, setInterestRate] = useState<number>(9.5);
  const [termValue, setTermValue] = useState<number>(1);
  const [termUnit, setTermUnit] = useState<"months" | "years">("years");
  const [isTinLinked, setIsTinLinked] = useState<boolean>(false);
  const [autoRenew, setAutoRenew] = useState<boolean>(false);
  const [result, setResult] = useState<FDRResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const taxRate = isTinLinked ? 0.10 : 0.15;
  const termMonths = termUnit === "years" ? termValue * 12 : termValue;

  const handleCalculate = () => {
    const r = calculateFDR(depositAmount, interestRate, termMonths, taxRate, autoRenew);
    setResult(r);
    setShowResult(true);
  };

  const insight = useMemo(() => {
    if (!result) return null;
    return getFDRInsight(
      result.principal,
      result.maturityAmount,
      result.grossInterest,
      result.taxDeducted,
      autoRenew,
      termMonths
    );
  }, [result, autoRenew, termMonths]);

  return (
    <div className="space-y-6">
      {/* ── Input Card ── */}
      <Card className="border-emerald-500/20 shadow-lg shadow-emerald-500/5">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Landmark className="h-5 w-5 text-emerald-600" />
            </div>
            FDR Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Deposit Amount */}
          <div className="grid gap-2">
            <Label htmlFor="fdr-deposit" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Deposit Amount (BDT)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground font-bold text-sm">৳</span>
              <Input
                id="fdr-deposit"
                type="number"
                className="pl-8"
                value={depositAmount}
                onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Interest Rate Slider */}
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Interest Rate (Annual %)
              </Label>
              <span className="text-sm font-black tabular-nums text-emerald-600">
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
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Duration
                </Label>
                <span className="text-sm font-black tabular-nums text-emerald-600">
                  {termValue} {termUnit === "years" ? "yr" : "mo"}
                </span>
              </div>
              <Slider
                value={[termValue]}
                onValueChange={([v]) => setTermValue(v)}
                min={1}
                max={termUnit === "years" ? 10 : 120}
                step={1}
                className="w-full"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Unit</Label>
              <Select value={termUnit} onValueChange={(v) => setTermUnit(v as "months" | "years")}>
                <SelectTrigger id="fdr-term-unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="months">Months</SelectItem>
                  <SelectItem value="years">Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-4 pt-2">
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
              <Switch id="fdr-tax-toggle" checked={isTinLinked} onCheckedChange={setIsTinLinked} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-3">
                <RefreshCcw className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-semibold">Auto-Renew</p>
                  <p className="text-[11px] text-muted-foreground">
                    {autoRenew ? "Compound interest active" : "Single-term calculation"}
                  </p>
                </div>
              </div>
              <Switch id="fdr-renew-toggle" checked={autoRenew} onCheckedChange={setAutoRenew} />
            </div>
          </div>

          {/* Calculate Button */}
          <Button
            id="fdr-calculate-btn"
            className="w-full h-12 text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 transition-all duration-300 hover:shadow-emerald-600/40 hover:scale-[1.01]"
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
          {/* Hero maturity */}
          <Card className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/30 overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-400/5 via-transparent to-transparent pointer-events-none" />
            <CardContent className="pt-8 pb-8 text-center space-y-3 relative z-10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600/80">
                Total Maturity Amount
              </p>
              <p className="text-4xl md:text-5xl font-black text-emerald-600 animate-in zoom-in-75 duration-500 tabular-nums">
                {formatBDT(result.maturityAmount)}
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold">
                <TrendingUp className="h-3 w-3" />
                {((result.maturityAmount / result.principal - 1) * 100).toFixed(2)}% Return
              </div>
            </CardContent>
          </Card>

          {/* Stat Grid */}
          <div className="grid grid-cols-2 gap-3">
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
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Net Interest</p>
                  <p className="text-lg font-bold truncate text-emerald-600 tabular-nums">{formatBDT(result.netInterest)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-dashed shadow-none">
              <CardContent className="pt-5 pb-5 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-violet-500/10 text-violet-600 shrink-0">
                  <Banknote className="h-4 w-4" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Principal</p>
                  <p className="text-lg font-bold truncate tabular-nums">{formatBDT(result.principal)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Yearly Breakdown */}
          {result.yearlyBreakdown.length > 1 && (
            <Card className="overflow-hidden">
              <div className="p-4 border-b bg-muted/30 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                <ChevronRight className="h-4 w-4" /> Year-by-Year Breakdown
              </div>
              <div className="max-h-[320px] overflow-y-auto divide-y divide-border/50">
                {result.yearlyBreakdown.map((yr) => (
                  <div key={yr.year} className="p-4 hover:bg-muted/30 transition-colors grid grid-cols-12 items-center gap-2">
                    <div className="col-span-2">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-black">
                        {yr.year}
                      </span>
                    </div>
                    <div className="col-span-5 space-y-0.5">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                        Interest: {formatBDT(yr.grossInterest)}
                      </p>
                      <p className="text-[10px] text-rose-500 uppercase font-bold tracking-tighter">
                        Tax: -{formatBDT(yr.taxDeducted)}
                      </p>
                    </div>
                    <div className="col-span-5 text-right">
                      <p className="text-sm font-black tracking-tight tabular-nums">{formatBDT(yr.closingBalance)}</p>
                      <p className="text-[10px] text-muted-foreground">closing balance</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Insight */}
          {insight && <InsightBox insight={insight} />}

          {/* Footer */}
          <div className="p-4 rounded-lg border bg-muted/30 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tax rate applied: <strong>{isTinLinked ? "10% (e-TIN)" : "15% (Standard)"}</strong>.
              {autoRenew
                ? " Auto-renewal compounds net interest annually after tax deduction."
                : " Single-term FDR with flat interest calculation."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
