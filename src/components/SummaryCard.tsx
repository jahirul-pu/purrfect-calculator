import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toggle } from "@/components/ui/toggle";
import { Zap, AlertTriangle, Telescope, Lightbulb, BatteryCharging } from "lucide-react";
import { formatCurrency, currencies } from "@/lib/currency";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { RealityTranslatorPanel } from "@/components/RealityTranslatorPanel";
import { translatePowerLoad, translateMonthlyEnergy } from "@/lib/realityTranslator";

interface SummaryProps {
  totalLoad: number;
  dailyKWh: number;
  monthlyKWh: number;
  electricityRate: number;
  setElectricityRate: (val: number) => void;
  currency: string;
}

export function SummaryCard({
  totalLoad, dailyKWh, monthlyKWh, electricityRate, setElectricityRate, currency
}: SummaryProps) {
  const activeCurrency = currencies.find(c => c.code === currency) || currencies[0];
  const symbol = activeCurrency.code === "BDT" ? "BDT" : activeCurrency.symbol;
  
  const isHighLoad = totalLoad >= 2000;
  const dailyCost = dailyKWh * electricityRate;
  const monthlyCost = monthlyKWh * electricityRate;
  const dailyCostTone = dailyCost > 0 ? "text-primary/90" : "text-muted-foreground";
  const monthlyCostTone = monthlyCost > 0 ? "text-primary/90" : "text-muted-foreground";

  const [showReality, setShowReality] = useState(false);

  const loadLevel = totalLoad >= 2000 ? "heavy" : totalLoad >= 1000 ? "medium" : "low";
  const loadTone =
    loadLevel === "heavy"
      ? {
          text: "text-red-600 dark:text-red-400",
          border: "border-red-500/30",
          bg: "bg-red-500/8",
          chip: "bg-red-500/15 text-red-700 dark:text-red-300",
          label: "Heavy",
        }
      : loadLevel === "medium"
        ? {
            text: "text-amber-600 dark:text-amber-400",
            border: "border-amber-500/30",
            bg: "bg-amber-500/8",
            chip: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
            label: "Medium",
          }
        : {
            text: "text-emerald-600 dark:text-emerald-400",
            border: "border-emerald-500/30",
            bg: "bg-emerald-500/8",
            chip: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
            label: "Low",
          };

  const backupStatus =
    totalLoad <= 0 ? "Unknown" : totalLoad <= 1200 ? "Likely" : totalLoad <= 2500 ? "Possible" : "Challenging";

  const backupChipClass =
    backupStatus === "Likely"
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
      : backupStatus === "Possible"
        ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
        : backupStatus === "Challenging"
          ? "bg-red-500/15 text-red-700 dark:text-red-300"
          : "bg-muted text-muted-foreground";

  const powerComparisons = useMemo(() => translatePowerLoad(totalLoad), [totalLoad]);
  const energyComparisons = useMemo(() => translateMonthlyEnergy(monthlyKWh), [monthlyKWh]);

  return (
    <Card className="sticky top-6 border-primary/30 bg-gradient-to-br from-primary/[0.12] via-background to-background shadow-[0_24px_60px_-30px_hsl(var(--primary)/0.78)]">
      <CardHeader className="space-y-2 bg-gradient-to-r from-primary/[0.10] to-transparent">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Zap className="h-5 w-5 text-primary" />
          Consumption Summary
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground/90">Real-time system and cost estimation</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-8">
        <div className="rounded-2xl border border-primary/35 bg-gradient-to-br from-primary/[0.18] to-primary/[0.06] p-6 shadow-[0_16px_36px_-24px_hsl(var(--primary)/0.95)]">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/90">
            <Lightbulb className="h-4 w-4" /> Estimated Monthly Cost
          </p>
          <p className="mt-2 text-3xl font-black tabular-nums text-primary">
            <AnimatedNumber value={monthlyCost} decimals={2} duration={750} prefix={`${symbol} `} />
          </p>
          <div className="mt-4 flex items-center justify-between rounded-xl border border-primary/25 bg-background/75 px-4 py-3">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/85">
              <BatteryCharging className="h-4 w-4" /> Battery Backup Possible
            </p>
            <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide transition-colors duration-300 ${backupChipClass}`}>
              {backupStatus}
            </span>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div
              className={`space-y-2 rounded-xl border p-4 text-card-foreground shadow-sm transition-all duration-300 ${loadTone.border} ${loadTone.bg}`}
            >
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground/75 font-medium">Total Load</Label>
              <div className="space-y-2">
                <p className={`text-[30px] leading-none font-black transition-colors duration-300 ${loadTone.text}`}>
                  <AnimatedNumber value={totalLoad} duration={650} className="transition-colors duration-300" />{" "}
                  <span className="text-sm font-medium text-muted-foreground">W</span>
                </p>
                <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-bold uppercase tracking-wide transition-colors duration-300 ${loadTone.chip}`}>
                  {loadTone.label} Load
                </span>
              </div>
            </div>
            <div className="space-y-2 p-4 rounded-xl border border-primary/20 bg-background/85 text-card-foreground shadow-sm">
              <Label htmlFor="rate" className="text-[10px] uppercase tracking-wider text-muted-foreground/75 font-medium">Tariff Rate ({symbol}/Unit)</Label>
              <Input 
                id="rate"
                type="number" 
                min="0"
                value={electricityRate === 0 ? "" : electricityRate} 
                onChange={(e) => setElectricityRate(Math.max(0, parseFloat(e.target.value) || 0))} 
                className="h-10 rounded-xl border-border/80 bg-background/80 px-3.5 font-mono text-sm"
              />
            </div>
          </div>
          
          <div className="rounded-xl border border-primary/20 bg-background/75 overflow-hidden">
            <div className="grid grid-cols-2 divide-x border-b last:border-0 md:border-border/70">
              <div className="p-4 space-y-2">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground/75 font-medium">Daily Usage</Label>
                <div>
                  <p className="text-[20px] leading-tight font-bold">
                    <AnimatedNumber value={dailyKWh} decimals={2} /> <span className="text-xs font-medium text-muted-foreground">kWh</span>
                  </p>
                  <p className={`text-sm font-medium transition-colors duration-300 ${dailyCostTone}`}>
                    {formatCurrency(dailyCost, currency)}
                  </p>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground/75 font-medium">Monthly Usage</Label>
                <div>
                  <p className="text-[20px] leading-tight font-bold">
                    <AnimatedNumber value={monthlyKWh} decimals={2} /> <span className="text-xs font-medium text-muted-foreground">kWh</span>
                  </p>
                  <p className={`text-sm font-medium transition-colors duration-300 ${monthlyCostTone}`}>
                    {formatCurrency(monthlyCost, currency)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reality Translator Toggle */}
        {totalLoad > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between p-4 rounded-xl border border-primary/20 bg-background/70 fun-units-toggle">
              <div className="flex items-center gap-2">
                <Telescope className="h-4 w-4 text-violet-600" />
                <Label htmlFor="reality-toggle-power" className="text-xs font-semibold text-muted-foreground/90 cursor-pointer">
                  Reality Translator
                </Label>
              </div>
              <Toggle
                id="reality-toggle-power"
                pressed={showReality}
                onPressedChange={setShowReality}
                aria-label="Toggle power reality translator"
              />
            </div>

            {showReality && (
              <div className="space-y-2">
                {powerComparisons.length > 0 && (
                  <RealityTranslatorPanel
                    comparisons={powerComparisons}
                    title="Your Load Is Like..."
                  />
                )}
                {energyComparisons.length > 0 && (
                  <RealityTranslatorPanel
                    comparisons={energyComparisons}
                    title="Monthly Energy Equals..."
                  />
                )}
              </div>
            )}
          </div>
        )}

        {isHighLoad && (
           <div className="bg-destructive/10 text-destructive p-4 rounded-xl text-sm border border-destructive/20 flex items-start gap-2">
             <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
             <div className="space-y-2">
               <p className="font-semibold">High Load Warning</p>
               <p className="text-xs opacity-90 leading-relaxed">Loads of 2000W+ typically require heavy industrial setups.</p>
             </div>
           </div>
        )}
      </CardContent>
    </Card>
  );
}
