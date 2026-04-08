import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, User, Info, HeartPulse, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { calculateBMI } from "@/lib/bmiCalc";
import { cn } from "@/lib/utils";

interface BMIFeedback {
  riskLevel: string;
  summary: string;
  guidance: string;
}

interface BodyInsight {
  bodyFatRange: string;
  maintenanceCalories: string;
  targetWeight: string;
  targetDelta: string;
}

type BMIInputState = {
  weightUnit: "kg" | "lb";
  heightUnit: "cm" | "ftin";
  weightValue: string;
  heightCm: string;
  heightFt: string;
  heightInches: string;
};

const BMI_INPUT_STORAGE_KEY = "bmi-calculator-last-input";

const readInitialBMIInputs = (): BMIInputState => {
  const defaultState: BMIInputState = {
    weightUnit: "kg",
    heightUnit: "cm",
    weightValue: "70",
    heightCm: "170",
    heightFt: "5",
    heightInches: "7",
  };

  if (typeof window === "undefined") {
    return defaultState;
  }

  try {
    const raw = window.localStorage.getItem(BMI_INPUT_STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<BMIInputState>;

    return {
      weightUnit: parsed.weightUnit === "lb" ? "lb" : "kg",
      heightUnit: parsed.heightUnit === "ftin" ? "ftin" : "cm",
      weightValue: typeof parsed.weightValue === "string" && parsed.weightValue.length > 0 ? parsed.weightValue : defaultState.weightValue,
      heightCm: typeof parsed.heightCm === "string" && parsed.heightCm.length > 0 ? parsed.heightCm : defaultState.heightCm,
      heightFt: typeof parsed.heightFt === "string" && parsed.heightFt.length > 0 ? parsed.heightFt : defaultState.heightFt,
      heightInches: typeof parsed.heightInches === "string" && parsed.heightInches.length > 0 ? parsed.heightInches : defaultState.heightInches,
    };
  } catch {
    return defaultState;
  }
};

export function BMICalculator() {
  const initialInputs = useMemo(() => readInitialBMIInputs(), []);

  const [weightUnit, setWeightUnit] = useState<"kg" | "lb">(initialInputs.weightUnit);
  const [heightUnit, setHeightUnit] = useState<"cm" | "ftin">(initialInputs.heightUnit);
  const [weightValue, setWeightValue] = useState<string>(initialInputs.weightValue);
  const [heightCm, setHeightCm] = useState<string>(initialInputs.heightCm);
  const [heightFt, setHeightFt] = useState<string>(initialInputs.heightFt);
  const [heightInches, setHeightInches] = useState<string>(initialInputs.heightInches);

  const formatNumber = (value: number) => value.toFixed(1).replace(/\.0$/, "");

  const handleWeightUnitChange = (nextUnit: "kg" | "lb") => {
    if (nextUnit === weightUnit) return;

    const parsedWeight = parseFloat(weightValue);
    if (Number.isFinite(parsedWeight) && parsedWeight > 0) {
      const converted = nextUnit === "lb" ? parsedWeight * 2.20462 : parsedWeight / 2.20462;
      setWeightValue(formatNumber(converted));
    } else if (!weightValue) {
      setWeightValue(nextUnit === "kg" ? "70" : "154.3");
    }

    setWeightUnit(nextUnit);
  };

  const handleHeightUnitChange = (nextUnit: "cm" | "ftin") => {
    if (nextUnit === heightUnit) return;

    if (nextUnit === "ftin") {
      const parsedCm = parseFloat(heightCm);
      if (Number.isFinite(parsedCm) && parsedCm > 0) {
        const totalInches = parsedCm / 2.54;
        const feet = Math.floor(totalInches / 12);
        const inches = totalInches - (feet * 12);
        setHeightFt(String(feet));
        setHeightInches(formatNumber(inches));
      } else if (!heightCm && !heightFt && !heightInches) {
        setHeightFt("5");
        setHeightInches("7");
      }
    } else {
      const parsedFt = parseFloat(heightFt);
      const parsedInches = parseFloat(heightInches);
      const hasImperialInput = Number.isFinite(parsedFt) || Number.isFinite(parsedInches);

      if (hasImperialInput) {
        const safeFt = Number.isFinite(parsedFt) ? parsedFt : 0;
        const safeInches = Number.isFinite(parsedInches) ? parsedInches : 0;
        const convertedCm = (safeFt * 30.48) + (safeInches * 2.54);
        setHeightCm(formatNumber(convertedCm));
      } else if (!heightCm && !heightFt && !heightInches) {
        setHeightCm("170");
      }
    }

    setHeightUnit(nextUnit);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const valueToStore: BMIInputState = {
      weightUnit,
      heightUnit,
      weightValue,
      heightCm,
      heightFt,
      heightInches,
    };
    window.localStorage.setItem(BMI_INPUT_STORAGE_KEY, JSON.stringify(valueToStore));
  }, [weightUnit, heightUnit, weightValue, heightCm, heightFt, heightInches]);

  const result = useMemo(() => {
    const parsedWeight = parseFloat(weightValue);
    const parsedHeightCm = parseFloat(heightCm);
    const parsedHeightFt = parseFloat(heightFt);
    const parsedHeightInches = parseFloat(heightInches);

    const safeWeight = Number.isFinite(parsedWeight) ? parsedWeight : 0;
    const safeHeightCm = Number.isFinite(parsedHeightCm) ? parsedHeightCm : 0;
    const safeHeightFt = Number.isFinite(parsedHeightFt) ? parsedHeightFt : 0;
    const safeHeightInches = Number.isFinite(parsedHeightInches) ? parsedHeightInches : 0;

    const weightKg = weightUnit === "kg" ? safeWeight : safeWeight * 0.453592;
    const resolvedHeightCm = heightUnit === "cm"
      ? safeHeightCm
      : (safeHeightFt * 30.48) + (safeHeightInches * 2.54);
    return calculateBMI(weightKg, resolvedHeightCm);
  }, [weightUnit, weightValue, heightUnit, heightCm, heightFt, heightInches]);

  const idealRangeDisplay = useMemo(() => {
    if (result.minIdealKg <= 0 || result.maxIdealKg <= 0) return "";
    if (weightUnit === "kg") {
      return `${result.minIdealKg.toFixed(1)} kg - ${result.maxIdealKg.toFixed(1)} kg`;
    }

    const minLb = result.minIdealKg * 2.20462;
    const maxLb = result.maxIdealKg * 2.20462;
    return `${minLb.toFixed(1)} lb - ${maxLb.toFixed(1)} lb`;
  }, [result.minIdealKg, result.maxIdealKg, weightUnit]);

  const idealRangePosition = useMemo(() => {
    if (result.minIdealKg <= 0 || result.maxIdealKg <= 0) {
      return {
        canRender: false,
        min: 0,
        max: 0,
        scaleMin: 0,
        scaleMax: 0,
        current: 0,
        positionPct: 0,
        labelPct: 0,
        zoneStartPct: 0,
        zoneWidthPct: 0,
        insight: "",
      };
    }

    const currentWeight = parseFloat(weightValue);
    if (!Number.isFinite(currentWeight) || currentWeight <= 0) {
      return {
        canRender: false,
        min: 0,
        max: 0,
        scaleMin: 0,
        scaleMax: 0,
        current: 0,
        positionPct: 0,
        labelPct: 0,
        zoneStartPct: 0,
        zoneWidthPct: 0,
        insight: "",
      };
    }

    const min = weightUnit === "kg" ? result.minIdealKg : result.minIdealKg * 2.20462;
    const max = weightUnit === "kg" ? result.maxIdealKg : result.maxIdealKg * 2.20462;

    const baseSpan = Math.max(max - min, 0.1);
    const belowDistance = Math.max(0, min - currentWeight);
    const aboveDistance = Math.max(0, currentWeight - max);
    const extension = Math.max(baseSpan * 0.35, belowDistance * 2, aboveDistance * 2);

    const displayMin = min - extension;
    const displayMax = max + extension;
    const displaySpan = Math.max(displayMax - displayMin, 0.1);

    const positionPct = ((currentWeight - displayMin) / displaySpan) * 100;
    const zoneStartPct = ((min - displayMin) / displaySpan) * 100;
    const zoneEndPct = ((max - displayMin) / displaySpan) * 100;
    const zoneWidthPct = Math.max(zoneEndPct - zoneStartPct, 1);
    const labelPct = Math.min(Math.max(positionPct, 7), 93);

    let insight = "You are near the middle of the healthy range";
    if (currentWeight < min) {
      insight = "You are currently below the healthy range";
    } else if (currentWeight > max) {
      insight = "You are currently above the healthy range";
    } else if (positionPct >= 60) {
      insight = "You are near the upper half of the healthy range";
    } else if (positionPct <= 40) {
      insight = "You are near the lower half of the healthy range";
    }

    return {
      canRender: true,
      min,
      max,
      scaleMin: displayMin,
      scaleMax: displayMax,
      current: currentWeight,
      positionPct,
      labelPct,
      zoneStartPct,
      zoneWidthPct,
      insight,
    };
  }, [result.minIdealKg, result.maxIdealKg, weightUnit, weightValue]);

  const hasValidResult = result.bmi > 0;

  const healthState = useMemo(() => {
    if (!hasValidResult) {
      return {
        label: "Awaiting Input",
        toneClass: "text-muted-foreground bg-muted",
        icon: <Info className="h-5 w-5" />,
        microContext: "Enter valid height and weight to get your health state.",
        thresholdContext: "",
      };
    }

    if (result.category === "Normal") {
      const diffToOverweight = Math.max(0, 25 - result.bmi);
      const diffToUnderweight = Math.max(0, result.bmi - 18.5);
      const microContext = diffToOverweight >= 2
        ? "Well within optimal range"
        : "Near upper edge of the healthy range";

      return {
        label: "Healthy Range",
        toneClass: "text-emerald-700 bg-emerald-500/10",
        icon: <CheckCircle2 className="h-5 w-5" />,
        microContext,
        thresholdContext: `+${diffToOverweight.toFixed(1)} to overweight • -${diffToUnderweight.toFixed(1)} to underweight`,
      };
    }

    if (result.category === "Underweight") {
      const diffToNormal = Math.max(0, 18.5 - result.bmi);
      return {
        label: "Below Healthy Range",
        toneClass: "text-blue-700 bg-blue-500/10",
        icon: <AlertTriangle className="h-5 w-5" />,
        microContext: "Below optimal range",
        thresholdContext: `+${diffToNormal.toFixed(1)} to healthy threshold (18.5)`,
      };
    }

    if (result.category === "Overweight") {
      const aboveThreshold = Math.max(0, result.bmi - 25);
      const toObese = Math.max(0, 30 - result.bmi);
      return {
        label: "Above Healthy Range",
        toneClass: "text-amber-700 bg-amber-500/10",
        icon: <AlertTriangle className="h-5 w-5" />,
        microContext: "Moderately above optimal range",
        thresholdContext: `+${aboveThreshold.toFixed(1)} above overweight • ${toObese.toFixed(1)} to obesity threshold`,
      };
    }

    const aboveObeseThreshold = Math.max(0, result.bmi - 30);
    return {
      label: "High-Risk Range",
      toneClass: "text-rose-700 bg-rose-500/10",
      icon: <XCircle className="h-5 w-5" />,
      microContext: "Significantly above optimal range",
      thresholdContext: `+${aboveObeseThreshold.toFixed(1)} above obesity threshold`,
    };
  }, [hasValidResult, result.bmi, result.category]);

  const medicalFeedback = useMemo((): BMIFeedback => {
    if (!hasValidResult) {
      return {
        riskLevel: "N/A",
        summary: "Enter valid height and weight to generate BMI interpretation.",
        guidance: "For adults, BMI categories are interpreted using standard clinical cutoffs.",
      };
    }

    if (result.category === "Underweight") {
      return {
        riskLevel: "Moderate",
        summary: "BMI below 18.5 may be associated with undernutrition, low muscle mass, or underlying illness.",
        guidance: "Consider nutrition optimization and discuss persistent low BMI with a clinician, especially if there is weight loss or fatigue.",
      };
    }

    if (result.category === "Normal") {
      const distanceToUpper = 25 - result.bmi;
      const distanceToLower = result.bmi - 18.5;

      let personalizedGuidance = `You are ${distanceToUpper.toFixed(1)} BMI below overweight and ${distanceToLower.toFixed(1)} BMI above underweight. Keep a stable routine to stay centered in the healthy range.`;
      if (distanceToUpper <= 1.5) {
        personalizedGuidance = `You are only ${distanceToUpper.toFixed(1)} BMI away from overweight. Consider maintaining your current weight to avoid crossing that threshold.`;
      } else if (distanceToLower <= 1.5) {
        personalizedGuidance = `You are only ${distanceToLower.toFixed(1)} BMI above underweight. Focus on consistent nutrition and strength-supporting habits to stay within the healthy range.`;
      }

      return {
        riskLevel: "Lower",
        summary: "BMI 18.5-24.9 is generally associated with lower cardiometabolic risk for most adults.",
        guidance: personalizedGuidance,
      };
    }

    if (result.category === "Overweight") {
      return {
        riskLevel: "Elevated",
        summary: "BMI 25.0-29.9 is associated with higher risk of hypertension, type 2 diabetes, and cardiovascular disease over time.",
        guidance: "Even a 5-10% weight reduction can improve blood pressure, glucose control, and lipid profile.",
      };
    }

    return {
      riskLevel: "High",
      summary: "BMI 30 or above is associated with substantially increased cardiometabolic and musculoskeletal risk.",
      guidance: "A clinician-guided plan can help: nutrition, activity, behavior support, and where appropriate, obesity-focused medical treatment.",
    };
  }, [hasValidResult, result.bmi, result.category]);

  const bodyInsight = useMemo((): BodyInsight => {
    if (!hasValidResult) {
      return {
        bodyFatRange: "N/A",
        maintenanceCalories: "N/A",
        targetWeight: "N/A",
        targetDelta: "",
      };
    }

    const parsedWeight = parseFloat(weightValue);
    const safeWeight = Number.isFinite(parsedWeight) ? parsedWeight : 0;
    const currentWeightKg = weightUnit === "kg" ? safeWeight : safeWeight * 0.453592;

    const bodyFatRange = result.bmi < 18.5
      ? "~10-18% (rough estimate)"
      : result.bmi < 25
        ? "~18-24% (rough estimate)"
        : result.bmi < 30
          ? "~25-31% (rough estimate)"
          : "~32-40% (rough estimate)";

    const maintenanceLow = Math.round((currentWeightKg * 28) / 10) * 10;
    const maintenanceHigh = Math.round((currentWeightKg * 33) / 10) * 10;
    const maintenanceCalories = `${maintenanceLow}-${maintenanceHigh} kcal/day`;

    const targetKg = (result.minIdealKg + result.maxIdealKg) / 2;
    const targetDisplay = weightUnit === "kg"
      ? `${targetKg.toFixed(1)} kg`
      : `${(targetKg * 2.20462).toFixed(1)} lb`;

    const deltaKg = targetKg - currentWeightKg;
    const deltaDisplay = weightUnit === "kg"
      ? `${Math.abs(deltaKg).toFixed(1)} kg`
      : `${Math.abs(deltaKg * 2.20462).toFixed(1)} lb`;

    const targetDelta = Math.abs(deltaKg) < 0.15
      ? "You are already near this target"
      : deltaKg > 0
        ? `Suggested: +${deltaDisplay} from current`
        : `Suggested: -${deltaDisplay} from current`;

    return {
      bodyFatRange,
      maintenanceCalories,
      targetWeight: targetDisplay,
      targetDelta,
    };
  }, [hasValidResult, result.bmi, result.minIdealKg, result.maxIdealKg, weightUnit, weightValue]);

  // Map BMI 15-40 to Progress 0-100
  const progressValue = Math.min(Math.max(((result.bmi - 15) / (40 - 15)) * 100, 0), 100);
  const underweightEndPct = ((18.5 - 15) / (40 - 15)) * 100;
  const normalEndPct = ((25 - 15) / (40 - 15)) * 100;
  const overweightEndPct = ((30 - 15) / (40 - 15)) * 100;

  const isUnderweight = result.category === "Underweight";
  const isNormal = result.category === "Normal";
  const isOverweight = result.category === "Overweight";
  const isObese = result.category === "Obese";

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Underweight": return "text-blue-500 bg-blue-500/10";
      case "Normal": return "text-emerald-500 bg-emerald-500/10";
      case "Overweight": return "text-amber-500 bg-amber-500/10";
      case "Obese": return "text-rose-500 bg-rose-500/10";
      default: return "text-muted-foreground bg-muted";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">BMI Calculator</h1>
        <p className="text-muted-foreground font-medium">Body Mass Index and healthy weight analysis.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" /> Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Weight Unit</Label>
                <Select value={weightUnit} onValueChange={(v: "kg" | "lb") => handleWeightUnitChange(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="lb">lb</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="weight-input" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Weight ({weightUnit})
                </Label>
                <Input
                  id="weight-input"
                  type="number"
                  value={weightValue}
                  onChange={(e) => setWeightValue(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Height Unit</Label>
                <Select value={heightUnit} onValueChange={(v: "cm" | "ftin") => handleHeightUnitChange(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cm">cm</SelectItem>
                    <SelectItem value="ftin">ft + in</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {heightUnit === "cm" ? (
                <div className="grid gap-2">
                  <Label htmlFor="height-cm" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Height (cm)</Label>
                  <Input
                    id="height-cm"
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="height-ft" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Feet</Label>
                    <Input
                      id="height-ft"
                      type="number"
                      value={heightFt}
                      onChange={(e) => setHeightFt(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="height-in" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Inches</Label>
                    <Input
                      id="height-in"
                      type="number"
                      value={heightInches}
                      onChange={(e) => setHeightInches(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-7">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <HeartPulse className="h-4 w-4" /> Health Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className={cn("mx-auto max-w-xl rounded-xl px-6 py-5 text-center", healthState.toneClass)}>
                <div className="flex items-center justify-center gap-2">
                  {healthState.icon}
                  <p className="text-sm font-bold uppercase tracking-wider">{healthState.label}</p>
                </div>
                <p className="mt-3 text-4xl font-black">
                  BMI: <span className="tabular-nums">{result.bmi}</span>
                </p>
                <p className="mt-2 text-sm font-semibold opacity-90">{healthState.microContext}</p>
                {healthState.thresholdContext && (
                  <p className="mt-1 text-sm opacity-80">{healthState.thresholdContext}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Your Position (BMI 15-40)</span>
                  <span>{hasValidResult ? `BMI ${result.bmi}` : "Health Metric"}</span>
                </div>

                <div className="relative pt-2 pb-8">
                  <div className="relative h-4 w-full overflow-hidden rounded-full border border-border/70 bg-muted/30">
                    <div className="absolute inset-y-0 left-0 bg-blue-500/35" style={{ width: `${underweightEndPct}%`, opacity: isUnderweight ? 1 : 0.45 }} />
                    <div className="absolute inset-y-0 bg-emerald-500/35" style={{ left: `${underweightEndPct}%`, width: `${normalEndPct - underweightEndPct}%`, opacity: isNormal ? 1 : 0.45 }} />
                    <div className="absolute inset-y-0 bg-amber-500/35" style={{ left: `${normalEndPct}%`, width: `${overweightEndPct - normalEndPct}%`, opacity: isOverweight ? 1 : 0.45 }} />
                    <div className="absolute inset-y-0 right-0 bg-rose-500/35" style={{ width: `${100 - overweightEndPct}%`, opacity: isObese ? 1 : 0.45 }} />

                    {hasValidResult && (
                      <div className="absolute -top-1.5 h-7 w-0.5 bg-foreground/70" style={{ left: `${progressValue}%` }}>
                        <div className="absolute -top-1.5 -left-1.5 h-3.5 w-3.5 rounded-full border-2 border-background bg-primary shadow" />
                      </div>
                    )}
                  </div>

                  <div className="relative mt-1 h-5 text-[10px] font-semibold text-muted-foreground">
                    <span className="absolute -translate-x-1/2" style={{ left: `${underweightEndPct}%` }}>18.5</span>
                    <span className="absolute -translate-x-1/2" style={{ left: `${normalEndPct}%` }}>25</span>
                    <span className="absolute -translate-x-1/2" style={{ left: `${overweightEndPct}%` }}>30</span>
                    {hasValidResult && (
                      <span className="absolute -translate-x-1/2 text-primary" style={{ left: `${progressValue}%` }}>
                        {result.bmi}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between text-[10px] font-medium text-muted-foreground pt-1">
                    <span>Underweight</span>
                    <span>Healthy</span>
                    <span>Overweight</span>
                    <span>Obese</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <Activity className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-bold">Your Healthy Weight Zone</p>
                  <p className="text-2xl font-bold">{idealRangeDisplay}</p>
                  {idealRangePosition.canRender && (
                    <div className="pt-2 space-y-2">
                      <div className="relative h-2 w-full rounded-full border border-border/70 bg-muted/20">
                        <div className="absolute inset-y-0 left-0 bg-blue-500/35" style={{ width: `${idealRangePosition.zoneStartPct}%` }} />
                        <div
                          className="absolute inset-y-0 bg-emerald-500/35"
                          style={{ left: `${idealRangePosition.zoneStartPct}%`, width: `${idealRangePosition.zoneWidthPct}%` }}
                        />
                        <div
                          className="absolute inset-y-0 right-0 bg-amber-500/35"
                          style={{ width: `${Math.max(100 - (idealRangePosition.zoneStartPct + idealRangePosition.zoneWidthPct), 0)}%` }}
                        />
                        <div
                          className="absolute -top-9 -translate-x-1/2 whitespace-nowrap rounded-md border border-primary/40 bg-primary px-2.5 py-1 text-[11px] font-bold leading-none tabular-nums text-white shadow-md"
                          style={{ left: `${idealRangePosition.labelPct}%` }}
                        >
                          {idealRangePosition.current.toFixed(1)} (you)
                        </div>
                        <div
                          className="absolute -top-1.5 h-5 w-0.5 rounded-full bg-primary shadow-[0_0_0_1px_rgba(59,130,246,0.14)]"
                          style={{ left: `${idealRangePosition.positionPct}%`, transform: "translateX(-50%)" }}
                        />
                      </div>
                      <div className="relative h-4 text-[11px] font-semibold tabular-nums text-muted-foreground">
                        <span className="absolute left-0">{idealRangePosition.scaleMin.toFixed(1)}</span>
                        <span className="absolute right-0">{idealRangePosition.scaleMax.toFixed(1)}</span>
                      </div>
                      <p className="text-xs font-medium text-foreground/80">{idealRangePosition.insight}</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Based on your height, this is the recommended weight range for a healthy BMI.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-background/70">
                <HeartPulse className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-bold">Health Insight</p>
                  <p className="text-sm">
                    <span className="font-semibold">Risk Level: </span>
                    <span className="text-muted-foreground">{medicalFeedback.riskLevel}</span>
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{medicalFeedback.summary}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{medicalFeedback.guidance}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-background/70">
                <Activity className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-bold">Body Insight Layer</p>
                  <p className="text-sm">
                    <span className="font-semibold">Estimated body fat range: </span>
                    <span className="text-muted-foreground">{bodyInsight.bodyFatRange}</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Maintenance estimate: </span>
                    <span className="text-muted-foreground">{bodyInsight.maintenanceCalories}</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Suggested target: </span>
                    <span className="text-muted-foreground">{bodyInsight.targetWeight}</span>
                  </p>
                  {bodyInsight.targetDelta && (
                    <p className="text-sm leading-relaxed text-muted-foreground">{bodyInsight.targetDelta}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 text-xs text-muted-foreground italic">
                <Info className="h-4 w-4 shrink-0" />
                <p>Note: Adult BMI is a screening tool, not a diagnosis. It may overestimate risk in very muscular people and underestimate risk in some older adults. Use with waist measurement, medical history, and clinician guidance.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
