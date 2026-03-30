import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Activity, User, Info } from "lucide-react";
import { calculateBMI, imperialToMetric } from "@/lib/bmiCalc";
import { cn } from "@/lib/utils";

export function BMICalculator() {
  const [unitSystem, setUnitSystem] = useState<"metric" | "imperial">("metric");
  
  // Metric
  const [weightKg, setWeightKg] = useState<number>(0);
  const [heightCm, setHeightCm] = useState<number>(0);

  // Imperial
  const [lbs, setLbs] = useState<number>(0);
  const [ft, setFt] = useState<number>(0);
  const [inches, setInches] = useState<number>(0);

  const result = useMemo(() => {
    if (unitSystem === "metric") {
      return calculateBMI(weightKg, heightCm);
    } else {
      const { weightKg: w, heightCm: h } = imperialToMetric(lbs, ft, inches);
      return calculateBMI(w, h);
    }
  }, [unitSystem, weightKg, heightCm, lbs, ft, inches]);

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
              <Tabs value={unitSystem} onValueChange={(v: any) => setUnitSystem(v)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="metric">Metric</TabsTrigger>
                  <TabsTrigger value="imperial">Imperial</TabsTrigger>
                </TabsList>
                
                <TabsContent value="metric" className="pt-4 space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="weight-kg" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Weight (kg)</Label>
                    <Input id="weight-kg" type="number" value={weightKg} onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="height-cm" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Height (cm)</Label>
                    <Input id="height-cm" type="number" value={heightCm} onChange={(e) => setHeightCm(parseFloat(e.target.value) || 0)} />
                  </div>
                </TabsContent>

                <TabsContent value="imperial" className="pt-4 space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="weight-lb" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Weight (lb)</Label>
                    <Input id="weight-lb" type="number" value={lbs} onChange={(e) => setLbs(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="height-ft" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Feet</Label>
                      <Input id="height-ft" type="number" value={ft} onChange={(e) => setFt(parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="height-in" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Inches</Label>
                      <Input id="height-in" type="number" value={inches} onChange={(e) => setInches(parseFloat(e.target.value) || 0)} />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
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
                  <p className="text-2xl font-bold">{result.idealRange}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Based on your height, this is the recommended weight range for a healthy BMI.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 text-xs text-muted-foreground italic border-t pt-4">
                <Info className="h-4 w-4 shrink-0" />
                <p>Note: BMI is a general indicator and does not account for muscle mass or body composition.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
