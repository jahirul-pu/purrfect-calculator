import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toggle } from "@/components/ui/toggle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Sun, Info, CheckCircle2, AlertTriangle, XCircle, BatteryCharging } from "lucide-react";
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
  const [panelWattRating, setPanelWattRating] = useState<number>(550);

  const ips = useMemo(() => calculateIPS(totalLoadWatts), [totalLoadWatts]);
  const voltage = useMemo(() => selectVoltage(totalLoadWatts, preference), [totalLoadWatts, preference]);
  const batteryAh = useMemo(() => calculateBattery(totalLoadWatts, backupHours, voltage), [totalLoadWatts, backupHours, voltage]);
  const solar = useMemo(() => calculateSolar(totalDailyKwh, sunlightHours), [totalDailyKwh, sunlightHours]);

  const hasLoad = totalLoadWatts > 0;

  const ipsRange = useMemo(() => {
    if (!hasLoad) {
      return { vaMin: 0, vaMax: 0, wattsMin: 0, wattsMax: 0 };
    }

    const vaMin = Math.max(50, Math.floor((ips.va * 0.9) / 50) * 50);
    const vaMax = Math.ceil((ips.va * 1.05) / 50) * 50;
    const wattsMin = Math.max(50, Math.floor((ips.watts * 0.9) / 50) * 50);
    const wattsMax = Math.ceil((ips.watts * 1.05) / 50) * 50;

    return { vaMin, vaMax, wattsMin, wattsMax };
  }, [hasLoad, ips.va, ips.watts]);

  const capacityPercent = hasLoad
    ? Math.min(100, Math.round((totalLoadWatts / ipsRange.wattsMax) * 100))
    : 0;

  const confidence =
    !hasLoad
      ? "pending"
      : capacityPercent <= 70
        ? "safe"
        : capacityPercent <= 90
          ? "tight"
          : "not-recommended";

  const confidenceMeta =
    confidence === "safe"
      ? {
          label: "Safe",
          chipClass: "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/35 shadow-sm",
          Icon: CheckCircle2,
          barClass: "bg-emerald-500",
        }
      : confidence === "tight"
        ? {
            label: "Tight",
            chipClass: "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/35 shadow-sm",
            Icon: AlertTriangle,
            barClass: "bg-amber-500",
          }
        : confidence === "not-recommended"
          ? {
              label: "Not recommended",
              chipClass: "bg-red-100 text-red-700 border border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/35 shadow-sm",
              Icon: XCircle,
              barClass: "bg-red-500",
            }
          : {
              label: "Waiting",
              chipClass: "bg-muted text-muted-foreground border border-border/70",
              Icon: Info,
              barClass: "bg-muted-foreground/60",
            };

  const batteryPlan = useMemo(() => {
    if (!hasLoad || batteryAh <= 0) return null;

    const seriesCount = voltage === 24 ? 2 : 1;
    const standardUnits = [100, 120, 150, 200];

    const options = standardUnits
      .map((unitAh) => {
        const parallelStrings = Math.max(1, Math.ceil(batteryAh / unitAh));
        const totalBatteries = parallelStrings * seriesCount;
        const totalBankAh = parallelStrings * unitAh;
        const spareAh = totalBankAh - batteryAh;

        return {
          unitAh,
          parallelStrings,
          totalBatteries,
          totalBankAh,
          spareAh,
        };
      })
      .sort((a, b) => {
        if (a.spareAh !== b.spareAh) return a.spareAh - b.spareAh;
        return a.totalBatteries - b.totalBatteries;
      });

    const best = options[0];
    const achievableHours = totalLoadWatts > 0 ? (best.totalBankAh * voltage) / (totalLoadWatts * 1.8) : 0;

    return {
      ...best,
      seriesCount,
      achievableHours,
    };
  }, [hasLoad, batteryAh, voltage, totalLoadWatts]);

  const panelCount = useMemo(() => {
    if (!isSolarEnabled || solar.panelWatts <= 0 || panelWattRating <= 0) return 0;
    return Math.max(1, Math.ceil(solar.panelWatts / panelWattRating));
  }, [isSolarEnabled, solar.panelWatts, panelWattRating]);

  const roofSpaceSqm = useMemo(() => panelCount * 2.2, [panelCount]);

  const chargingTimeHours = useMemo(() => {
    if (!isSolarEnabled || !batteryPlan || solar.panelWatts <= 0) return 0;
    const effectiveChargeWatts = solar.panelWatts * 0.78;
    if (effectiveChargeWatts <= 0) return 0;
    const bankWh = batteryPlan.totalBankAh * voltage;
    return bankWh / effectiveChargeWatts;
  }, [isSolarEnabled, batteryPlan, solar.panelWatts, voltage]);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Zap className="h-5 w-5" />
          System Recommendations
        </CardTitle>
        <CardDescription>Target hardware specifications for your load</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <div className="space-y-6 md:col-span-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="backup" className="text-sm text-muted-foreground">
                  Backup Time (Hours)
                </Label>
                <Input
                  id="backup"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={backupHours}
                  onChange={(e) => setBackupHours(parseFloat(e.target.value) || 0.5)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">System Voltage</Label>
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
            </div>

            <div className="space-y-4 border-t border-border pt-4">
              <div className="flex items-center justify-between rounded-2xl border bg-muted/20 p-4">
                <div>
                  <p className="font-semibold text-foreground">Solar Charging</p>
                  <p className="text-sm text-muted-foreground">Calculate panel requirements</p>
                </div>
                <Toggle
                  className="h-5 w-9"
                  pressed={isSolarEnabled}
                  onPressedChange={setIsSolarEnabled}
                  aria-label="Toggle solar charging"
                />
              </div>

              {isSolarEnabled && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <Label htmlFor="sun" className="text-sm text-muted-foreground">Peak Sunlight Hours</Label>
                    <Input 
                      id="sun"
                      type="number"
                      min="1"
                      max="12"
                      value={sunlightHours}
                      onChange={(e) => setSunlightHours(parseFloat(e.target.value) || 4.5)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="panel-watt" className="text-sm text-muted-foreground">Panel Watt Rating (Per Panel)</Label>
                    <Input
                      id="panel-watt"
                      type="number"
                      min="100"
                      step="10"
                      value={panelWattRating}
                      onChange={(e) => setPanelWattRating(Math.max(100, parseFloat(e.target.value) || 550))}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 md:col-span-7">
            <div className="grid gap-4 p-4 rounded-lg border bg-card shadow-sm">
              <div className="rounded-2xl border border-primary/25 bg-primary/[0.10] p-5 space-y-4 shadow-[0_10px_28px_-18px_hsl(var(--primary)/0.85)]">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    IPS Recommendation
                  </p>
                  <p className="text-xl font-bold text-primary">
                    {hasLoad ? `${ipsRange.vaMin}-${ipsRange.vaMax} VA` : "-- VA"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {hasLoad ? "Ideal inverter size" : "Add appliance loads to calculate recommendation"}
                  </p>
                  {hasLoad && (
                    <p className="text-sm text-muted-foreground">
                      Output window: {ipsRange.wattsMin}-{ipsRange.wattsMax} W
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
                  <span className="text-sm text-muted-foreground">Confidence</span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold ${confidenceMeta.chipClass}`}>
                    <confidenceMeta.Icon className="h-3.5 w-3.5" /> {confidenceMeta.label}
                  </span>
                </div>

                <div className="space-y-1 border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground">
                    Load: {totalLoadWatts}W / {hasLoad ? ipsRange.wattsMax : 0}W
                  </p>
                  <div className="h-2 w-full rounded-full bg-muted/70 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ease-out ${confidenceMeta.barClass}`}
                      style={{ width: `${capacityPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 bg-background p-5 space-y-4">
                <p className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                  <BatteryCharging className="h-3.5 w-3.5 text-primary" /> Battery Recommendation
                </p>

                {batteryPlan ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Battery Setup</p>
                      <p className="text-lg font-semibold text-primary">
                        {batteryPlan.totalBatteries} x {batteryPlan.unitAh}Ah
                      </p>
                    </div>

                    <div className="border-t border-border pt-4 text-sm text-muted-foreground">
                      {batteryPlan.seriesCount === 2
                        ? `Config: ${batteryPlan.seriesCount}S${batteryPlan.parallelStrings}P (series + parallel)`
                        : `Config: ${batteryPlan.parallelStrings}P (parallel)`}
                    </div>

                    <div className="border-t border-border pt-4 text-sm">
                      <span className="font-semibold">Backup:</span> {batteryPlan.achievableHours.toFixed(1)} hrs
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Set load and backup hours to generate battery recommendation.</p>
                )}
              </div>
              
              {isSolarEnabled && (
                <div className="pt-1 space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="rounded-2xl border border-border/70 bg-background p-5 space-y-4">
                    <div className="flex flex-col items-start gap-1 text-primary sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm font-bold flex items-center gap-1">
                        <Sun className="h-3 w-3" /> Solar Planner
                      </span>
                      <span className="text-base font-bold">{solar.panelWatts} W Required</span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 border-t border-border pt-4 text-sm sm:grid-cols-2">
                      <div className="rounded-lg bg-muted/40 p-4 text-center">
                        <p className="text-sm text-muted-foreground">Panels</p>
                        <p className="mt-2 text-lg font-semibold leading-tight">{panelCount} x {panelWattRating}W</p>
                      </div>
                      <div className="rounded-lg bg-muted/40 p-4 text-center">
                        <p className="text-sm text-muted-foreground">Roof</p>
                        <p className="mt-2 text-lg font-semibold leading-tight">{roofSpaceSqm.toFixed(1)} m²</p>
                      </div>
                      <div className="rounded-lg bg-muted/40 p-4 text-center">
                        <p className="text-sm text-muted-foreground">Charging Time</p>
                        <p className="mt-2 text-lg font-semibold leading-tight">
                          {batteryPlan ? `${chargingTimeHours.toFixed(1)} hrs` : "Add load for battery plan"}
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted/40 p-4 text-center">
                        <p className="text-sm text-muted-foreground">Est. Generation</p>
                        <p className="mt-2 text-lg font-semibold leading-tight">{solar.solarKwh.toFixed(2)} kWh/day</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {(backupHours > 4 || totalLoadWatts > 2000) && (
              <div className="p-4 rounded-lg border flex gap-3 text-sm bg-muted/50 text-muted-foreground">
                <Info className="h-4 w-4 shrink-0" />
                <div className="space-y-1">
                  {totalLoadWatts > 2000 && <p className="font-semibold">Heavy Loads detected. Pure Sine Wave strongly advised.</p>}
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
