import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeftRight, TrendingDown, TrendingUp, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";

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
          <div className="p-4 rounded-lg border bg-emerald-500/5 flex flex-col items-center text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">EV Cost</span>
            <span className="text-xl font-bold">{formatCurrency(evTotal, currency)}</span>
            <span className="text-[10px] text-muted-foreground">{formatCurrency(evCostPerKm, currency)}/km</span>
          </div>
          <div className="p-4 rounded-lg border bg-rose-500/5 flex flex-col items-center text-center">
            <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">Fuel Cost</span>
            <span className="text-xl font-bold">{formatCurrency(fuelTotal, currency)}</span>
            <span className="text-[10px] text-muted-foreground">{formatCurrency(fuelCostPerKm, currency)}/km</span>
          </div>
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

        <div className="p-4 border border-dashed rounded-lg space-y-2">
           <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-extrabold flex items-center gap-1">
             <AlertCircle className="h-3 w-3" /> Quick Insight
           </Label>
           <p className="text-xs text-muted-foreground leading-relaxed font-medium">
             EV operational costs are approximately <span className="text-foreground font-bold">{fuelCostPerKm > 0 ? Math.round((evCostPerKm / fuelCostPerKm) * 100) : 0}%</span> of ICE vehicles at current rates.
           </p>
        </div>
      </CardContent>
    </Card>
  );
}
