import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Battery } from "lucide-react";

interface EVCalculatorProps {
  evType: "Car" | "Bike";
  setEvType: (val: "Car" | "Bike") => void;
  evVoltage: number;
  setEvVoltage: (val: number) => void;
  evAh: number;
  setEvAh: (val: number) => void;
  evRange: number;
  setEvRange: (val: number) => void;
  evPrice: number;
  setEvPrice: (val: number) => void;
  evAcOn: boolean;
  setEvAcOn: (val: boolean) => void;
  evMode: "City" | "Highway";
  setEvMode: (val: "City" | "Highway") => void;
  currency: string;
}

import { currencies } from "@/lib/currency";

export function EVCalculator({
  evType, setEvType,
  evVoltage, setEvVoltage,
  evAh, setEvAh,
  evRange, setEvRange,
  evPrice, setEvPrice,
  evAcOn, setEvAcOn,
  evMode, setEvMode,
  currency
}: EVCalculatorProps) {
  const activeCurrency = currencies.find(c => c.code === currency) || currencies[0];
  const symbol = activeCurrency.code === "BDT" ? "BDT" : activeCurrency.symbol;
  return (
    <Card className="animate-in fade-in duration-500">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Battery className="h-5 w-5" />
          EV Parameters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 grid gap-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Vehicle Type</Label>
            <Select value={evType} onValueChange={(val: "Car" | "Bike") => setEvType(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Car">Electric Car</SelectItem>
                <SelectItem value="Bike">Electric Bike / Scooter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ev-voltage" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Voltage (V)</Label>
            <Input 
              id="ev-voltage"
              type="number"
              value={evVoltage === 0 ? "" : evVoltage}
              onChange={(e) => setEvVoltage(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ev-ah" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Capacity (Ah)</Label>
            <Input 
              id="ev-ah"
              type="number"
              value={evAh === 0 ? "" : evAh}
              onChange={(e) => setEvAh(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ev-range" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Advertised Range (km)</Label>
            <Input 
              id="ev-range"
              type="number"
              value={evRange === 0 ? "" : evRange}
              onChange={(e) => setEvRange(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ev-price" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Electricity ({symbol}/kWh)</Label>
            <Input 
              id="ev-price"
              type="number"
              value={evPrice === 0 ? "" : evPrice}
              onChange={(e) => setEvPrice(parseFloat(e.target.value) || 0)}
            />
          </div>

          {evType === "Car" && (
            <>
              <div className="sm:col-span-2 grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Driving Mode</Label>
                <Select value={evMode} onValueChange={(val: "City" | "Highway") => setEvMode(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="City">City (Stop & Go)</SelectItem>
                    <SelectItem value="Highway">Highway (High Speed Drag)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-2 flex items-center justify-between p-4 rounded-lg border bg-muted/50">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">Air Conditioning</Label>
                  <p className="text-xs text-muted-foreground">Factor in HVAC energy consumption</p>
                </div>
                <Switch checked={evAcOn} onCheckedChange={setEvAcOn} />
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
