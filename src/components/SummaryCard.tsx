import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Zap, AlertTriangle, Telescope } from "lucide-react";
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

  const [showReality, setShowReality] = useState(false);

  const powerComparisons = useMemo(() => translatePowerLoad(totalLoad), [totalLoad]);
  const energyComparisons = useMemo(() => translateMonthlyEnergy(monthlyKWh), [monthlyKWh]);

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Consumption Summary
        </CardTitle>
        <CardDescription>Real-time system & cost estimation</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Total Load</Label>
              <p className="text-2xl font-bold">
                <AnimatedNumber value={totalLoad} /> <span className="text-sm font-medium text-muted-foreground">W</span>
              </p>
            </div>
            <div className="space-y-2 p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
              <Label htmlFor="rate" className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Tariff Rate ({symbol}/Unit)</Label>
              <Input 
                id="rate"
                type="number" 
                min="0"
                value={electricityRate === 0 ? "" : electricityRate} 
                onChange={(e) => setElectricityRate(Math.max(0, parseFloat(e.target.value) || 0))} 
                className="h-8 font-mono text-sm"
              />
            </div>
          </div>
          
          <div className="rounded-lg border bg-muted/20 overflow-hidden">
            <div className="grid grid-cols-2 divide-x border-b last:border-0 md:border-border">
              <div className="p-4 space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Daily Usage</Label>
                <div>
                  <p className="text-lg font-bold">
                    <AnimatedNumber value={dailyKWh} decimals={2} /> <span className="text-xs font-medium text-muted-foreground">kWh</span>
                  </p>
                  <p className="text-sm font-medium text-primary">
                    {formatCurrency(dailyCost, currency)}
                  </p>
                </div>
              </div>
              <div className="p-4 space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Monthly Usage</Label>
                <div>
                  <p className="text-lg font-bold">
                    <AnimatedNumber value={monthlyKWh} decimals={2} /> <span className="text-xs font-medium text-muted-foreground">kWh</span>
                  </p>
                  <p className="text-sm font-medium text-primary">
                    {formatCurrency(monthlyCost, currency)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reality Translator Toggle */}
        {totalLoad > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 fun-units-toggle">
              <div className="flex items-center gap-2">
                <Telescope className="h-4 w-4 text-violet-600" />
                <Label htmlFor="reality-toggle-power" className="text-xs font-bold cursor-pointer">
                  Reality Translator
                </Label>
              </div>
              <Switch
                id="reality-toggle-power"
                checked={showReality}
                onCheckedChange={setShowReality}
              />
            </div>

            {showReality && (
              <div className="space-y-3">
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
           <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-sm border border-destructive/20 flex items-start gap-3">
             <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
             <div className="space-y-1">
               <p className="font-bold">High Load Warning</p>
               <p className="text-xs opacity-90 leading-relaxed">Loads of 2000W+ typically require heavy industrial setups.</p>
             </div>
           </div>
        )}
      </CardContent>
    </Card>
  );
}
