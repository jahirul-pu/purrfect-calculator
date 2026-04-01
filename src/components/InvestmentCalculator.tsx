import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { InsightBox } from "@/components/InsightBox";
import { TrendingUp, Wallet, ArrowUpRight, Percent } from "lucide-react";
import { calculateCompoundInterest } from "@/lib/investmentCalc";
import { getInvestmentInsight } from "@/lib/insights";
import { formatCurrency, currencies } from "@/lib/currency";
import { useCalculatorContext } from "@/context/CalculatorContext";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function InvestmentCalculator({ currency }: { currency: string }) {
  const [initialBalance, setInitialBalance] = useState<number>(0);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(0);
  const [annualRate, setAnnualRate] = useState<number>(8);
  const [years, setYears] = useState<number>(10);

  const ctx = useCalculatorContext();

  // Accept prefill from Vehicle savings bridge
  useEffect(() => {
    if (ctx.investPrefill) {
      if (ctx.investPrefill.initialBalance > 0) {
        setInitialBalance(ctx.investPrefill.initialBalance);
      }
      if (ctx.investPrefill.monthlyContribution > 0) {
        setMonthlyContribution(ctx.investPrefill.monthlyContribution);
      }
      setYears(10);
      ctx.clearInvestPrefill();
    }
  }, [ctx.investPrefill]);

  const results = useMemo(
    () => calculateCompoundInterest(initialBalance, monthlyContribution, annualRate, years),
    [initialBalance, monthlyContribution, annualRate, years]
  );

  const finale = results[results.length - 1] || {
    balance: 0,
    totalContribution: 0,
    totalInterest: 0,
  };

  const activeCurrency =
    currencies.find((c) => c.code === currency) || currencies[0];
  const symbol = activeCurrency.code === "BDT" ? "BDT" : activeCurrency.symbol;

  const insight = useMemo(
    () =>
      getInvestmentInsight(
        finale.totalContribution,
        finale.balance,
        years,
        monthlyContribution
      ),
    [finale, years, monthlyContribution]
  );

  // Chart data
  const chartData = useMemo(
    () =>
      results.map((r) => ({
        year: `Yr ${r.year}`,
        Balance: r.balance,
        Invested: r.totalContribution,
        Interest: r.totalInterest,
      })),
    [results]
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Investment & Growth
        </h1>
        <p className="text-muted-foreground font-medium">
          Project your wealth over time with compound interest.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" /> Strategy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Initial Investment */}
              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Initial Investment ({symbol})
                </Label>
                <Input
                  type="number"
                  value={initialBalance}
                  onChange={(e) =>
                    setInitialBalance(Number(e.target.value))
                  }
                />
              </div>

              {/* Monthly Contribution with Slider */}
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Monthly Contribution ({symbol})
                  </Label>
                  <span className="text-sm font-black tabular-nums text-primary">
                    {formatCurrency(monthlyContribution, currency)}
                  </span>
                </div>
                <Slider
                  value={[monthlyContribution]}
                  onValueChange={([v]) => setMonthlyContribution(v)}
                  min={0}
                  max={100000}
                  step={500}
                  className="w-full"
                />
                <Input
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) =>
                    setMonthlyContribution(Number(e.target.value))
                  }
                  className="h-8 text-xs"
                />
              </div>

              {/* Interest Rate Slider */}
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Expected Return (%)
                  </Label>
                  <span className="text-sm font-black tabular-nums text-primary">
                    {annualRate}%
                  </span>
                </div>
                <Slider
                  value={[annualRate]}
                  onValueChange={([v]) => setAnnualRate(v)}
                  min={1}
                  max={30}
                  step={0.5}
                  className="w-full"
                />
              </div>

              {/* Duration Slider */}
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Duration (Years)
                  </Label>
                  <span className="text-sm font-black tabular-nums text-primary">
                    {years} yrs
                  </span>
                </div>
                <Slider
                  value={[years]}
                  onValueChange={([v]) => setYears(v)}
                  min={1}
                  max={40}
                  step={1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Hero Balance */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground text-center">
                Final Estimated Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-2 pb-8">
              <p className="text-5xl font-black text-primary animate-in zoom-in-50 duration-500 tabular-nums">
                {formatCurrency(finale.balance, currency)}
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold">
                <TrendingUp className="h-3 w-3" />
                {finale.totalContribution > 0
                  ? (
                      (finale.balance / finale.totalContribution - 1) *
                      100
                    ).toFixed(1)
                  : 0}
                % Total Growth
              </div>
            </CardContent>
          </Card>

          {/* Insight */}
          <InsightBox insight={insight} />
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Total Invested
                </p>
                <p className="text-2xl font-bold tabular-nums">
                  {formatCurrency(finale.totalContribution, currency)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Total Interest
                </p>
                <p className="text-2xl font-bold text-emerald-600 tabular-nums">
                  {formatCurrency(finale.totalInterest, currency)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Interactive Area Chart */}
          {chartData.length > 0 && (
            <Card className="overflow-hidden">
              <div className="p-4 border-b bg-muted/30 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4" /> Growth Trajectory
              </div>
              <CardContent className="pt-6 pb-4">
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="balanceGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="hsl(142, 71%, 45%)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(142, 71%, 45%)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="investedGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="hsl(215, 70%, 55%)"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(215, 70%, 55%)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(220, 13%, 91%)"
                    />
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 10, fontWeight: 700 }}
                      stroke="hsl(220, 9%, 46%)"
                    />
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
                      formatter={(value: number) => [
                        formatCurrency(value, currency),
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="Invested"
                      stroke="hsl(215, 70%, 55%)"
                      strokeWidth={2}
                      fill="url(#investedGrad)"
                      animationDuration={1200}
                    />
                    <Area
                      type="monotone"
                      dataKey="Balance"
                      stroke="hsl(142, 71%, 45%)"
                      strokeWidth={2.5}
                      fill="url(#balanceGrad)"
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-6 mt-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-[hsl(142,71%,45%)]" />
                    <span className="text-muted-foreground font-medium">
                      Balance
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-[hsl(215,70%,55%)]" />
                    <span className="text-muted-foreground font-medium">
                      Invested
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Year-by-year scroll list */}
          <Card className="overflow-hidden">
            <div className="p-4 border-b bg-muted/30 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4" /> Year-by-Year
            </div>
            <div className="max-h-[280px] overflow-y-auto overflow-x-hidden divide-y divide-border/50">
              {results.map((res) => (
                <div
                  key={res.year}
                  className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold">Year {res.year}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                      Invested: {formatCurrency(res.totalContribution, currency)}
                    </p>
                  </div>
                  <p className="text-lg font-black tracking-tight tabular-nums">
                    {formatCurrency(res.balance, currency)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
