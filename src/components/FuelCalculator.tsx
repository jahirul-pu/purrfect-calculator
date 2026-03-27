import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Fuel } from "lucide-react";

interface FuelCalculatorProps {
  efficiency: number;
  setEfficiency: (val: number) => void;
  fuelPrice: number;
  setFuelPrice: (val: number) => void;
  mode: "City" | "Highway";
  setMode: (val: "City" | "Highway") => void;
  currency: string;
  tankCapacity: number;
  setTankCapacity: (val: number) => void;
}

import { currencies } from "@/lib/currency";

export function FuelCalculator({
  efficiency, setEfficiency,
  fuelPrice, setFuelPrice,
  mode, setMode,
  currency,
  tankCapacity, setTankCapacity
}: FuelCalculatorProps) {
  const activeCurrency = currencies.find(c => c.code === currency) || currencies[0];
  const symbol = activeCurrency.code === "BDT" ? "BDT" : activeCurrency.symbol;
  return (
    <Card className="animate-in fade-in duration-500">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Fuel className="h-5 w-5" />
          ICE Vehicle Parameters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="fuel-efficiency" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Efficiency (km/L)</Label>
            <Input 
              id="fuel-efficiency"
              type="number"
              value={efficiency === 0 ? "" : efficiency}
              onChange={(e) => setEfficiency(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="fuel-price" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fuel Price ({symbol}/L)</Label>
            <Input 
              id="fuel-price"
              type="number"
              value={fuelPrice === 0 ? "" : fuelPrice}
              onChange={(e) => setFuelPrice(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="sm:col-span-2 grid gap-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Driving Route</Label>
            <Select value={mode} onValueChange={(val: "City" | "Highway") => setMode(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="City">City (Traffic & Idling)</SelectItem>
                <SelectItem value="Highway">Highway (Optimal Cruise)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2 grid gap-2">
            <Label htmlFor="tank-capacity" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tank Capacity (Liters)</Label>
            <Input 
              id="tank-capacity"
              type="number"
              value={tankCapacity === 0 ? "" : tankCapacity}
              onChange={(e) => setTankCapacity(parseFloat(e.target.value) || 0)}
              placeholder="e.g. 50"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
