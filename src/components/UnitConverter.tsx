import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { Scale, RefreshCcw, Sparkles, ArrowLeftRight } from "lucide-react";
import { units, convert, type Category } from "@/lib/unitConverter";
import { RealityTranslatorPanel } from "@/components/RealityTranslatorPanel";
import { translateUnit } from "@/lib/realityTranslator";

export function UnitConverter() {
  const [category, setCategory] = useState<Category>("Length");
  const [fromUnit, setFromUnit] = useState<string>("");
  const [toUnit, setToUnit] = useState<string>("");
  const [fromValue, setFromValue] = useState<string>("");
  const [toValue, setToValue] = useState<string>("");
  const [funUnitsEnabled, setFunUnitsEnabled] = useState(false);

  useEffect(() => {
    setFromUnit(units[category][0]);
    setToUnit(units[category][1] || units[category][0]);
  }, [category]);

  const handleFromChange = (val: string) => {
    setFromValue(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      const result = convert(num, fromUnit, toUnit, category);
      setToValue(result.toString());
    } else {
      setToValue("");
    }
  };

  const handleToChange = (val: string) => {
    setToValue(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      const result = convert(num, toUnit, fromUnit, category);
      setFromValue(result.toString());
    } else {
      setFromValue("");
    }
  };

  const handleSwapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setFromValue(toValue);
    setToValue(fromValue);
  };

  // Recalculate when units change
  useEffect(() => {
    const num = parseFloat(fromValue);
    if (!isNaN(num)) {
      const result = convert(num, fromUnit, toUnit, category);
      setToValue(result.toString());
    }
  }, [fromUnit, toUnit]);

  // Fun units comparisons
  const funComparisons = useMemo(() => {
    const num = parseFloat(fromValue);
    if (isNaN(num) || num <= 0) return [];
    return translateUnit(num, fromUnit, category);
  }, [fromValue, fromUnit, category]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Unit Converter</h1>
        <p className="text-muted-foreground font-medium">Instant conversion for common measurements.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Scale className="h-5 w-5" /> Category Selection
          </CardTitle>
          <CardDescription>Choose what you want to convert</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={category} onValueChange={(v: Category) => setCategory(v)}>
            <SelectTrigger className="w-full h-10 text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(units).map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:gap-6 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <Card className="border-dashed shadow-none">
          <CardContent className="pt-6 space-y-4">
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">From Unit</Label>
              <Select value={fromUnit} onValueChange={setFromUnit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units[category].map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Value</Label>
              <Input
                type="number"
                value={fromValue}
                onChange={(e) => handleFromChange(e.target.value)}
                className="h-10 text-base font-semibold font-mono"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleSwapUnits}
            className="h-10 w-10 rounded-full"
            aria-label="Swap from and to units"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
        </div>

        <Card className="border-dashed shadow-none">
          <CardContent className="pt-6 space-y-4">
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">To Unit</Label>
              <Select value={toUnit} onValueChange={setToUnit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units[category].map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Converted Result</Label>
              <Input
                type="number"
                value={toValue}
                onChange={(e) => handleToChange(e.target.value)}
                className="h-10 text-base font-semibold font-mono bg-muted/30"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted px-4 py-2 rounded-full">
          <RefreshCcw className="h-3 w-3" /> Bidirectional Conversion Active
        </div>
      </div>

      {/* Fun Units Toggle */}
      <div className="space-y-3">
        <div className={`flex items-center justify-between p-3 rounded-lg border fun-units-toggle ${funUnitsEnabled ? "active" : "bg-muted/20"}`}>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-600" />
            <Label htmlFor="fun-units-toggle" className="text-xs font-bold cursor-pointer">
              Fun Units Mode
            </Label>
            <span className="text-[10px] text-muted-foreground font-medium ml-1 hidden sm:inline">
              (bananas, blue whales, football fields...)
            </span>
          </div>
          <Toggle
            id="fun-units-toggle"
            pressed={funUnitsEnabled}
            onPressedChange={setFunUnitsEnabled}
            aria-label="Toggle fun units mode"
          />
        </div>

        {funUnitsEnabled && funComparisons.length > 0 && (
          <RealityTranslatorPanel
            comparisons={funComparisons}
            title={`In Fun ${category} Units...`}
          />
        )}

        {funUnitsEnabled && funComparisons.length === 0 && fromValue && parseFloat(fromValue) > 0 && (
          <div className="text-center p-4 rounded-lg border border-dashed text-sm text-muted-foreground">
            Enter a value to see fun unit comparisons!
          </div>
        )}
      </div>
    </div>
  );
}
