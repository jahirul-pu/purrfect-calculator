import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { InsightBox } from "@/components/InsightBox";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { RealityTranslatorPanel } from "@/components/RealityTranslatorPanel";
import { PowerLevelMilestoneCard } from "@/components/PowerLevelMilestone";
import { Banknote, Percent, Wallet, ReceiptText, PieChart as PieChartIcon, Telescope } from "lucide-react";
import { calculateLoan } from "@/lib/loanCalc";
import { getLoanInsight } from "@/lib/insights";
import { formatCurrency, currencies, convertCurrency } from "@/lib/currency";
import { translateFinancialAmount } from "@/lib/realityTranslator";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Generate amortization schedule for chart
function generateAmortizationData(
  amount: number,
  rate: number,
  totalMonths: number
) {
  if (totalMonths <= 0 || amount <= 0) return [];

  const monthlyRate = rate / 100 / 12;
  let balance = amount;
  let totalPaid = 0;
  let totalInterestPaid = 0;

  const monthlyPayment =
    monthlyRate === 0
      ? amount / totalMonths
      : (amount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);

  const data: { month: string; Balance: number; Paid: number; Interest: number }[] = [];

  // Sample every N months to keep chart readable
  const step = Math.max(1, Math.floor(totalMonths / 30));

  for (let m = 1; m <= totalMonths; m++) {
    const interestCharge = balance * monthlyRate;
    const principalCharge = monthlyPayment - interestCharge;
    balance = Math.max(0, balance - principalCharge);
    totalPaid += monthlyPayment;
    totalInterestPaid += interestCharge;

    if (m % step === 0 || m === totalMonths) {
      const label = m >= 12 ? `${(m / 12).toFixed(1)}y` : `${m}m`;
      data.push({
        month: label,
        Balance: Math.round(balance),
        Paid: Math.round(totalPaid),
        Interest: Math.round(totalInterestPaid),
      });
    }
  }
  return data;
}

export function LoanCalculator({ currency }: { currency: string }) {
  const activeCurrency =
    currencies.find((c) => c.code === currency) || currencies[0];
  const symbol = activeCurrency.code === "BDT" ? "BDT" : activeCurrency.symbol;

  const [amount, setAmount] = useState<number>(0);
  const [rate, setRate] = useState<number>(8);
  const [years, setYears] = useState<number>(5);
  const [months, setMonths] = useState<number>(0);
  const [showReality, setShowReality] = useState(false);

  const totalMonths = years * 12 + months;
  const result = useMemo(
    () => calculateLoan(amount, rate, years, months),
    [amount, rate, years, months]
  );

  const insight = useMemo(
    () => getLoanInsight(amount, result.totalInterest, result.monthlyPayment, totalMonths),
    [amount, result, totalMonths]
  );

  const chartData = useMemo(
    () => generateAmortizationData(amount, rate, totalMonths),
    [amount, rate, totalMonths]
  );

  // Convert interest to USD for reality translator
  const interestInUSD = useMemo(
    () => convertCurrency(result.totalInterest, currency, "USD"),
    [result.totalInterest, currency]
  );

  const yearlyInterestInUSD = useMemo(
    () => years > 0 ? interestInUSD / years : 0,
    [interestInUSD, years]
  );

  const interestComparisons = useMemo(
    () => translateFinancialAmount(yearlyInterestInUSD),
    [yearlyInterestInUSD]
  );

  const totalInterestComparisons = useMemo(
    () => translateFinancialAmount(interestInUSD),
    [interestInUSD]
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Loan Calculator</h1>
        <p className="text-muted-foreground font-medium">
          Calculate monthly payments and total interest costs.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wallet className="h-4 w-4" /> Loan Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Amount */}
              <div className="grid gap-2">
                <Label
                  htmlFor="amount"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Loan Amount (Principal)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground font-bold">
                    {symbol}
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    className="pl-12"
                    value={amount}
                    onChange={(e) =>
                      setAmount(parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
              </div>

              {/* Rate Slider */}
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Interest Rate (%)
                  </Label>
                  <span className="text-sm font-black tabular-nums text-primary">
                    {rate}%
                  </span>
                </div>
                <Slider
                  value={[rate]}
                  onValueChange={([v]) => setRate(v)}
                  min={0.5}
                  max={30}
                  step={0.25}
                  className="w-full"
                />
              </div>

              {/* Duration Slider */}
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Years
                  </Label>
                  <span className="text-sm font-black tabular-nums text-primary">
                    {years} yrs
                  </span>
                </div>
                <Slider
                  value={[years]}
                  onValueChange={([v]) => setYears(v)}
                  min={0}
                  max={30}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="grid gap-2">
                <Label
                  htmlFor="months"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Extra Months
                </Label>
                <Input
                  id="months"
                  type="number"
                  value={months}
                  onChange={(e) =>
                    setMonths(parseInt(e.target.value) || 0)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-7 space-y-6">
          {/* Hero Payment */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-8 pb-8 text-center space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  Estimated Monthly Payment
                </p>
                <p className="text-5xl font-black tabular-nums">
                  <AnimatedNumber
                    value={result.monthlyPayment}
                    prefix={symbol + " "}
                    decimals={2}
                    duration={600}
                  />
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Stat Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-dashed shadow-none">
              <CardContent className="pt-6 flex items-start gap-4">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                  <ReceiptText className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Total Payment
                  </p>
                  <p className="text-xl font-bold tabular-nums">
                    <AnimatedNumber
                      value={result.totalPayment}
                      prefix={symbol + " "}
                      decimals={2}
                      duration={700}
                    />
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-dashed shadow-none">
              <CardContent className="pt-6 flex items-start gap-4">
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600">
                  <PieChartIcon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Total Interest
                  </p>
                  <p className="text-xl font-bold tabular-nums">
                    <AnimatedNumber
                      value={result.totalInterest}
                      prefix={symbol + " "}
                      decimals={2}
                      duration={700}
                    />
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reality Translator Toggle */}
          {result.totalInterest > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 fun-units-toggle">
                <div className="flex items-center gap-2">
                  <Telescope className="h-4 w-4 text-violet-600" />
                  <Label htmlFor="reality-toggle-loan" className="text-xs font-bold cursor-pointer">
                    Reality Translator
                  </Label>
                </div>
                <Switch
                  id="reality-toggle-loan"
                  checked={showReality}
                  onCheckedChange={setShowReality}
                />
              </div>

              {showReality && (
                <div className="space-y-3">
                  {interestComparisons.length > 0 && (
                    <RealityTranslatorPanel
                      comparisons={interestComparisons}
                      title="Yearly Interest Could Buy..."
                    />
                  )}
                  {totalInterestComparisons.length > 0 && (
                    <RealityTranslatorPanel
                      comparisons={totalInterestComparisons}
                      title="Total Interest Could Buy..."
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Power Level Milestone */}
          <PowerLevelMilestoneCard amount={result.totalPayment} />

          {/* Amortization Chart */}
          {chartData.length > 0 && (
            <Card className="overflow-hidden">
              <div className="p-4 border-b bg-muted/30 font-bold text-xs uppercase tracking-widest">
                Amortization Curve
              </div>
              <CardContent className="pt-6 pb-4">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="loanBalGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="loanPaidGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 700 }} stroke="hsl(220, 9%, 46%)" />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      stroke="hsl(220, 9%, 46%)"
                      tickFormatter={(v: number) => {
                        if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
                        if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
                        return String(v);
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(220, 13%, 91%)",
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 600,
                        boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                      }}
                      formatter={(value: number) => [formatCurrency(value, currency)]}
                    />
                    <Area
                      type="monotone"
                      dataKey="Balance"
                      stroke="hsl(0, 72%, 51%)"
                      strokeWidth={2}
                      fill="url(#loanBalGrad)"
                      animationDuration={1200}
                    />
                    <Area
                      type="monotone"
                      dataKey="Paid"
                      stroke="hsl(142, 71%, 45%)"
                      strokeWidth={2}
                      fill="url(#loanPaidGrad)"
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-6 mt-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-[hsl(0,72%,51%)]" />
                    <span className="text-muted-foreground font-medium">
                      Remaining Balance
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-[hsl(142,71%,45%)]" />
                    <span className="text-muted-foreground font-medium">
                      Total Paid
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Insight */}
          <InsightBox insight={insight} />

          <div className="p-4 rounded-lg border bg-muted/30 flex items-start gap-3">
            <Banknote className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              This calculator uses the standard EMI formula. Actual
              lender rates and fees may vary.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
