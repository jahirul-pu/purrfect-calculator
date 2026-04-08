import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { AlertTriangle, BatteryCharging, CheckCircle2, ChevronDown, Info, Layers3, XCircle, Zap } from "lucide-react";

type ChemistryKey = "LFP" | "NMC" | "LTO" | "Custom";
type ValidationState = "valid" | "risky" | "invalid";
type AlertLevel = "warning" | "danger";

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
  const [changedMetrics, setChangedMetrics] = useState<Record<string, boolean>>({});
  const previousMetricsRef = useRef<Record<string, string>>({});

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

    const whyConfiguration = `${series} cells in series to reach ${packNominalVoltage.toFixed(1)}V, and ${parallel} in parallel to satisfy both energy (${parallelByEnergy}P minimum) and current (${parallelByCurrent}P minimum).`;

    const buildAlternative = (candidateSeries: number) => {
      if (candidateSeries <= 0 || candidateSeries === series) return null;

      const candidateEnergyPerParallelWh = candidateSeries * cellVoltage * cellCapacityAh * depthOfDischarge;
      if (candidateEnergyPerParallelWh <= 0) return null;

      const candidateParallelByEnergy = Math.max(1, Math.ceil((targetEnergyKWh * 1000) / candidateEnergyPerParallelWh));
      const candidateParallelByCurrent =
        cellMaxCurrentA > 0 && packRequiredCurrentA > 0
          ? Math.max(1, Math.ceil(packRequiredCurrentA / cellMaxCurrentA))
          : 1;

      const candidateParallel = Math.max(candidateParallelByEnergy, candidateParallelByCurrent);
      const candidateNominalVoltage = candidateSeries * cellVoltage;
      const voltageDeltaPct = ((candidateNominalVoltage - packNominalVoltage) / packNominalVoltage) * 100;

      if (Math.abs(voltageDeltaPct) > 15) return null;

      const currentDelta = candidateParallel - parallel;
      const currentNote =
        currentDelta > 0
          ? "higher current headroom"
          : currentDelta < 0
            ? "lower current headroom"
            : "similar current headroom";

      const voltageNote =
        voltageDeltaPct < -1
          ? "slightly lower voltage"
          : voltageDeltaPct > 1
            ? "slightly higher voltage"
            : "similar voltage";

      return {
        series: candidateSeries,
        parallel: candidateParallel,
        label: `${candidateSeries}S${candidateParallel}P`,
        note: `${currentNote}, ${voltageNote}`,
      };
    };

    const alternatives = [buildAlternative(series - 1), buildAlternative(series + 1)].filter(Boolean) as {
      series: number;
      parallel: number;
      label: string;
      note: string;
    }[];

    const alternativeSuggestion = alternatives[0] ?? null;

    const validationItems: { label: string; message: string; state: ValidationState }[] = [
      {
        label: "Low Cutoff",
        message: "Low cutoff should not be below chemistry minimum.",
        state: bmsChecks.lowAboveChemistryMin ? "valid" : "invalid",
      },
      {
        label: "High Cutoff",
        message: "High cutoff should not exceed chemistry maximum.",
        state: bmsChecks.highBelowChemistryMax ? "valid" : "invalid",
      },
      {
        label: "Cutoff Order",
        message: "Low cutoff must be lower than high cutoff.",
        state: bmsChecks.lowLowerThanHigh ? "valid" : "invalid",
      },
      {
        label: "Nominal Position",
        message: "Nominal voltage should sit inside the BMS window.",
        state: bmsChecks.nominalInWindow ? "valid" : "risky",
      },
    ];

    const contextualAlerts: { level: AlertLevel; message: string }[] = [];
    const currentLoadRatio = packRequiredCurrentA > 0 ? packRequiredCurrentA / maxContinuousCurrent : 0;
    const lowMarginV = bmsLowCutoffV - packMinVoltage;
    const highMarginV = packMaxVoltage - bmsHighCutoffV;

    if (currentLoadRatio >= 1) {
      contextualAlerts.push({
        level: "danger",
        message: "Your current demand exceeds estimated continuous cell capability. Increase parallel strings or reduce load.",
      });
    } else if (currentLoadRatio >= 0.85) {
      contextualAlerts.push({
        level: "warning",
        message: "Your current demand is near the cell limit. Consider extra parallel headroom for thermal and aging margin.",
      });
    }

    if (lowMarginV < 0 || highMarginV < 0) {
      contextualAlerts.push({
        level: "danger",
        message: "BMS cutoff is outside the chemistry-safe range. Recheck low/high cutoff settings.",
      });
    } else if (lowMarginV <= 0.5 || highMarginV <= 0.5) {
      contextualAlerts.push({
        level: "warning",
        message: "BMS cutoff is close to the unsafe range. Add more voltage margin to reduce risk.",
      });
    }

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
      whyConfiguration,
      alternativeSuggestion,
      validationItems,
      contextualAlerts,
    };
  }, [targetVoltage, targetEnergyKWh, cellVoltage, cellFullVoltage, cellEmptyVoltage, cellCapacityAh, cRatePreset, customCRate, packRequiredCurrentA, usableDoD, bmsLowCutoffV, bmsHighCutoffV]);

  const validationStyleMap: Record<ValidationState, { icon: React.ReactNode; chipClass: string; label: string }> = {
    valid: {
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      chipClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
      label: "Valid",
    },
    risky: {
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
      chipClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
      label: "Risky",
    },
    invalid: {
      icon: <XCircle className="h-3.5 w-3.5" />,
      chipClass: "bg-red-500/15 text-red-700 dark:text-red-300",
      label: "Invalid",
    },
  };

  const clampPercent = (value: number) => Math.min(100, Math.max(0, value));
  const usableEnergyPercent = result
    ? clampPercent((result.usableEnergyWh / result.grossEnergyWh) * 100)
    : 0;
  const bufferEnergyPercent = result ? 100 - usableEnergyPercent : 0;
  const nominalVoltagePercent = result
    ? clampPercent(((result.packNominalVoltage - result.packMinVoltage) / (result.packMaxVoltage - result.packMinVoltage)) * 100)
    : 0;
  const bmsLowPercent = result
    ? clampPercent(((bmsLowCutoffV - result.packMinVoltage) / (result.packMaxVoltage - result.packMinVoltage)) * 100)
    : 0;
  const bmsHighPercent = result
    ? clampPercent(((bmsHighCutoffV - result.packMinVoltage) / (result.packMaxVoltage - result.packMinVoltage)) * 100)
    : 0;

  const interactiveInputClass = "transition-all duration-200 focus-visible:ring-2 focus-visible:ring-sky-300/70 focus-visible:border-sky-300 hover:border-slate-300 dark:hover:border-slate-500";
  const hoverableCardClass = "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md";

  useEffect(() => {
    if (!result) return;

    const tracked: Record<string, string> = {
      config: `${result.series}S${result.parallel}P`,
      nominalVoltage: result.packNominalVoltage.toFixed(1),
      capacityAh: result.packCapacityAh.toFixed(1),
      grossEnergy: (result.grossEnergyWh / 1000).toFixed(2),
      usableEnergy: (result.usableEnergyWh / 1000).toFixed(2),
      currentCapability: result.maxContinuousCurrent.toFixed(1),
    };

    const changedKeys = Object.keys(tracked).filter(
      (key) => previousMetricsRef.current[key] !== undefined && previousMetricsRef.current[key] !== tracked[key]
    );

    if (changedKeys.length > 0) {
      setChangedMetrics((prev) => {
        const next = { ...prev };
        for (const key of changedKeys) next[key] = true;
        return next;
      });

      for (const key of changedKeys) {
        window.setTimeout(() => {
          setChangedMetrics((prev) => ({ ...prev, [key]: false }));
        }, 850);
      }
    }

    previousMetricsRef.current = tracked;
  }, [result]);

  const flashClass = (metricKey: string) =>
    changedMetrics[metricKey]
      ? "rounded-md bg-amber-100/70 px-2 py-0.5 ring-1 ring-amber-300/80 transition-all dark:bg-amber-500/15 dark:ring-amber-500/40"
      : "rounded-md px-2 py-0.5 transition-all";

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Battery Pack Cell Calculator</h1>
        <p className="text-muted-foreground font-medium">
          Estimate how many cells you need in series and parallel for your target pack specs.
        </p>
      </div>

      <div className="space-y-6">
        <Card className="bg-gray-50 border-transparent shadow-none dark:bg-slate-900/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BatteryCharging className="h-5 w-5" />
              Input Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <details open className="group rounded-xl border border-gray-200 bg-white/85 dark:bg-slate-900/40 dark:border-slate-700">
              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3">
                <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Cell Configuration</p>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <div className="space-y-4 border-t border-gray-200 px-4 py-4 dark:border-slate-700">
                <div className="grid gap-2">
                  <div className="flex items-center gap-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cell Chemistry</Label>
                    <button type="button" aria-label="Chemistry preset info" title="Picks typical voltage limits and default usable depth of discharge for this chemistry.">
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </div>
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
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="cell-voltage" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cell Voltage (V)</Label>
                      <button type="button" aria-label="Cell voltage info" title="Nominal voltage per cell used to calculate the required series count.">
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>
                    <Input
                      id="cell-voltage"
                      type="number"
                      value={cellVoltage === 0 ? "" : cellVoltage}
                      className={interactiveInputClass}
                      onChange={(e) => setCellVoltage(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="cell-capacity" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cell Capacity (Ah)</Label>
                      <button type="button" aria-label="Cell capacity info" title="Capacity per cell. Higher Ah increases pack energy per parallel string.">
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>
                    <Input
                      id="cell-capacity"
                      type="number"
                      value={cellCapacityAh === 0 ? "" : cellCapacityAh}
                      className={interactiveInputClass}
                      onChange={(e) => setCellCapacityAh(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center gap-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cell Max Discharge (C-Rate)</Label>
                    <button type="button" aria-label="C-rate info" title="C-rate controls continuous discharge current. 1C equals the cell's Ah value in amps.">
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </div>
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
                      className={interactiveInputClass}
                      onChange={(e) => setCustomCRate(parseFloat(e.target.value) || 0)}
                    />
                  ) : null}
                  <p className="text-xs text-muted-foreground">
                    Effective max current: {((cRatePreset === "custom" ? customCRate : parseFloat(cRatePreset)) * cellCapacityAh).toFixed(1)}A
                  </p>
                </div>
              </div>
            </details>

            <details open className="group rounded-xl border border-gray-200 bg-white/85 dark:bg-slate-900/40 dark:border-slate-700">
              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3">
                <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Energy Requirements</p>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <div className="space-y-4 border-t border-gray-200 px-4 py-4 dark:border-slate-700">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="target-voltage" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target Pack Voltage (V)</Label>
                      <button type="button" aria-label="Target voltage info" title="Desired nominal pack voltage, such as 48V, 60V, or 72V class systems.">
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>
                    <Input
                      id="target-voltage"
                      type="number"
                      value={targetVoltage === 0 ? "" : targetVoltage}
                      className={interactiveInputClass}
                      onChange={(e) => setTargetVoltage(parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="target-energy" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Required Usable Energy (kWh)</Label>
                      <button type="button" aria-label="Usable energy info" title="Energy you want to use in operation, not total stored energy.">
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>
                    <Input
                      id="target-energy"
                      type="number"
                      value={targetEnergyKWh === 0 ? "" : targetEnergyKWh}
                      className={interactiveInputClass}
                      onChange={(e) => setTargetEnergyKWh(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="usable-dod" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Usable Depth of Discharge (%)</Label>
                      <button type="button" aria-label="Usable depth of discharge info" title="Percentage of total pack energy planned for normal use.">
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>
                    <Input
                      id="usable-dod"
                      type="number"
                      min={1}
                      max={100}
                      value={usableDoD === 0 ? "" : usableDoD}
                      className={interactiveInputClass}
                      onChange={(e) => setUsableDoD(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            </details>

            <details className="group rounded-xl border border-gray-200 bg-white/85 dark:bg-slate-900/40 dark:border-slate-700">
              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3">
                <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Safety / BMS</p>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <div className="space-y-4 border-t border-gray-200 px-4 py-4 dark:border-slate-700">
                <div className="rounded-lg border border-transparent bg-gray-100 p-3 space-y-3 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">Advanced BMS Editing</p>
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
                      BMS cutoff fields are locked.
                    </p>
                  )}
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="required-current" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Required Pack Current (A)</Label>
                      <button type="button" aria-label="Required current info" title="Expected current demand from your load. Unlock advanced mode to edit.">
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>
                    <Input
                      id="required-current"
                      type="number"
                      disabled={!advancedBmsUnlocked}
                      value={packRequiredCurrentA === 0 ? "" : packRequiredCurrentA}
                      className={interactiveInputClass}
                      onChange={(e) => setPackRequiredCurrentA(parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="cell-full-voltage" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cell Full Voltage (V)</Label>
                      <button type="button" aria-label="Cell full voltage info" title="Maximum per-cell voltage near full charge, used for pack max voltage checks.">
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>
                    <Input
                      id="cell-full-voltage"
                      type="number"
                      disabled={!advancedBmsUnlocked}
                      value={cellFullVoltage === 0 ? "" : cellFullVoltage}
                      className={interactiveInputClass}
                      onChange={(e) => setCellFullVoltage(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="cell-empty-voltage" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cell Empty Voltage (V)</Label>
                      <button type="button" aria-label="Cell empty voltage info" title="Minimum per-cell voltage at low state of charge, used for low-voltage checks.">
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>
                    <Input
                      id="cell-empty-voltage"
                      type="number"
                      disabled={!advancedBmsUnlocked}
                      value={cellEmptyVoltage === 0 ? "" : cellEmptyVoltage}
                      className={interactiveInputClass}
                      onChange={(e) => setCellEmptyVoltage(parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="bms-low" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">BMS Low Cutoff (V)</Label>
                      <button type="button" aria-label="BMS low cutoff info" title="Discharge stop voltage to protect cells from deep discharge.">
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>
                    <Input
                      id="bms-low"
                      type="number"
                      disabled={!advancedBmsUnlocked}
                      value={bmsLowCutoffV === 0 ? "" : bmsLowCutoffV}
                      className={interactiveInputClass}
                      onChange={(e) => setBmsLowCutoffV(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="bms-high" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">BMS High Cutoff (V)</Label>
                      <button type="button" aria-label="BMS high cutoff info" title="Charge stop voltage to protect cells from over-voltage.">
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>
                    <Input
                      id="bms-high"
                      type="number"
                      disabled={!advancedBmsUnlocked}
                      value={bmsHighCutoffV === 0 ? "" : bmsHighCutoffV}
                      className={interactiveInputClass}
                      onChange={(e) => setBmsHighCutoffV(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            </details>

          </CardContent>
        </Card>

        <Card className={`bg-blue-50 border-blue-200 shadow-sm dark:bg-blue-950/30 dark:border-blue-900/50 ${hoverableCardClass}`}>
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/80">Recommended Configuration</p>
            <div className={`text-6xl font-black tabular-nums tracking-tight sm:text-7xl inline-flex items-baseline ${flashClass("config")}`}>
              {result ? (
                <>
                  <AnimatedNumber value={result.series} duration={700} />
                  <span>S</span>
                  <AnimatedNumber value={result.parallel} duration={700} />
                  <span>P</span>
                </>
              ) : (
                "-"
              )}
            </div>
            <p className="text-sm font-semibold text-muted-foreground sm:text-base">
              {result ? (
                <span className="inline-flex flex-wrap items-center justify-center gap-1.5">
                  <span className={flashClass("nominalVoltage")}>
                    <AnimatedNumber value={result.packNominalVoltage} decimals={1} duration={650} suffix="V" />
                  </span>
                  <span>•</span>
                  <span className={flashClass("capacityAh")}>
                    <AnimatedNumber value={result.packCapacityAh} decimals={0} duration={650} suffix="Ah" />
                  </span>
                  <span>•</span>
                  <span className={flashClass("grossEnergy")}>
                    <AnimatedNumber value={result.grossEnergyWh / 1000} decimals={2} duration={650} suffix=" kWh" />
                  </span>
                </span>
              ) : "Enter valid values to calculate"}
            </p>
            <p className="text-xs text-muted-foreground">
              {result ? `${result.totalCells} total cells` : ""}
            </p>
            {result && (
              <div className="mx-auto max-w-3xl rounded-lg border border-blue-200/70 bg-white/70 p-3 text-left dark:border-blue-900/60 dark:bg-slate-950/40">
                <p className="text-[11px] font-bold uppercase tracking-wider text-primary/80">Why {`${result.series}S${result.parallel}P`}?</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {result.whyConfiguration}
                </p>
                {result.alternativeSuggestion && (
                  <p className="mt-2 text-sm font-medium text-muted-foreground">
                    Alternative: <span className="font-bold text-foreground">{result.alternativeSuggestion.label}</span> ({result.alternativeSuggestion.note})
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Supporting Data</p>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className={`bg-white border-gray-200 shadow-sm dark:bg-slate-950/40 dark:border-slate-800 lg:col-span-2 ${hoverableCardClass}`}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Layers3 className="h-4 w-4" />
                  <p className="text-xs font-bold uppercase tracking-wider">Pack Summary</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-1 dark:bg-slate-900/50 dark:border-slate-700">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Series / Parallel</p>
                    <div className={`text-xl font-bold tabular-nums inline-flex items-baseline ${flashClass("config")}`}>
                      {result ? (
                        <>
                          <AnimatedNumber value={result.series} duration={650} />
                          <span>S / </span>
                          <AnimatedNumber value={result.parallel} duration={650} />
                          <span>P</span>
                        </>
                      ) : "-"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Energy {result ? `${result.parallelByEnergy}P` : "-"} • Current {result ? `${result.parallelByCurrent}P` : "-"}
                    </p>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-1 dark:bg-slate-900/50 dark:border-slate-700">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Nominal Pack Specs</p>
                    <div className={`text-xl font-bold tabular-nums ${flashClass("nominalVoltage")}`}>
                      {result ? <AnimatedNumber value={result.packNominalVoltage} decimals={1} duration={650} suffix=" V" /> : "-"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {result ? <AnimatedNumber value={result.packCapacityAh} decimals={1} duration={650} suffix=" Ah" className={flashClass("capacityAh")} /> : "-"}
                    </p>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-1 dark:bg-slate-900/50 dark:border-slate-700">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Current Capability</p>
                    <div className={`text-xl font-bold tabular-nums ${flashClass("currentCapability")}`}>
                      {result ? <AnimatedNumber value={result.maxContinuousCurrent} decimals={1} duration={650} suffix=" A" /> : "-"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Continuous estimate.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`bg-white border-gray-200 shadow-sm dark:bg-slate-950/40 dark:border-slate-800 ${hoverableCardClass}`}>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Zap className="h-4 w-4" />
                  <p className="text-xs font-bold uppercase tracking-wider">Usable Energy</p>
                </div>
                <div className={`text-xl font-bold tabular-nums ${flashClass("usableEnergy")}`}>
                  {result ? <AnimatedNumber value={result.usableEnergyWh / 1000} decimals={2} duration={650} suffix=" kWh" /> : "-"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Gross: {result ? <AnimatedNumber value={result.grossEnergyWh / 1000} decimals={2} duration={650} suffix=" kWh" className={flashClass("grossEnergy")} /> : "-"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Window: {result ? `${result.packMinVoltage.toFixed(1)}V - ${result.packMaxVoltage.toFixed(1)}V` : "-"}
                </p>

                {result && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2 dark:border-slate-700 dark:bg-slate-900/60">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Usable vs Buffer</p>
                    <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-slate-800">
                      <div className="absolute inset-y-0 left-0 bg-emerald-500" style={{ width: `${usableEnergyPercent}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Usable: {(result.usableEnergyWh / 1000).toFixed(2)} kWh</span>
                      <span>Buffer: {((result.grossEnergyWh - result.usableEnergyWh) / 1000).toFixed(2)} kWh</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{usableEnergyPercent.toFixed(0)}%</span>
                      <span>{bufferEnergyPercent.toFixed(0)}%</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className={`bg-white border-gray-200 shadow-sm dark:bg-slate-950/40 dark:border-slate-800 ${hoverableCardClass}`}>
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
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2 dark:border-slate-700 dark:bg-slate-900/60">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Voltage Range (Min to Max)</p>
                  <div className="relative">
                    <Progress value={100} className="h-3 bg-slate-200 [&>div]:bg-sky-500 dark:bg-slate-800" />
                    <div className="absolute -top-1 h-5 w-0.5 bg-amber-500" style={{ left: `${bmsLowPercent}%` }} />
                    <div className="absolute -top-1 h-5 w-0.5 bg-amber-500" style={{ left: `${bmsHighPercent}%` }} />
                    <div className="absolute -top-1 h-5 w-0.5 bg-primary" style={{ left: `${nominalVoltagePercent}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{result.packMinVoltage.toFixed(1)}V</span>
                    <span>{result.packMaxVoltage.toFixed(1)}V</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                    <span>Amber markers: BMS cutoff range</span>
                    <span>Blue marker: nominal voltage</span>
                  </div>
                </div>
              )}
              {result && (
                <div className="space-y-2">
                  {result.validationItems.map((item) => {
                    const ui = validationStyleMap[item.state];
                    return (
                      <div key={item.label} className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/60">
                        <p className="text-xs text-muted-foreground">{item.message}</p>
                        <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold ${ui.chipClass}`}>
                          {ui.icon}
                          <span>{ui.label}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {result && result.contextualAlerts.length > 0 && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="pt-5 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">Attention Alerts</p>
                {result.contextualAlerts.map((alert, index) => (
                  <div
                    key={`${alert.level}-${index}`}
                    className={
                      alert.level === "danger"
                        ? "rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-800 dark:text-red-300"
                        : "rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-200"
                    }
                  >
                    {alert.level === "danger" ? (
                      <XCircle className="mr-1 inline h-4 w-4 align-text-bottom" />
                    ) : (
                      <AlertTriangle className="mr-1 inline h-4 w-4 align-text-bottom" />
                    )}
                    {alert.message}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
