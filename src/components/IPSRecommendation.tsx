import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Sun, Info } from "lucide-react";
import { calculateIPS, calculateBattery, selectVoltage } from "@/lib/ipsCalculator";
import { calculateSolar } from "@/lib/solarCalculator";

interface IPSRecommendationProps {
  totalLoadWatts: number;
  totalDailyKwh: number;
}

export function IPSRecommendation({ totalLoadWatts, totalDailyKwh }: IPSRecommendationProps) {
  const [backupHours, setBackupHours] = useState<number>(2);
  const [preference, setPreference] = useState<"Auto" | "12V" | "24V">("Auto");
  const [isSolarEnabled, setIsSolarEnabled] = useState<boolean>(false);
  const [sunlightHours, setSunlightHours] = useState<number>(4.5);

  const ips = useMemo(() => calculateIPS(totalLoadWatts), [totalLoadWatts]);
  const voltage = useMemo(() => selectVoltage(totalLoadWatts, preference), [totalLoadWatts, preference]);
  const batteryAh = useMemo(() => calculateBattery(totalLoadWatts, backupHours, voltage), [totalLoadWatts, backupHours, voltage]);
  const solar = useMemo(() => calculateSolar(totalDailyKwh, sunlightHours), [totalDailyKwh, sunlightHours]);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="h-5 w-5" />
          System Recommendations
        </CardTitle>
        <CardDescription>Target hardware specifications for your load</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Inputs */}
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="backup" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Backup Time (Hours)</Label>
              <Input 
                id="backup"
                type="number"
                min="0.5"
                step="0.5"
                value={backupHours}
                onChange={(e) => setBackupHours(parseFloat(e.target.value) || 0.5)}
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">System Voltage</Label>
              <Select value={preference} onValueChange={(val: "Auto" | "12V" | "24V") => setPreference(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Auto">Auto Selection</SelectItem>
                  <SelectItem value="12V">12V System</SelectItem>
                  <SelectItem value="24V">24V System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold">Solar Charging</Label>
                <p className="text-xs text-muted-foreground">Calculate panel requirements</p>
              </div>
              <Switch checked={isSolarEnabled} onCheckedChange={setIsSolarEnabled} />
            </div>

            {isSolarEnabled && (
              <div className="grid gap-2 animate-in fade-in slide-in-from-top-2">
                <Label htmlFor="sun" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Peak Sunlight Hours</Label>
                <Input 
                  id="sun"
                  type="number"
                  min="1"
                  max="12"
                  value={sunlightHours}
                  onChange={(e) => setSunlightHours(parseFloat(e.target.value) || 4.5)}
                />
              </div>
            )}
          </div>

          {/* Outputs */}
          <div className="space-y-4">
            <div className="grid gap-3 p-4 rounded-lg border bg-card shadow-sm">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">IPS Rating</span>
                <span className="font-bold">{ips.va} VA / {ips.watts} W</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Battery Bank</span>
                <span className="font-bold">{batteryAh} Ah ({voltage}V)</span>
              </div>
              
              {isSolarEnabled && (
                <div className="pt-1 space-y-3">
                  <div className="flex justify-between items-center py-2 border-b text-primary">
                    <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                      <Sun className="h-3 w-3" /> Solar Panel
                    </span>
                    <span className="font-bold">{solar.panelWatts} W</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Est. Generation</span>
                    <span className="font-bold">{solar.solarKwh.toFixed(2)} kWh/day</span>
                  </div>
                </div>
              )}
            </div>

            {(backupHours > 4 || totalLoadWatts > 2000) && (
              <div className="p-4 rounded-lg border flex gap-3 text-xs bg-muted/50 text-muted-foreground">
                <Info className="h-4 w-4 shrink-0" />
                <div className="space-y-1">
                  {totalLoadWatts > 2000 && <p className="font-bold">Heavy Loads detected. Pure Sine Wave strongly advised.</p>}
                  {backupHours > 4 && <p>Large battery banks may require dedicated external chargers for efficient recovery.</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
