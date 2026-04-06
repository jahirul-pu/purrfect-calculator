import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { InsightBox } from "@/components/InsightBox";
import { ArrowLeftRight, TrendingDown, TrendingUp, TrendingUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, currencies } from "@/lib/currency";
import { getVehicleSavingsInsight } from "@/lib/insights";
import { useCalculatorContext } from "@/context/CalculatorContext";
import { useMemo } from "react";

interface ComparisonCardProps {
  evCostPerKm: number;
  fuelCostPerKm: number;
  distance: number;
  setDistance: (val: number) => void;
  currency: string;
}

export function ComparisonCard({ evCostPerKm, fuelCostPerKm, distance, setDistance, currency }: ComparisonCardProps) {
  const evTotal = evCostPerKm * distance;
  const fuelTotal = fuelCostPerKm * distance;
  const savings = fuelTotal - evTotal;

  const ctx = useCalculatorContext();
  const activeCurrency = currencies.find(c => c.code === currency) || currencies[0];
  const sym = activeCurrency.code === "BDT" ? "BDT" : activeCurrency.symbol;

  const annualSavings = savings > 0 ? savings * 30 * 12 : 0; // rough daily→annual if distance is daily commute

  const insight = useMemo(
    () => getVehicleSavingsInsight(savings, distance, sym),
    [savings, distance, sym]
  );

  return (
    <Card className="h-full border-dashed shadow-none">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ArrowLeftRight className="h-5 w-5" />
          Cost Comparison
        </CardTitle>
        <CardDescription>Direct ROI analysis for {distance}km</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-2">
          <Label htmlFor="compare-distance" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Trip Distance (km)</Label>
          <Input 
            id="compare-distance"
            type="number"
            min="1"
            value={distance === 0 ? "" : distance}
            onChange={(e) => setDistance(parseFloat(e.target.value) || 0)}
            className="h-10 font-bold"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-emerald-500/5 shadow-none">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">EV Cost</span>
              <span className="text-xl font-bold tabular-nums">{formatCurrency(evTotal, currency)}</span>
              <span className="text-[10px] text-muted-foreground">{formatCurrency(evCostPerKm, currency)}/km</span>
            </CardContent>
          </Card>
          <Card className="bg-rose-500/5 shadow-none">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">Fuel Cost</span>
              <span className="text-xl font-bold tabular-nums">{formatCurrency(fuelTotal, currency)}</span>
              <span className="text-[10px] text-muted-foreground">{formatCurrency(fuelCostPerKm, currency)}/km</span>
            </CardContent>
          </Card>
        </div>

        <div className={cn(
          "p-4 rounded-lg border flex items-start gap-3",
          savings >= 0 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"
        )}>
           {savings >= 0 ? (
             <TrendingDown className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
           ) : (
             <TrendingUp className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
           )}
           <div className="space-y-1">
             <p className="text-sm font-bold">
               {savings >= 0 ? "EV is Cheaper" : "Fuel is Cheaper"}
             </p>
             <p className="text-xs opacity-90 leading-relaxed font-medium">
               You save <span className="font-bold">{formatCurrency(Math.abs(savings), currency)}</span> per {distance} km trip.
             </p>
           </div>
        </div>

        {/* ─── "Invest These Savings" Bridge ─── */}
        {savings > 0 && distance > 0 && (
          <Button
            className="w-full h-11 font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-600/20 transition-all duration-300 hover:shadow-emerald-600/35 hover:scale-[1.01] animate-in fade-in slide-in-from-bottom-2 duration-500"
            onClick={() => ctx.pushToInvest(annualSavings, `Vehicle savings: ${formatCurrency(savings, currency)}/trip`)}
          >
            <TrendingUpIcon className="h-4 w-4 mr-2" />
            Invest These Savings →
          </Button>
        )}

        {/* Insight */}
        <InsightBox insight={insight} />
      </CardContent>
    </Card>
  );
}
