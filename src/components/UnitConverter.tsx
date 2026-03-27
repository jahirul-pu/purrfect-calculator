import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scale, RefreshCcw } from "lucide-react";
import { units, convert, type Category } from "@/lib/unitConverter";

export function UnitConverter() {
  const [category, setCategory] = useState<Category>("Length");
  const [fromUnit, setFromUnit] = useState<string>("");
  const [toUnit, setToUnit] = useState<string>("");
  const [fromValue, setFromValue] = useState<string>("");
  const [toValue, setToValue] = useState<string>("");

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

  // Recalculate when units change
  useEffect(() => {
    const num = parseFloat(fromValue);
    if (!isNaN(num)) {
      const result = convert(num, fromUnit, toUnit, category);
      setToValue(result.toString());
    }
  }, [fromUnit, toUnit]);

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
            <SelectTrigger className="w-full h-12 text-lg">
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

      <div className="grid gap-6 md:grid-cols-2">
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
                className="h-12 text-xl font-bold font-mono"
              />
            </div>
          </CardContent>
        </Card>

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
                className="h-12 text-xl font-bold font-mono bg-muted/30"
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
    </div>
  );
}
