import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Percent, ArrowUpDown, PieChart, Calculator, DollarSign, Info, Sparkles, Split } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Calculation helpers ──────────────────────────────────────────────

function basicPercent(percent: number, of: number) {
  if (!percent || !of) return { result: 0, formula: "—" };
  const result = (percent / 100) * of;
  return {
    result: parseFloat(result.toFixed(4)),
    formula: `${percent}% × ${of} = ${result.toFixed(4)}`,
  };
}

function percentChange(oldVal: number, newVal: number) {
  if (!oldVal) return { result: 0, direction: "none" as const, formula: "—" };
  const change = ((newVal - oldVal) / Math.abs(oldVal)) * 100;
  return {
    result: parseFloat(change.toFixed(2)),
    direction: change > 0 ? ("increase" as const) : change < 0 ? ("decrease" as const) : ("none" as const),
    formula: `((${newVal} − ${oldVal}) / |${oldVal}|) × 100 = ${change.toFixed(2)}%`,
  };
}

function percentOfTotal(part: number, whole: number) {
  if (!whole) return { result: 0, formula: "—" };
  const result = (part / whole) * 100;
  return {
    result: parseFloat(result.toFixed(2)),
    formula: `(${part} / ${whole}) × 100 = ${result.toFixed(2)}%`,
  };
}

function findWhole(part: number, percent: number) {
  if (!percent) return { result: 0, formula: "—" };
  const whole = (part / percent) * 100;
  return {
    result: parseFloat(whole.toFixed(4)),
    formula: `(${part} / ${percent}) × 100 = ${whole.toFixed(4)}`,
  };
}

function tipCalc(billAmount: number, tipPercent: number, splitWays: number) {
  const tip = (tipPercent / 100) * billAmount;
  const total = billAmount + tip;
  const perPerson = splitWays > 0 ? total / splitWays : total;
  return { tip, total, perPerson };
}

// ── Compact number formatter ────────────────────────────────────────
function compactNum(n: number): string {
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 100_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

function proportionalSplit(
  inputMode: "total" | "portion" | "custom",
  values: { total: number; portionVal: number; customA: number; customB: number },
  splitA: number,
  subPercent: number
) {
  let totalValue: number;
  let portionA: number;
  let portionB: number;
  let derivedSplitA: number;
  let derivedSplitB: number;

  if (inputMode === "total") {
    totalValue = values.total;
    derivedSplitA = splitA;
    derivedSplitB = 100 - splitA;
    portionA = (splitA / 100) * totalValue;
    portionB = (derivedSplitB / 100) * totalValue;
  } else if (inputMode === "portion") {
    portionA = values.portionVal;
    derivedSplitA = splitA;
    derivedSplitB = 100 - splitA;
    totalValue = splitA > 0 ? (portionA / splitA) * 100 : 0;
    portionB = totalValue - portionA;
  } else {
    portionA = values.customA;
    portionB = values.customB;
    totalValue = portionA + portionB;
    derivedSplitA = totalValue > 0 ? parseFloat(((portionA / totalValue) * 100).toFixed(2)) : 0;
    derivedSplitB = totalValue > 0 ? parseFloat(((portionB / totalValue) * 100).toFixed(2)) : 0;
  }

  const subResult = (subPercent / 100) * portionA;
  const subOfOriginal = totalValue > 0 ? (subResult / totalValue) * 100 : 0;

  return {
    splitA: derivedSplitA,
    splitB: derivedSplitB,
    totalValue: parseFloat(totalValue.toFixed(2)),
    portionA: parseFloat(portionA.toFixed(2)),
    portionB: parseFloat(portionB.toFixed(2)),
    subResult: parseFloat(subResult.toFixed(2)),
    subPercent: parseFloat(subPercent.toFixed(4)),
    subOfOriginal: parseFloat(subOfOriginal.toFixed(2)),
    formula: portionA
      ? `${subPercent.toFixed(2)}% of Portion A (${portionA.toLocaleString()}) = ${subResult.toLocaleString()}`
      : "—",
    globalFormula: totalValue
      ? `${subResult.toLocaleString()} is ${subOfOriginal.toFixed(2)}% of the total ${totalValue.toLocaleString()}`
      : "—",
  };
}

// ── Quick preset badges ─────────────────────────────────────────────

function QuickBadge({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-200",
        "border hover:scale-105 active:scale-95",
        active
          ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/25"
          : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
      )}
    >
      {label}
    </button>
  );
}

// ── Animated result display ─────────────────────────────────────────

function ResultDisplay({
  value,
  suffix = "",
  prefix = "",
  label,
  color = "primary",
  size = "lg",
}: {
  value: string | number;
  suffix?: string;
  prefix?: string;
  label: string;
  color?: "primary" | "emerald" | "amber" | "rose" | "blue";
  size?: "lg" | "xl";
}) {
  const colorMap = {
    primary: "text-primary",
    emerald: "text-emerald-500",
    amber: "text-amber-500",
    rose: "text-rose-500",
    blue: "text-blue-500",
  };
  return (
    <div className="text-center space-y-1">
      <p
        className={cn(
          "font-black tabular-nums transition-all duration-300",
          colorMap[color],
          size === "xl" ? "text-6xl" : "text-4xl"
        )}
      >
        {prefix}
        {value}
        {suffix}
      </p>
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  );
}

// ── MAIN COMPONENT ──────────────────────────────────────────────────

export function PercentageCalculator() {
  const [mode, setMode] = useState("basic");

  // Basic
  const [bPercent, setBPercent] = useState(0);
  const [bOf, setBOf] = useState(0);

  // Change
  const [cOld, setCOld] = useState(0);
  const [cNew, setCNew] = useState(0);

  // Of total
  const [tPart, setTPart] = useState(0);
  const [tWhole, setTWhole] = useState(0);

  // Find whole
  const [fPart, setFPart] = useState(0);
  const [fPercent, setFPercent] = useState(0);

  // Tip
  const [tipBill, setTipBill] = useState(0);
  const [tipPct, setTipPct] = useState(15);
  const [tipSplit, setTipSplit] = useState(1);

  // Split
  const [splitInputMode, setSplitInputMode] = useState<"total" | "portion" | "custom">("custom");
  const [sTotal, setSTotal] = useState(0);
  const [sPortionVal, setSPortionVal] = useState(0);
  const [sCustomA, setSCustomA] = useState(0);
  const [sCustomB, setSCustomB] = useState(0);
  const [sSplitA, setSSplitA] = useState(40);
  const [sSubMode, setSSubMode] = useState<"percent" | "value">("percent");
  const [sSubPct, setSSubPct] = useState(20);
  const [sSubVal, setSSubVal] = useState(0);

  const basicResult = useMemo(() => basicPercent(bPercent, bOf), [bPercent, bOf]);
  const changeResult = useMemo(() => percentChange(cOld, cNew), [cOld, cNew]);
  const totalResult = useMemo(() => percentOfTotal(tPart, tWhole), [tPart, tWhole]);
  const wholeResult = useMemo(() => findWhole(fPart, fPercent), [fPart, fPercent]);
  const tipResult = useMemo(() => tipCalc(tipBill, tipPct, tipSplit), [tipBill, tipPct, tipSplit]);

  // Compute effective sub-percent: either direct % or derived from value
  const effectiveSubPct = useMemo(() => {
    if (sSubMode === "percent") return sSubPct;
    // derive % from entered value and portionA
    // we need portionA first — quick compute
    let portionA = 0;
    if (splitInputMode === "total") portionA = (sSplitA / 100) * sTotal;
    else if (splitInputMode === "portion") portionA = sPortionVal;
    else portionA = sCustomA;
    return portionA > 0 ? (sSubVal / portionA) * 100 : 0;
  }, [sSubMode, sSubPct, sSubVal, splitInputMode, sTotal, sPortionVal, sCustomA, sSplitA]);

  const splitResult = useMemo(
    () => proportionalSplit(
      splitInputMode,
      { total: sTotal, portionVal: sPortionVal, customA: sCustomA, customB: sCustomB },
      sSplitA,
      effectiveSubPct
    ),
    [splitInputMode, sTotal, sPortionVal, sCustomA, sCustomB, sSplitA, effectiveSubPct]
  );

  // Effective split % for display
  const effectiveSplitA = splitInputMode === "custom" ? splitResult.splitA : sSplitA;
  const effectiveSplitB = splitInputMode === "custom" ? splitResult.splitB : (100 - sSplitA);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Percentage Calculator</h1>
        <p className="text-muted-foreground font-medium">
          Six powerful modes for every percentage scenario.
        </p>
      </div>

      {/* Mode selector */}
      <Tabs value={mode} onValueChange={setMode} className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 h-auto">
          <TabsTrigger value="basic" className="flex items-center gap-1.5 py-2.5 text-xs sm:text-sm">
            <Percent className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline font-bold">Basic</span>
          </TabsTrigger>
          <TabsTrigger value="change" className="flex items-center gap-1.5 py-2.5 text-xs sm:text-sm">
            <ArrowUpDown className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline font-bold">Change</span>
          </TabsTrigger>
          <TabsTrigger value="oftotal" className="flex items-center gap-1.5 py-2.5 text-xs sm:text-sm">
            <PieChart className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline font-bold">Of Total</span>
          </TabsTrigger>
          <TabsTrigger value="findwhole" className="flex items-center gap-1.5 py-2.5 text-xs sm:text-sm">
            <Calculator className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline font-bold">Whole</span>
          </TabsTrigger>
          <TabsTrigger value="split" className="flex items-center gap-1.5 py-2.5 text-xs sm:text-sm">
            <Split className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline font-bold">Split</span>
          </TabsTrigger>
          <TabsTrigger value="tip" className="flex items-center gap-1.5 py-2.5 text-xs sm:text-sm">
            <DollarSign className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline font-bold">Tip</span>
          </TabsTrigger>
        </TabsList>

        {/* ── BASIC ────────────────────────────────────────────── */}
        <TabsContent value="basic" className="mt-6">
          <div className="grid gap-6 md:grid-cols-12">
            <div className="md:col-span-5">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Percent className="h-4 w-4" /> What is X% of Y?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex flex-wrap gap-2">
                    {[5, 10, 15, 20, 25, 50, 75].map((v) => (
                      <QuickBadge key={v} label={`${v}%`} active={bPercent === v} onClick={() => setBPercent(v)} />
                    ))}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="b-percent" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Percentage (%)
                    </Label>
                    <Input
                      id="b-percent"
                      type="number"
                      value={bPercent || ""}
                      placeholder="e.g. 25"
                      onChange={(e) => setBPercent(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="b-of" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Of Value
                    </Label>
                    <Input
                      id="b-of"
                      type="number"
                      value={bOf || ""}
                      placeholder="e.g. 200"
                      onChange={(e) => setBOf(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-7 space-y-4">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-8 pb-8 space-y-4">
                  <ResultDisplay value={basicResult.result} label="Result" size="xl" />
                  {bOf > 0 && (
                    <div className="space-y-2 max-w-xs mx-auto">
                      <Progress value={Math.min(bPercent, 100)} className="h-3" />
                      <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
                        <span>0%</span>
                        <span>{bPercent}%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="border-dashed shadow-none">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4 text-primary shrink-0" />
                    <code className="font-mono text-xs bg-muted px-2 py-1 rounded">{basicResult.formula}</code>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── PERCENTAGE CHANGE ────────────────────────────────── */}
        <TabsContent value="change" className="mt-6">
          <div className="grid gap-6 md:grid-cols-12">
            <div className="md:col-span-5">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4" /> Percent Change
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-2">
                    <Label htmlFor="c-old" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Old Value
                    </Label>
                    <Input
                      id="c-old"
                      type="number"
                      value={cOld || ""}
                      placeholder="e.g. 80"
                      onChange={(e) => setCOld(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="c-new" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      New Value
                    </Label>
                    <Input
                      id="c-new"
                      type="number"
                      value={cNew || ""}
                      placeholder="e.g. 100"
                      onChange={(e) => setCNew(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-7 space-y-4">
              <Card
                className={cn(
                  "border",
                  changeResult.direction === "increase"
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : changeResult.direction === "decrease"
                    ? "bg-rose-500/5 border-rose-500/20"
                    : "bg-primary/5 border-primary/20"
                )}
              >
                <CardContent className="pt-8 pb-8 space-y-4">
                  <ResultDisplay
                    value={Math.abs(changeResult.result)}
                    suffix="%"
                    label={
                      changeResult.direction === "increase"
                        ? "Increase"
                        : changeResult.direction === "decrease"
                        ? "Decrease"
                        : "Percent Change"
                    }
                    color={
                      changeResult.direction === "increase"
                        ? "emerald"
                        : changeResult.direction === "decrease"
                        ? "rose"
                        : "primary"
                    }
                    size="xl"
                  />
                  {changeResult.direction !== "none" && (
                    <div
                      className={cn(
                        "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mx-auto",
                        changeResult.direction === "increase"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-rose-500/10 text-rose-500"
                      )}
                      style={{ display: "flex", justifyContent: "center" }}
                    >
                      <ArrowUpDown className="h-4 w-4" />
                      {changeResult.direction === "increase" ? "▲" : "▼"} {Math.abs(cNew - cOld)} difference
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="border-dashed shadow-none">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4 text-primary shrink-0" />
                    <code className="font-mono text-xs bg-muted px-2 py-1 rounded">{changeResult.formula}</code>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── PERCENT OF TOTAL ─────────────────────────────────── */}
        <TabsContent value="oftotal" className="mt-6">
          <div className="grid gap-6 md:grid-cols-12">
            <div className="md:col-span-5">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PieChart className="h-4 w-4" /> Part is what % of Whole?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-2">
                    <Label htmlFor="t-part" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Part
                    </Label>
                    <Input
                      id="t-part"
                      type="number"
                      value={tPart || ""}
                      placeholder="e.g. 30"
                      onChange={(e) => setTPart(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="t-whole" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Whole
                    </Label>
                    <Input
                      id="t-whole"
                      type="number"
                      value={tWhole || ""}
                      placeholder="e.g. 150"
                      onChange={(e) => setTWhole(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-7 space-y-4">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-8 pb-8 space-y-5">
                  <ResultDisplay value={totalResult.result} suffix="%" label="Of The Total" size="xl" />
                  {tWhole > 0 && (
                    <div className="max-w-sm mx-auto space-y-3">
                      {/* Visual pie representation */}
                      <div className="relative h-6 w-full rounded-full overflow-hidden bg-muted">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500 ease-out"
                          style={{ width: `${Math.min(totalResult.result, 100)}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black">
                          {totalResult.result}%
                        </div>
                      </div>
                      <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
                        <span>Part: {tPart}</span>
                        <span>Remaining: {Math.max(tWhole - tPart, 0)}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="border-dashed shadow-none">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4 text-primary shrink-0" />
                    <code className="font-mono text-xs bg-muted px-2 py-1 rounded">{totalResult.formula}</code>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── FIND THE WHOLE ───────────────────────────────────── */}
        <TabsContent value="findwhole" className="mt-6">
          <div className="grid gap-6 md:grid-cols-12">
            <div className="md:col-span-5">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calculator className="h-4 w-4" /> Find the Whole
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-2">
                    <Label htmlFor="f-part" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Part (Value)
                    </Label>
                    <Input
                      id="f-part"
                      type="number"
                      value={fPart || ""}
                      placeholder="e.g. 50"
                      onChange={(e) => setFPart(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="f-percent" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Is what percent (%)
                    </Label>
                    <Input
                      id="f-percent"
                      type="number"
                      value={fPercent || ""}
                      placeholder="e.g. 20"
                      onChange={(e) => setFPercent(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border text-xs text-muted-foreground leading-relaxed">
                    <strong>Example:</strong> If 50 is 20% of something, the whole is 250.
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-7 space-y-4">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-8 pb-8 space-y-4">
                  <ResultDisplay value={wholeResult.result} label="The Whole Number" size="xl" />
                  {fPercent > 0 && wholeResult.result > 0 && (
                    <div className="max-w-xs mx-auto">
                      <Progress value={Math.min(fPercent, 100)} className="h-3" />
                      <div className="flex justify-between text-[10px] font-medium text-muted-foreground mt-1">
                        <span>{fPart} is the part</span>
                        <span>{fPercent}% of {wholeResult.result}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="border-dashed shadow-none">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4 text-primary shrink-0" />
                    <code className="font-mono text-xs bg-muted px-2 py-1 rounded">{wholeResult.formula}</code>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── PROPORTIONAL SPLIT ─────────────────────────────── */}
        <TabsContent value="split" className="mt-6">
          <div className="grid gap-6 md:grid-cols-12">
            <div className="md:col-span-5">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Split className="h-4 w-4" /> Proportional Split
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Input mode toggle */}
                  <Tabs value={splitInputMode} onValueChange={(v: any) => setSplitInputMode(v)}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="custom" className="text-xs sm:text-sm">Custom Values</TabsTrigger>
                      <TabsTrigger value="total" className="text-xs sm:text-sm">By Total</TabsTrigger>
                      <TabsTrigger value="portion" className="text-xs sm:text-sm">By Portion</TabsTrigger>
                    </TabsList>

                    <TabsContent value="custom" className="pt-4 space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="s-custom-a" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Portion A Value
                        </Label>
                        <Input
                          id="s-custom-a"
                          type="number"
                          value={sCustomA || ""}
                          placeholder="e.g. 200000"
                          onChange={(e) => setSCustomA(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="s-custom-b" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Portion B Value
                        </Label>
                        <Input
                          id="s-custom-b"
                          type="number"
                          value={sCustomB || ""}
                          placeholder="e.g. 300000"
                          onChange={(e) => setSCustomB(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      {sCustomA + sCustomB > 0 && (
                        <div className="p-3 rounded-lg bg-muted/50 border text-xs text-muted-foreground space-y-1">
                          <p>Total: <strong>{(sCustomA + sCustomB).toLocaleString()}</strong></p>
                          <p>Split: <strong>{splitResult.splitA}%</strong> / <strong>{splitResult.splitB}%</strong></p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="total" className="pt-4">
                      <div className="grid gap-2">
                        <Label htmlFor="s-total" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Total Amount
                        </Label>
                        <Input
                          id="s-total"
                          type="number"
                          value={sTotal || ""}
                          placeholder="e.g. 500000"
                          onChange={(e) => setSTotal(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="portion" className="pt-4">
                      <div className="grid gap-2">
                        <Label htmlFor="s-portion-val" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Portion Value
                        </Label>
                        <Input
                          id="s-portion-val"
                          type="number"
                          value={sPortionVal || ""}
                          placeholder="e.g. 200000"
                          onChange={(e) => setSPortionVal(parseFloat(e.target.value) || 0)}
                        />
                        <p className="text-[10px] text-muted-foreground">
                          This value represents the <strong>{sSplitA}%</strong> portion below.
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Split ratio — only for total & portion modes */}
                  {splitInputMode !== "custom" && (
                    <div className="grid gap-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Split Ratio
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {[[20,80],[25,75],[30,70],[40,60],[50,50],[60,40],[70,30]].map(([a,b]) => (
                          <QuickBadge
                            key={`${a}-${b}`}
                            label={`${a}/${b}`}
                            active={sSplitA === a}
                            onClick={() => setSSplitA(a)}
                          />
                        ))}
                      </div>
                      <Input
                        id="s-split-a"
                        type="number"
                        min={1}
                        max={99}
                        value={sSplitA || ""}
                        placeholder="Portion A %"
                        onChange={(e) => {
                          const v = parseFloat(e.target.value) || 0;
                          setSSplitA(Math.min(99, Math.max(1, v)));
                        }}
                      />
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-bold text-primary">{sSplitA}%</span>
                        <span>/</span>
                        <span className="font-bold text-amber-500">{100 - sSplitA}%</span>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Find within Portion A
                    </Label>
                    <div className="flex gap-1 mb-1">
                      <button
                        onClick={() => setSSubMode("percent")}
                        className={cn(
                          "flex-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                          sSubMode === "percent"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted"
                        )}
                      >
                        Enter %
                      </button>
                      <button
                        onClick={() => setSSubMode("value")}
                        className={cn(
                          "flex-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                          sSubMode === "value"
                            ? "bg-emerald-500 text-white shadow-sm"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted"
                        )}
                      >
                        Enter Amount
                      </button>
                    </div>
                    {sSubMode === "percent" ? (
                      <>
                        <div className="flex flex-wrap gap-2">
                          {[5, 10, 15, 20, 25, 50].map((v) => (
                            <QuickBadge key={v} label={`${v}%`} active={sSubPct === v} onClick={() => setSSubPct(v)} />
                          ))}
                        </div>
                        <Input
                          id="s-sub-pct"
                          type="number"
                          value={sSubPct || ""}
                          placeholder="e.g. 20"
                          onChange={(e) => setSSubPct(parseFloat(e.target.value) || 0)}
                        />
                      </>
                    ) : (
                      <>
                        <Input
                          id="s-sub-val"
                          type="number"
                          value={sSubVal || ""}
                          placeholder="e.g. 200000"
                          onChange={(e) => setSSubVal(parseFloat(e.target.value) || 0)}
                        />
                        {splitResult.portionA > 0 && sSubVal > 0 && (
                          <p className="text-[10px] text-muted-foreground">
                            {sSubVal.toLocaleString()} is <strong>{splitResult.subPercent.toFixed(2)}%</strong> of Portion A ({splitResult.portionA.toLocaleString()})
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-7 space-y-4">
              {/* Derived total (shown in portion mode) */}
              {splitInputMode === "portion" && sPortionVal > 0 && (
                <Card className="bg-amber-500/5 border-amber-500/20">
                  <CardContent className="pt-5 pb-5 text-center space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Derived Total (100%)</p>
                    <p className="text-3xl font-black text-amber-500 tabular-nums">
                      {splitResult.totalValue.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      If {sPortionVal.toLocaleString()} is {sSplitA}%, then the full total is {splitResult.totalValue.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Visual split bar */}
              <Card className="border-dashed shadow-none">
                <CardContent className="pt-6 pb-6 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Split Visualization</p>
                  <div className="relative h-12 w-full rounded-lg overflow-hidden flex">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/70 flex flex-col items-center justify-center transition-all duration-500"
                      style={{ width: `${Math.max(effectiveSplitA, 5)}%` }}
                    >
                      <span className="text-[11px] font-black text-primary-foreground">{effectiveSplitA}%</span>
                      {splitResult.portionA > 0 && (
                        <span className="text-[10px] font-bold text-primary-foreground/80">{splitResult.portionA.toLocaleString()}</span>
                      )}
                    </div>
                    <div
                      className="h-full bg-gradient-to-r from-amber-500/80 to-amber-500/50 flex flex-col items-center justify-center transition-all duration-500"
                      style={{ width: `${Math.max(effectiveSplitB, 5)}%` }}
                    >
                      <span className="text-[11px] font-black text-white">{effectiveSplitB}%</span>
                      {splitResult.portionB > 0 && (
                        <span className="text-[10px] font-bold text-white/80">{splitResult.portionB.toLocaleString()}</span>
                      )}
                    </div>
                  </div>

                  {/* Sub-percentage indicator within portion A */}
                  <div className="relative">
                    <div
                      className="relative h-7 rounded-md overflow-hidden bg-primary/10 transition-all duration-500"
                      style={{ width: `${Math.max(effectiveSplitA, 10)}%` }}
                    >
                      <div
                        className="absolute inset-y-0 left-0 rounded-md bg-emerald-500/60 transition-all duration-500"
                        style={{ width: `${Math.min(splitResult.subPercent, 100)}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black">
                        {splitResult.subPercent.toFixed(1)}% → {splitResult.subResult > 0 ? splitResult.subResult.toLocaleString() : "—"}
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">↑ {splitResult.subPercent.toFixed(2)}% of Portion A (treating Portion A as 100%)</p>
                  </div>
                </CardContent>
              </Card>

              {/* Results */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6 pb-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div className="space-y-1 overflow-hidden">
                      <p className="text-lg sm:text-xl font-black text-muted-foreground tabular-nums truncate" title={splitResult.totalValue > 0 ? splitResult.totalValue.toLocaleString() : undefined}>
                        {splitResult.totalValue > 0 ? compactNum(splitResult.totalValue) : "—"}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Total
                      </p>
                    </div>
                    <div className="space-y-1 overflow-hidden">
                      <p className="text-lg sm:text-xl font-black text-primary tabular-nums truncate" title={splitResult.portionA > 0 ? splitResult.portionA.toLocaleString() : undefined}>
                        {splitResult.portionA > 0 ? compactNum(splitResult.portionA) : "—"}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        A ({effectiveSplitA}%)
                      </p>
                    </div>
                    <div className="space-y-1 overflow-hidden">
                      <p className="text-lg sm:text-xl font-black text-emerald-500 tabular-nums truncate" title={splitResult.subResult > 0 ? splitResult.subResult.toLocaleString() : undefined}>
                        {splitResult.subResult > 0 ? compactNum(splitResult.subResult) : "—"}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {splitResult.subPercent > 0 ? `${splitResult.subPercent > 100 ? compactNum(splitResult.subPercent) : splitResult.subPercent.toFixed(1)}%` : "—"} of A
                      </p>
                    </div>
                    <div className="space-y-1 overflow-hidden">
                      <p className="text-lg sm:text-xl font-black text-amber-500 tabular-nums truncate" title={splitResult.subOfOriginal > 0 ? `${splitResult.subOfOriginal}%` : undefined}>
                        {splitResult.subOfOriginal > 0 ? `${splitResult.subOfOriginal > 10000 ? compactNum(splitResult.subOfOriginal) : splitResult.subOfOriginal}%` : "—"}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Of Total
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Formula */}
              <Card className="border-dashed shadow-none">
                <CardContent className="pt-4 pb-4 space-y-2">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4 text-primary shrink-0" />
                    <code className="font-mono text-xs bg-muted px-2 py-1 rounded">{splitResult.formula}</code>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Info className="h-4 w-4 text-amber-500 shrink-0" />
                    <code className="font-mono text-xs bg-muted px-2 py-1 rounded">{splitResult.globalFormula}</code>
                  </div>
                </CardContent>
              </Card>

              {/* Explainer */}
              <Card className="border-dashed shadow-none">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3 text-xs text-muted-foreground leading-relaxed">
                    <Info className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold mb-1">How it works</p>
                      {splitInputMode === "custom" && (sCustomA > 0 || sCustomB > 0) ? (
                        <p>
                          Portion A = <strong>{sCustomA.toLocaleString()}</strong>, Portion B = <strong>{sCustomB.toLocaleString()}</strong>.
                          Total = <strong>{splitResult.totalValue.toLocaleString()}</strong>.
                          The split is <strong>{splitResult.splitA}%</strong> / <strong>{splitResult.splitB}%</strong>.
                          {sSubMode === "value" && sSubVal > 0 ? (
                            <> <strong>{sSubVal.toLocaleString()}</strong> is <strong>{splitResult.subPercent.toFixed(2)}%</strong> of Portion A, and <strong>{splitResult.subOfOriginal}%</strong> of the total.</>
                          ) : (
                            <> <strong>{splitResult.subPercent.toFixed(2)}%</strong> of Portion A = <strong>{splitResult.subResult.toLocaleString()}</strong> ({splitResult.subOfOriginal}% of the total).</>
                          )}
                        </p>
                      ) : splitInputMode === "portion" && sPortionVal > 0 ? (
                        <p>
                          You have <strong>{sPortionVal.toLocaleString()}</strong> which is <strong>{sSplitA}%</strong> of the total.
                          So the total = {splitResult.totalValue.toLocaleString()}.
                          {sSubMode === "value" && sSubVal > 0 ? (
                            <> <strong>{sSubVal.toLocaleString()}</strong> is <strong>{splitResult.subPercent.toFixed(2)}%</strong> of your portion, and <strong>{splitResult.subOfOriginal}%</strong> of the total.</>
                          ) : (
                            <> <strong>{splitResult.subPercent.toFixed(2)}%</strong> of your portion = <strong>{splitResult.subResult.toLocaleString()}</strong> ({splitResult.subOfOriginal}% of the total).</>
                          )}
                        </p>
                      ) : splitInputMode === "total" && sTotal > 0 ? (
                        <p>
                          Total of <strong>{sTotal.toLocaleString()}</strong> split into <strong>{sSplitA}%</strong> ({splitResult.portionA.toLocaleString()}) and <strong>{splitResult.splitB}%</strong> ({splitResult.portionB.toLocaleString()}).
                          {sSubMode === "value" && sSubVal > 0 ? (
                            <> <strong>{sSubVal.toLocaleString()}</strong> is <strong>{splitResult.subPercent.toFixed(2)}%</strong> of the {sSplitA}% portion, and <strong>{splitResult.subOfOriginal}%</strong> of the total.</>
                          ) : (
                            <> <strong>{splitResult.subPercent.toFixed(2)}%</strong> of the {sSplitA}% portion = <strong>{splitResult.subResult.toLocaleString()}</strong> ({splitResult.subOfOriginal}% of the total).</>
                          )}
                        </p>
                      ) : (
                        <p>Enter values above to see the full breakdown.</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── TIP CALCULATOR ──────────────────────────────────── */}
        <TabsContent value="tip" className="mt-6">
          <div className="grid gap-6 md:grid-cols-12">
            <div className="md:col-span-5">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-4 w-4" /> Tip Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex flex-wrap gap-2">
                    {[10, 12, 15, 18, 20, 25].map((v) => (
                      <QuickBadge key={v} label={`${v}%`} active={tipPct === v} onClick={() => setTipPct(v)} />
                    ))}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tip-bill" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Bill Amount
                    </Label>
                    <Input
                      id="tip-bill"
                      type="number"
                      value={tipBill || ""}
                      placeholder="e.g. 85.50"
                      onChange={(e) => setTipBill(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tip-pct" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Tip Percentage (%)
                    </Label>
                    <Input
                      id="tip-pct"
                      type="number"
                      value={tipPct || ""}
                      onChange={(e) => setTipPct(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tip-split" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Split Between
                    </Label>
                    <Input
                      id="tip-split"
                      type="number"
                      min={1}
                      value={tipSplit || ""}
                      onChange={(e) => setTipSplit(Math.max(1, parseInt(e.target.value) || 1))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-7 space-y-4">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-8 pb-8">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-1">
                      <p className="text-3xl font-black text-primary tabular-nums">
                        {tipResult.tip.toFixed(2)}
                      </p>
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Tip</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-3xl font-black text-emerald-500 tabular-nums">
                        {tipResult.total.toFixed(2)}
                      </p>
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-3xl font-black text-amber-500 tabular-nums">
                        {tipResult.perPerson.toFixed(2)}
                      </p>
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Per Person</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tip breakdown bars */}
              {tipBill > 0 && (
                <Card className="border-dashed shadow-none">
                  <CardContent className="pt-6 pb-6 space-y-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Breakdown</p>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span>Bill</span>
                          <span>{tipBill.toFixed(2)}</span>
                        </div>
                        <div className="h-3 rounded-full overflow-hidden bg-muted">
                          <div
                            className="h-full bg-primary/60 rounded-full transition-all duration-500"
                            style={{ width: `${(tipBill / tipResult.total) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span>Tip ({tipPct}%)</span>
                          <span>{tipResult.tip.toFixed(2)}</span>
                        </div>
                        <div className="h-3 rounded-full overflow-hidden bg-muted">
                          <div
                            className="h-full bg-emerald-500/60 rounded-full transition-all duration-500"
                            style={{ width: `${(tipResult.tip / tipResult.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    {tipSplit > 1 && (
                      <div className="flex items-start gap-3 p-3 text-xs text-muted-foreground italic border-t pt-4">
                        <Info className="h-4 w-4 shrink-0" />
                        <p>
                          Splitting {tipResult.total.toFixed(2)} between {tipSplit} people = {tipResult.perPerson.toFixed(2)} each.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
