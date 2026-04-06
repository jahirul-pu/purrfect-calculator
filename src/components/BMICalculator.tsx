import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Activity, User, Info, HeartPulse } from "lucide-react";
import { calculateBMI } from "@/lib/bmiCalc";
import { cn } from "@/lib/utils";

interface BMIFeedback {
  riskLevel: string;
  summary: string;
  guidance: string;
}

export function BMICalculator() {
  const [weightUnit, setWeightUnit] = useState<"kg" | "lb">("kg");
  const [heightUnit, setHeightUnit] = useState<"cm" | "ftin">("cm");
  const [weightValue, setWeightValue] = useState<string>("");
  const [heightCm, setHeightCm] = useState<string>("");
  const [heightFt, setHeightFt] = useState<string>("");
  const [heightInches, setHeightInches] = useState<string>("");

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

  const hasValidResult = result.bmi > 0;

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
      return {
        riskLevel: "Lower",
        summary: "BMI 18.5-24.9 is generally associated with lower cardiometabolic risk for most adults.",
        guidance: "Maintain regular physical activity, balanced diet, sleep, and preventive health checks.",
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

  // Map BMI 15-40 to Progress 0-100
  const progressValue = Math.min(Math.max(((result.bmi - 15) / (40 - 15)) * 100, 0), 100);

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
                <Select value={weightUnit} onValueChange={(v: "kg" | "lb") => setWeightUnit(v)}>
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
                <Select value={heightUnit} onValueChange={(v: "cm" | "ftin") => setHeightUnit(v)}>
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

        <div className="md:col-span-7 space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-8 pb-8 text-center space-y-6">
              <div className="space-y-1">
                <p className="text-6xl font-black">{result.bmi}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">BMI Score</p>
              </div>
              
              <div className={cn(
                "inline-block px-6 py-2 rounded-full text-lg font-bold shadow-sm",
                getCategoryColor(result.category)
              )}>
                {result.category}
              </div>
            </CardContent>
          </Card>

          <Card className="border-dashed shadow-none">
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Scale (15-40)</span>
                  <span>Health Metric</span>
                </div>
                <Progress value={progressValue} className="h-3" />
                <div className="flex justify-between text-[10px] font-medium text-muted-foreground pt-1">
                  <span>Underweight</span>
                  <span>Normal</span>
                  <span>Overweight</span>
                  <span>Obese</span>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border">
                <Activity className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-bold">Ideal Weight Range</p>
                  <p className="text-2xl font-bold">{idealRangeDisplay}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Based on your height, this is the recommended weight range for a healthy BMI.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg border bg-background">
                <HeartPulse className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-bold">Medical Feedback</p>
                  <p className="text-sm">
                    <span className="font-semibold">Risk Level: </span>
                    <span className="text-muted-foreground">{medicalFeedback.riskLevel}</span>
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{medicalFeedback.summary}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{medicalFeedback.guidance}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 text-xs text-muted-foreground italic border-t pt-4">
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
