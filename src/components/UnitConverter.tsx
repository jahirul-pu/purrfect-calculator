import { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { Scale, RefreshCcw, Sparkles, ArrowLeftRight } from "lucide-react";
import { units, convert, getEnergyUnitGroup, type Category } from "@/lib/unitConverter";
import { RealityTranslatorPanel } from "@/components/RealityTranslatorPanel";
import { getBaseValue, translateUnit } from "@/lib/realityTranslator";

interface SmartSuggestion {
  label: string;
  value: string;
}

interface SearchParseResult {
  category: Category;
  fromUnit: string;
  toUnit: string;
  value: number;
}

interface MultiConversionRow {
  unit: string;
  value: string;
}

const UNIT_ALIASES: Record<Category, Record<string, string>> = {
  Length: {
    m: "Meters", meter: "Meters", meters: "Meters",
    km: "Kilometers", kilometer: "Kilometers", kilometers: "Kilometers",
    cm: "Centimeters", centimeter: "Centimeters", centimeters: "Centimeters",
    mm: "Millimeters", millimeter: "Millimeters", millimeters: "Millimeters",
    in: "Inches", inch: "Inches", inches: "Inches",
    ft: "Feet", foot: "Feet", feet: "Feet",
    yd: "Yards", yard: "Yards", yards: "Yards",
    mi: "Miles", mile: "Miles", miles: "Miles",
  },
  Weight: {
    kg: "Kilograms", kilogram: "Kilograms", kilograms: "Kilograms",
    g: "Grams", gram: "Grams", grams: "Grams",
    mg: "Milligrams", milligram: "Milligrams", milligrams: "Milligrams",
    lb: "Pounds", lbs: "Pounds", pound: "Pounds", pounds: "Pounds",
    oz: "Ounces", ounce: "Ounces", ounces: "Ounces",
    ton: "Tons", tons: "Tons", tonne: "Tons", tonnes: "Tons",
  },
  Temperature: {
    c: "Celsius", celsius: "Celsius",
    f: "Fahrenheit", fahrenheit: "Fahrenheit",
    k: "Kelvin", kelvin: "Kelvin",
  },
  Volume: {
    l: "Liters", liter: "Liters", liters: "Liters",
    ml: "Milliliters", milliliter: "Milliliters", milliliters: "Milliliters",
    gal: "Gallons", gallon: "Gallons", gallons: "Gallons",
    cup: "Cups", cups: "Cups",
  },
  Velocity: {
    ms: "Meters/second", mps: "Meters/second", "m/s": "Meters/second", meterpersecond: "Meters/second", meterspersecond: "Meters/second",
    kmh: "Kilometers/hour", "km/h": "Kilometers/hour", kilometerperhour: "Kilometers/hour", kilometersperhour: "Kilometers/hour",
    mph: "Miles/hour", mileperhour: "Miles/hour", milesperhour: "Miles/hour",
    fts: "Feet/second", "ft/s": "Feet/second", footpersecond: "Feet/second", feetpersecond: "Feet/second",
    knot: "Knots", knots: "Knots",
  },
  Energy: {
    j: "Joules", joule: "Joules", joules: "Joules",
    kj: "Kilojoules", kilojoule: "Kilojoules", kilojoules: "Kilojoules",
    wh: "Watt-hours", watthour: "Watt-hours", watthours: "Watt-hours",
    kwh: "Kilowatt-hours", kilowatthour: "Kilowatt-hours", kilowatthours: "Kilowatt-hours",
    w: "Watts", watt: "Watts", watts: "Watts",
    kw: "Kilowatts", kilowatt: "Kilowatts", kilowatts: "Kilowatts",
    hp: "Horsepower", horsepower: "Horsepower",
    nm: "Newton-meters", nmb: "Newton-meters", "n*m": "Newton-meters", "n-m": "Newton-meters", newtonmeter: "Newton-meters", newtonmeters: "Newton-meters",
    lbft: "Pound-feet", "lb-ft": "Pound-feet", "lb/ft": "Pound-feet", poundfoot: "Pound-feet", poundfeet: "Pound-feet",
    kcal: "Calories", calorie: "Calories", calories: "Calories",
    btu: "BTU", btus: "BTU",
  },
};

const normalizeQueryToken = (token: string) => token.toLowerCase().replace(/\s+/g, "").replace(/\./g, "");

const parseConversionQuery = (raw: string): SearchParseResult | null => {
  const query = raw.trim();
  if (!query) return null;

  const match = query.match(/^(-?\d+(?:\.\d+)?)\s+(.+?)\s+(?:to|in|=|->)\s+(.+)$/i);
  if (!match) return null;

  const value = Number(match[1]);
  if (!isFinite(value)) return null;

  const fromKey = normalizeQueryToken(match[2]);
  const toKey = normalizeQueryToken(match[3]);

  const categories = Object.keys(UNIT_ALIASES) as Category[];
  for (const cat of categories) {
    const aliasMap = UNIT_ALIASES[cat];
    const fromUnit = aliasMap[fromKey];
    const toUnit = aliasMap[toKey];
    if (fromUnit && toUnit) {
      if (cat === "Energy") {
        const fromGroup = getEnergyUnitGroup(fromUnit);
        const toGroup = getEnergyUnitGroup(toUnit);
        if (!fromGroup || !toGroup || fromGroup !== toGroup) {
          continue;
        }
      }
      return { category: cat, fromUnit, toUnit, value };
    }
  }

  return null;
};

export function UnitConverter() {
  const [category, setCategory] = useState<Category>("Length");
  const [fromUnit, setFromUnit] = useState<string>("");
  const [toUnit, setToUnit] = useState<string>("");
  const [fromValue, setFromValue] = useState<string>("");
  const [queryInput, setQueryInput] = useState("");
  const [funUnitsEnabled, setFunUnitsEnabled] = useState(false);
  const [showFullPrecision, setShowFullPrecision] = useState(false);
  const [heroFontSize, setHeroFontSize] = useState<number>(40);
  const [swapAnimation, setSwapAnimation] = useState<"units" | "values" | null>(null);
  const [swappedResultOverride, setSwappedResultOverride] = useState<string | null>(null);
  const heroOutputContainerRef = useRef<HTMLDivElement | null>(null);
  const heroOutputTextRef = useRef<HTMLParagraphElement | null>(null);
  const swapTimeoutRef = useRef<number | null>(null);

  const toStableNumberString = (value: number, maxDecimals = 12): string => {
    if (!isFinite(value)) return "0";
    if (Math.abs(value) < 1e-10) return "0";

    const fixed = value.toFixed(maxDecimals);
    return fixed.replace(/\.?0+$/, "");
  };

  const normalizeNumericString = (raw: string): string => {
    const parsed = parseFloat(raw);
    if (!isFinite(parsed)) return "0";
    return toStableNumberString(parsed);
  };

  useEffect(() => {
    setFromUnit((prev) => (units[category].includes(prev) ? prev : units[category][0]));
    setToUnit((prev) => (units[category].includes(prev) ? prev : (units[category][1] || units[category][0])));
    setSwappedResultOverride(null);
  }, [category]);

  useEffect(() => {
    if (category !== "Energy") return;

    const fromGroup = getEnergyUnitGroup(fromUnit);
    const toGroup = getEnergyUnitGroup(toUnit);
    if (!fromGroup) return;

    if (toGroup !== fromGroup) {
      const nextCompatible = units.Energy.find((unitName) => unitName !== fromUnit && getEnergyUnitGroup(unitName) === fromGroup) || fromUnit;
      setToUnit(nextCompatible);
    }
  }, [category, fromUnit, toUnit]);

  useEffect(() => {
    setSwappedResultOverride(null);
  }, [fromUnit, toUnit]);

  const handleFromChange = (val: string) => {
    setSwappedResultOverride(null);
    setFromValue(val);
  };

  const handleQueryChange = (raw: string) => {
    setQueryInput(raw);
    const parsed = parseConversionQuery(raw);
    if (!parsed) return;

    setCategory(parsed.category);
    setFromUnit(parsed.fromUnit);
    setToUnit(parsed.toUnit);
    setFromValue(toStableNumberString(parsed.value));
    setSwappedResultOverride(null);
    setShowFullPrecision(false);
  };

  const parsedFromValue = parseFloat(fromValue);
  const hasValidConversion = !isNaN(parsedFromValue) && fromUnit && toUnit;

  const convertedValue = useMemo(() => {
    if (!hasValidConversion) return null;
    return convert(parsedFromValue, fromUnit, toUnit, category);
  }, [hasValidConversion, parsedFromValue, fromUnit, toUnit, category]);

  const roundedResult = useMemo(() => {
    if (convertedValue === null) return "";
    return Number(convertedValue.toFixed(2)).toString();
  }, [convertedValue]);

  const preciseResult = useMemo(() => {
    if (convertedValue === null) return "";
    return toStableNumberString(convertedValue);
  }, [convertedValue]);

  const inputDisplayValue = useMemo(() => {
    if (!hasValidConversion) return "";
    return Number(parsedFromValue.toFixed(4)).toString();
  }, [hasValidConversion, parsedFromValue]);

  const displayedResultValue = swappedResultOverride ?? (showFullPrecision ? preciseResult : roundedResult);

  const toUnitOptions = useMemo(() => {
    if (category !== "Energy") return units[category];

    const fromGroup = getEnergyUnitGroup(fromUnit);
    if (!fromGroup) return units[category];
    return units[category].filter((unitName) => getEnergyUnitGroup(unitName) === fromGroup);
  }, [category, fromUnit]);

  const startSwapAnimation = (mode: "units" | "values") => {
    setSwapAnimation(mode);
    if (swapTimeoutRef.current) {
      window.clearTimeout(swapTimeoutRef.current);
    }

    swapTimeoutRef.current = window.setTimeout(() => {
      setSwapAnimation(null);
      swapTimeoutRef.current = null;
    }, 420);
  };

  const handleSwapUnits = () => {
    startSwapAnimation("units");

    const previousFromUnit = fromUnit;
    setFromUnit(toUnit);
    setToUnit(previousFromUnit);
    setSwappedResultOverride(null);
    setShowFullPrecision(false);
  };

  const handleSwapValues = () => {
    if (!hasValidConversion) return;

    startSwapAnimation("values");

    const currentLeftValue = normalizeNumericString(fromValue);
    const currentRightValue = swappedResultOverride ?? preciseResult;
    if (!currentRightValue) return;

    setFromValue(normalizeNumericString(currentRightValue));
    setSwappedResultOverride(currentLeftValue);
    setShowFullPrecision(false);
  };

  useEffect(() => {
    return () => {
      if (swapTimeoutRef.current) {
        window.clearTimeout(swapTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!hasValidConversion) {
      setHeroFontSize(40);
      return;
    }

    const fitHeroText = () => {
      const container = heroOutputContainerRef.current;
      const textNode = heroOutputTextRef.current;
      if (!container || !textNode) return;

      const minSize = 18;
      const maxSize = 44;
      let nextSize = maxSize;

      textNode.style.fontSize = `${nextSize}px`;
      while (textNode.scrollWidth > container.clientWidth && nextSize > minSize) {
        nextSize -= 1;
        textNode.style.fontSize = `${nextSize}px`;
      }

      setHeroFontSize(nextSize);
    };

    fitHeroText();

    const container = heroOutputContainerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;

    const resizeObserver = new ResizeObserver(() => {
      fitHeroText();
    });

    resizeObserver.observe(container);
    return () => {
      resizeObserver.disconnect();
    };
  }, [hasValidConversion, inputDisplayValue, fromUnit, toUnit, roundedResult, preciseResult, showFullPrecision, displayedResultValue]);

  // Fun units comparisons
  const funComparisons = useMemo(() => {
    const num = parseFloat(fromValue);
    if (isNaN(num) || num <= 0) return [];
    return translateUnit(num, fromUnit, category);
  }, [fromValue, fromUnit, category]);

  const formatApproxCount = (count: number): string => {
    if (!isFinite(count) || count <= 0) return "0";
    if (count < 0.75) return "<1";
    if (count < 10) return Math.round(count).toString();
    return Math.round(count).toLocaleString();
  };

  const formatMultiConversionValue = (value: number): string => {
    if (!isFinite(value)) return "0";
    const normalized = Math.abs(value) < 1e-10 ? 0 : value;

    if (Math.abs(normalized) >= 1000) {
      return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(normalized);
    }

    if (Math.abs(normalized) >= 1) {
      return Number(normalized.toFixed(2)).toLocaleString("en-US");
    }

    return toStableNumberString(normalized, 8);
  };

  const smartSuggestions = useMemo<SmartSuggestion[]>(() => {
    if (!hasValidConversion || parsedFromValue <= 0) return [];

    const baseValue = getBaseValue(parsedFromValue, fromUnit, category);

    if (category === "Weight") {
      const peopleCount = baseValue / 70;
      const suitcaseCount = baseValue / 50;
      return [
        {
          label: "Average adult person (~70 kg)",
          value: `≈ ${formatApproxCount(peopleCount)} person${Math.round(peopleCount) === 1 ? "" : "s"}`,
        },
        {
          label: "Large travel suitcase (~50 kg loaded)",
          value: `≈ ${formatApproxCount(suitcaseCount)} large suitcase${Math.round(suitcaseCount) === 1 ? "" : "s"}`,
        },
      ];
    }

    if (category === "Length") {
      const footballFieldCount = baseValue / 91.44;
      const busCount = baseValue / 11.3;
      return [
        {
          label: "Football field",
          value: `≈ ${formatApproxCount(footballFieldCount)} field${Math.round(footballFieldCount) === 1 ? "" : "s"}`,
        },
        {
          label: "Double-decker bus",
          value: `≈ ${formatApproxCount(busCount)} bus${Math.round(busCount) === 1 ? "" : "es"}`,
        },
      ];
    }

    if (category === "Volume") {
      const bathtubCount = baseValue / 300;
      const mugCount = baseValue / 0.35;
      return [
        {
          label: "Bathtub",
          value: `≈ ${formatApproxCount(bathtubCount)} tub${Math.round(bathtubCount) === 1 ? "" : "s"}`,
        },
        {
          label: "Coffee mug",
          value: `≈ ${formatApproxCount(mugCount)} mug${Math.round(mugCount) === 1 ? "" : "s"}`,
        },
      ];
    }

    if (category === "Velocity") {
      const walkCount = baseValue / 1.4;
      const highwayCount = baseValue / 27.8;
      return [
        {
          label: "Walking pace",
          value: `≈ ${formatApproxCount(walkCount)}x normal walking speed`,
        },
        {
          label: "Highway speed",
          value: `≈ ${formatApproxCount(highwayCount)}x highway cruising speed`,
        },
      ];
    }

    if (category === "Temperature") {
      return [
        {
          label: "Human comfort context",
          value: baseValue < 10 ? "Feels cold for light clothing" : baseValue < 30 ? "Comfortable to warm range" : "Hot conditions likely",
        },
        {
          label: "Daily life impact",
          value: baseValue < 0 ? "Water can freeze" : baseValue >= 100 ? "Water boils" : "Typical non-extreme conditions",
        },
      ];
    }

    return [];
  }, [hasValidConversion, parsedFromValue, fromUnit, category]);

  const multiConversionRows = useMemo<MultiConversionRow[]>(() => {
    if (!hasValidConversion) return [];

    const rows = toUnitOptions
      .filter((unitName) => unitName !== fromUnit)
      .map((unitName) => {
        const converted = convert(parsedFromValue, fromUnit, unitName, category);
        return {
          unit: unitName,
          value: formatMultiConversionValue(converted),
        };
      });

    return rows;
  }, [hasValidConversion, category, fromUnit, parsedFromValue, toUnitOptions]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Conversion Engine</h1>
        <p className="text-muted-foreground font-medium">Instant conversion with contextual outputs.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Search Input
          </CardTitle>
          <CardDescription>Type natural queries like: 100 kg to lb</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            value={queryInput}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Try: 100 kg to lb"
            className="h-10 font-medium"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Scale className="h-5 w-5" /> Category Selection
          </CardTitle>
          <CardDescription>Choose a category quickly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(Object.keys(units) as Category[]).map((cat) => (
              <Button
                key={cat}
                type="button"
                variant={category === cat ? "default" : "outline"}
                onClick={() => setCategory(cat)}
                className="h-10 rounded-full font-semibold"
              >
                {cat}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-8 pb-8 px-4 md:px-6 text-center space-y-4">
          {hasValidConversion && convertedValue !== null ? (
            <>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Instant Conversion</p>
              <div ref={heroOutputContainerRef} className="w-full text-center">
                <p
                  ref={heroOutputTextRef}
                  className="inline-block max-w-full whitespace-nowrap font-black tracking-tight tabular-nums"
                  style={{ fontSize: `${heroFontSize}px` }}
                >
                  {inputDisplayValue} {fromUnit} = {displayedResultValue} {toUnit}
                </p>
              </div>

              <div className="mx-auto flex w-fit items-center gap-2 rounded-full bg-background/70 px-3 py-1.5">
                <Switch
                  id="show-full-precision"
                  checked={showFullPrecision}
                  onCheckedChange={setShowFullPrecision}
                  aria-label="Show full precision"
                />
                <Label htmlFor="show-full-precision" className="text-xs font-semibold cursor-pointer">
                  Show full precision
                </Label>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Instant Conversion</p>
              <p className="text-3xl font-black tracking-tight">Enter a value to convert</p>
            </>
          )}
        </CardContent>
      </Card>

      {hasValidConversion && multiConversionRows.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Scale className="h-4 w-4" /> Multi-Conversion View
            </CardTitle>
            <CardDescription>{inputDisplayValue} {fromUnit} =</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-1.5 sm:grid-cols-2">
              {multiConversionRows.map((row) => (
                <div
                  key={row.unit}
                  className="rounded-md bg-background/85 px-2.5 py-1.5"
                >
                  <p className="font-mono text-xs font-semibold leading-tight">{"->"} {row.value} {row.unit}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:gap-6 md:grid-cols-[1fr_auto_1fr] md:items-start">
        <Card className={`shadow-none transition-all duration-300 border-transparent bg-primary/5 ring-1 ring-primary/20 ${swapAnimation ? "md:-translate-x-1" : ""}`}>
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

        <div className="flex flex-col items-center justify-start pt-6 space-y-4">
          <div className="grid justify-items-center gap-2">
            <span className="h-4" aria-hidden="true" />
            <Button
              type="button"
              variant="default"
              size="icon"
              onClick={handleSwapUnits}
              className={`h-10 w-10 rounded-full border-2 border-background shadow-lg transition-all duration-300 ${swapAnimation === "units" ? "scale-110 shadow-xl" : "hover:scale-105"}`}
              aria-label="Swap units"
              title="Swap units"
            >
              <ArrowLeftRight className={`h-5 w-5 transition-transform duration-500 ${swapAnimation === "units" ? "rotate-180" : "rotate-0"}`} />
            </Button>
          </div>

          <div className="grid justify-items-center gap-2">
            <span className="h-4" aria-hidden="true" />
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={handleSwapValues}
              className={`h-10 w-10 rounded-full border border-border/70 shadow-md transition-all duration-300 ${swapAnimation === "values" ? "scale-110 shadow-xl" : "hover:scale-105"}`}
              aria-label="Swap values"
              title="Swap values"
            >
              <RefreshCcw className={`h-5 w-5 transition-transform duration-500 ${swapAnimation === "values" ? "-rotate-180" : "rotate-0"}`} />
            </Button>
          </div>
        </div>

        <Card className={`shadow-none transition-all duration-300 border-transparent bg-muted/35 ${swapAnimation ? "md:translate-x-1" : ""}`}>
          <CardContent className="pt-6 space-y-4">
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">To Unit</Label>
              <Select value={toUnit} onValueChange={setToUnit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {toUnitOptions.map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Preview Result</Label>
              <Input
                type="text"
                readOnly
                value={hasValidConversion && convertedValue !== null ? `${displayedResultValue} ${toUnit}` : ""}
                className="h-10 text-base font-semibold font-mono bg-muted/30"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted px-4 py-2 rounded-full">
          <RefreshCcw className="h-3 w-3" /> Instant Conversion Active
        </div>
      </div>

      {smartSuggestions.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Smart Unit Suggestions
            </CardTitle>
            <CardDescription>Contextual equivalents for your current input.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-3 sm:grid-cols-2">
              {smartSuggestions.map((suggestion) => (
                <div key={suggestion.label} className="rounded-lg bg-background/80 p-3 space-y-1">
                  <p className="text-xs text-muted-foreground font-semibold">{suggestion.label}</p>
                  <p className="text-sm font-bold">{suggestion.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fun Units Toggle */}
      <div className="space-y-3">
        <div className={`flex items-center justify-between p-3 rounded-lg fun-units-toggle ${funUnitsEnabled ? "active" : "bg-muted/20"}`}>
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
          <div className="text-center p-4 rounded-lg bg-muted/30 text-sm text-muted-foreground">
            Enter a value to see fun unit comparisons!
          </div>
        )}
      </div>
    </div>
  );
}
