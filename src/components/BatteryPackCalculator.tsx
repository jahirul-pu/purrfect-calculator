import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { BatteryCharging, Gauge, Layers3, Zap } from "lucide-react";

type ChemistryKey = "LFP" | "NMC" | "LTO" | "Custom";

const CHEMISTRY_PRESETS: Record<Exclude<ChemistryKey, "Custom">, { nominalV: number; fullV: number; emptyV: number; defaultDoD: number }> = {
  LFP: { nominalV: 3.2, fullV: 3.65, emptyV: 2.8, defaultDoD: 90 },
  NMC: { nominalV: 3.7, fullV: 4.2, emptyV: 3.0, defaultDoD: 85 },
  LTO: { nominalV: 2.3, fullV: 2.8, emptyV: 1.8, defaultDoD: 95 },
};

export function BatteryPackCalculator() {
  const [chemistry, setChemistry] = useState<ChemistryKey>("LFP");
  const [targetVoltage, setTargetVoltage] = useState(51.2);
  const [targetEnergyKWh, setTargetEnergyKWh] = useState(5);
  const [cellVoltage, setCellVoltage] = useState(3.2);
  const [cellFullVoltage, setCellFullVoltage] = useState(3.65);
  const [cellEmptyVoltage, setCellEmptyVoltage] = useState(2.8);
  const [cellCapacityAh, setCellCapacityAh] = useState(100);
  const [cRatePreset, setCRatePreset] = useState<"0.5" | "1" | "2" | "3" | "5" | "custom">("1");
  const [customCRate, setCustomCRate] = useState(1);
  const [packRequiredCurrentA, setPackRequiredCurrentA] = useState(150);
  const [usableDoD, setUsableDoD] = useState(90);
  const [bmsLowCutoffV, setBmsLowCutoffV] = useState(44.8);
  const [bmsHighCutoffV, setBmsHighCutoffV] = useState(58.4);
  const [advancedBmsUnlocked, setAdvancedBmsUnlocked] = useState(false);

  const handleChemistryChange = (value: ChemistryKey) => {
    setChemistry(value);
    if (value === "Custom") return;

    const preset = CHEMISTRY_PRESETS[value];
    setCellVoltage(preset.nominalV);
    setCellFullVoltage(preset.fullV);
    setCellEmptyVoltage(preset.emptyV);
    setUsableDoD(preset.defaultDoD);
  };

  const result = useMemo(() => {
    const cellMaxCurrentA = (cRatePreset === "custom" ? customCRate : parseFloat(cRatePreset)) * cellCapacityAh;

    const validInputs =
      targetVoltage > 0 &&
      targetEnergyKWh > 0 &&
      cellVoltage > 0 &&
      cellFullVoltage > 0 &&
      cellEmptyVoltage > 0 &&
      cellFullVoltage > cellEmptyVoltage &&
      cellCapacityAh > 0 &&
      cellMaxCurrentA > 0 &&
      usableDoD > 0 &&
      usableDoD <= 100;

    if (!validInputs) return null;

    const series = Math.max(1, Math.ceil(targetVoltage / cellVoltage));
    const depthOfDischarge = usableDoD / 100;
    const energyPerParallelStringWh = series * cellVoltage * cellCapacityAh * depthOfDischarge;

    if (energyPerParallelStringWh <= 0) return null;

    const parallelByEnergy = Math.max(1, Math.ceil((targetEnergyKWh * 1000) / energyPerParallelStringWh));

    const parallelByCurrent =
      cellMaxCurrentA > 0 && packRequiredCurrentA > 0
        ? Math.max(1, Math.ceil(packRequiredCurrentA / cellMaxCurrentA))
        : 1;

    const parallel = Math.max(parallelByEnergy, parallelByCurrent);
    const totalCells = series * parallel;

    const packNominalVoltage = series * cellVoltage;
    const packMaxVoltage = series * cellFullVoltage;
    const packMinVoltage = series * cellEmptyVoltage;
    const packCapacityAh = parallel * cellCapacityAh;
    const grossEnergyWh = packNominalVoltage * packCapacityAh;
    const usableEnergyWh = grossEnergyWh * depthOfDischarge;
    const maxContinuousCurrent = parallel * cellMaxCurrentA;

    const bmsChecks = {
      lowAboveChemistryMin: bmsLowCutoffV >= packMinVoltage,
      highBelowChemistryMax: bmsHighCutoffV <= packMaxVoltage,
      lowLowerThanHigh: bmsLowCutoffV < bmsHighCutoffV,
      nominalInWindow: packNominalVoltage >= bmsLowCutoffV && packNominalVoltage <= bmsHighCutoffV,
    };

    return {
      series,
      parallel,
      totalCells,
      parallelByEnergy,
      parallelByCurrent,
      packNominalVoltage,
      packMaxVoltage,
      packMinVoltage,
      packCapacityAh,
      cellMaxCurrentA,
      grossEnergyWh,
      usableEnergyWh,
      maxContinuousCurrent,
      bmsChecks,
    };
  }, [targetVoltage, targetEnergyKWh, cellVoltage, cellFullVoltage, cellEmptyVoltage, cellCapacityAh, cRatePreset, customCRate, packRequiredCurrentA, usableDoD, bmsLowCutoffV, bmsHighCutoffV]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Battery Pack Cell Calculator</h1>
        <p className="text-muted-foreground font-medium">
          Estimate how many cells you need in series and parallel for your target pack specs.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <Card className="md:col-span-5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BatteryCharging className="h-5 w-5" />
              Input Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Cell Chemistry
              </Label>
              <Select value={chemistry} onValueChange={(value: ChemistryKey) => handleChemistryChange(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose chemistry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LFP">LFP (3.2V nominal)</SelectItem>
                  <SelectItem value="NMC">NMC (3.7V nominal)</SelectItem>
                  <SelectItem value="LTO">LTO (2.3V nominal)</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Picks typical voltage limits and default usable DoD for that chemistry.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="target-voltage" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Target Pack Voltage (V)
              </Label>
              <Input
                id="target-voltage"
                type="number"
                value={targetVoltage === 0 ? "" : targetVoltage}
                onChange={(e) => setTargetVoltage(parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Desired nominal pack voltage, for example 48V, 60V, or 72V class systems.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="target-energy" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Required Usable Energy (kWh)
              </Label>
              <Input
                id="target-energy"
                type="number"
                value={targetEnergyKWh === 0 ? "" : targetEnergyKWh}
                onChange={(e) => setTargetEnergyKWh(parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Energy you want to actually use in normal operation, not total stored energy.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="cell-voltage" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Cell Voltage (V)
                </Label>
                <Input
                  id="cell-voltage"
                  type="number"
                  value={cellVoltage === 0 ? "" : cellVoltage}
                  onChange={(e) => setCellVoltage(parseFloat(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">
                  Nominal voltage per cell used to calculate required series count.
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cell-capacity" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Cell Capacity (Ah)
                </Label>
                <Input
                  id="cell-capacity"
                  type="number"
                  value={cellCapacityAh === 0 ? "" : cellCapacityAh}
                  onChange={(e) => setCellCapacityAh(parseFloat(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">
                  Charge capacity per cell. Higher Ah increases pack energy per parallel string.
                </p>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="cell-full-voltage" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Cell Full Voltage (V)
                </Label>
                <Input
                  id="cell-full-voltage"
                  type="number"
                  disabled={!advancedBmsUnlocked}
                  value={cellFullVoltage === 0 ? "" : cellFullVoltage}
                  onChange={(e) => setCellFullVoltage(parseFloat(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum per-cell voltage near 100% charge, used for pack max voltage checks.
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cell-empty-voltage" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Cell Empty Voltage (V)
                </Label>
                <Input
                  id="cell-empty-voltage"
                  type="number"
                  disabled={!advancedBmsUnlocked}
                  value={cellEmptyVoltage === 0 ? "" : cellEmptyVoltage}
                  onChange={(e) => setCellEmptyVoltage(parseFloat(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum per-cell voltage at low state of charge, used for pack low-voltage checks.
                </p>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Cell Max Discharge (C-Rate)
                </Label>
                <Select value={cRatePreset} onValueChange={(value: "0.5" | "1" | "2" | "3" | "5" | "custom") => setCRatePreset(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose C-rate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">0.5C (gentle)</SelectItem>
                    <SelectItem value="1">1C (typical)</SelectItem>
                    <SelectItem value="2">2C (strong)</SelectItem>
                    <SelectItem value="3">3C (high)</SelectItem>
                    <SelectItem value="5">5C (very high)</SelectItem>
                    <SelectItem value="custom">Custom C-rate</SelectItem>
                  </SelectContent>
                </Select>
                {cRatePreset === "custom" ? (
                  <Input
                    id="cell-c-rate-custom"
                    type="number"
                    value={customCRate === 0 ? "" : customCRate}
                    onChange={(e) => setCustomCRate(parseFloat(e.target.value) || 0)}
                  />
                ) : null}
                <p className="text-xs text-muted-foreground">
                  1C = {cellCapacityAh.toFixed(1)}A for this cell. Effective max: {((cRatePreset === "custom" ? customCRate : parseFloat(cRatePreset)) * cellCapacityAh).toFixed(1)}A
                </p>
                <p className="text-xs text-muted-foreground">
                  C-rate controls how much current each cell can safely deliver continuously.
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="required-current" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Required Pack Current (A)
                </Label>
                <Input
                  id="required-current"
                  type="number"
                  disabled={!advancedBmsUnlocked}
                  value={packRequiredCurrentA === 0 ? "" : packRequiredCurrentA}
                  onChange={(e) => setPackRequiredCurrentA(parseFloat(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">
                  Expected peak or continuous current demand from motor/inverter/load.
                </p>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="usable-dod" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Usable Depth of Discharge (%)
              </Label>
              <Input
                id="usable-dod"
                type="number"
                min={1}
                max={100}
                value={usableDoD === 0 ? "" : usableDoD}
                onChange={(e) => setUsableDoD(parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Percentage of total pack energy you plan to use (for example 85-95%).
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="bms-low" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  BMS Low Cutoff (V)
                </Label>
                <Input
                  id="bms-low"
                  type="number"
                  disabled={!advancedBmsUnlocked}
                  value={bmsLowCutoffV === 0 ? "" : bmsLowCutoffV}
                  onChange={(e) => setBmsLowCutoffV(parseFloat(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">
                  Pack voltage where discharge should stop to protect cells from deep discharge.
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bms-high" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  BMS High Cutoff (V)
                </Label>
                <Input
                  id="bms-high"
                  type="number"
                  disabled={!advancedBmsUnlocked}
                  value={bmsHighCutoffV === 0 ? "" : bmsHighCutoffV}
                  onChange={(e) => setBmsHighCutoffV(parseFloat(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">
                  Pack voltage where charging should stop to protect cells from overvoltage.
                </p>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Advanced BMS Editing</p>
                  <p className="text-xs text-muted-foreground">
                    Keep off unless you understand chemistry voltage limits and BMS protection strategy.
                  </p>
                </div>
                <Toggle
                  id="advanced-bms-toggle"
                  pressed={advancedBmsUnlocked}
                  onPressedChange={setAdvancedBmsUnlocked}
                  aria-label="Unlock advanced BMS voltage editing"
                />
              </div>
              {!advancedBmsUnlocked && (
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  BMS cutoff fields are locked to prevent accidental changes.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-7 space-y-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-8 pb-8 text-center space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Recommended Configuration</p>
              <p className="text-5xl font-black tabular-nums">
                {result ? `${result.series}S${result.parallel}P` : "-"}
              </p>
              <p className="text-sm text-muted-foreground">
                {result ? `${result.totalCells} total cells` : "Enter valid values to calculate"}
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-dashed shadow-none">
              <CardContent className="pt-6 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Layers3 className="h-4 w-4" />
                  <p className="text-xs font-bold uppercase tracking-wider">Series / Parallel</p>
                </div>
                <p className="text-xl font-bold tabular-nums">
                  {result ? `${result.series}S / ${result.parallel}P` : "-"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Energy needs {result ? `${result.parallelByEnergy}P` : "-"}, current needs {result ? `${result.parallelByCurrent}P` : "-"}
                </p>
              </CardContent>
            </Card>

            <Card className="border-dashed shadow-none">
              <CardContent className="pt-6 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Zap className="h-4 w-4" />
                  <p className="text-xs font-bold uppercase tracking-wider">Nominal Pack Specs</p>
                </div>
                <p className="text-xl font-bold tabular-nums">
                  {result ? `${result.packNominalVoltage.toFixed(1)} V` : "-"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {result ? `${result.packCapacityAh.toFixed(1)} Ah` : "-"}
                </p>
              </CardContent>
            </Card>

            <Card className="border-dashed shadow-none">
              <CardContent className="pt-6 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BatteryCharging className="h-4 w-4" />
                  <p className="text-xs font-bold uppercase tracking-wider">Pack Energy</p>
                </div>
                <p className="text-xl font-bold tabular-nums">
                  {result ? `${(result.grossEnergyWh / 1000).toFixed(2)} kWh` : "-"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Usable: {result ? `${(result.usableEnergyWh / 1000).toFixed(2)} kWh` : "-"}
                </p>
              </CardContent>
            </Card>

            <Card className="border-dashed shadow-none">
              <CardContent className="pt-6 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Gauge className="h-4 w-4" />
                  <p className="text-xs font-bold uppercase tracking-wider">Current Capability</p>
                </div>
                <p className="text-xl font-bold tabular-nums">
                  {result ? `${result.maxContinuousCurrent.toFixed(1)} A` : "-"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Based on C-rate and parallel strings.
                </p>
              </CardContent>
            </Card>

            <Card className="border-dashed shadow-none sm:col-span-2">
              <CardContent className="pt-6 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BatteryCharging className="h-4 w-4" />
                  <p className="text-xs font-bold uppercase tracking-wider">BMS Voltage Window Check</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Chemistry window: {result ? `${result.packMinVoltage.toFixed(1)}V - ${result.packMaxVoltage.toFixed(1)}V` : "-"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Your BMS window: {`${bmsLowCutoffV.toFixed(1)}V - ${bmsHighCutoffV.toFixed(1)}V`}
                </p>
                {result && (
                  <div className="text-xs space-y-1">
                    <p className={result.bmsChecks.lowAboveChemistryMin ? "text-emerald-600" : "text-red-600"}>
                      {result.bmsChecks.lowAboveChemistryMin ? "PASS" : "FAIL"}: Low cutoff should not be below chemistry minimum.
                    </p>
                    <p className={result.bmsChecks.highBelowChemistryMax ? "text-emerald-600" : "text-red-600"}>
                      {result.bmsChecks.highBelowChemistryMax ? "PASS" : "FAIL"}: High cutoff should not exceed chemistry maximum.
                    </p>
                    <p className={result.bmsChecks.lowLowerThanHigh ? "text-emerald-600" : "text-red-600"}>
                      {result.bmsChecks.lowLowerThanHigh ? "PASS" : "FAIL"}: Low cutoff must be lower than high cutoff.
                    </p>
                    <p className={result.bmsChecks.nominalInWindow ? "text-emerald-600" : "text-amber-600"}>
                      {result.bmsChecks.nominalInWindow ? "PASS" : "CHECK"}: Nominal voltage should sit inside the BMS window.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="pt-5">
              <p className="text-sm text-amber-900 dark:text-amber-200">
                This calculator gives a nominal estimate for cell count and configuration. Confirm chemistry limits, C-rate,
                voltage sag, thermal behavior, and BMS constraints before building a real pack.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
