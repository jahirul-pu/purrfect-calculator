import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { Circle, Flame, Moon, Orbit, Satellite, Snowflake, Sparkles, Star, Sun } from "lucide-react";

type WeightUnit = "kg" | "lb";
type SortOrder = "none" | "heaviest" | "lightest";

interface CelestialBody {
  name: string;
  gravityRelativeToEarth: number;
  iconKey: string;
}

const planets: CelestialBody[] = [
  { name: "Mercury", gravityRelativeToEarth: 0.378, iconKey: "planet" },
  { name: "Venus", gravityRelativeToEarth: 0.907, iconKey: "planet" },
  { name: "Mars", gravityRelativeToEarth: 0.377, iconKey: "planet" },
  { name: "Jupiter", gravityRelativeToEarth: 2.36, iconKey: "planet" },
  { name: "Saturn", gravityRelativeToEarth: 1.065, iconKey: "planet-ring" },
  { name: "Uranus", gravityRelativeToEarth: 0.886, iconKey: "planet" },
  { name: "Neptune", gravityRelativeToEarth: 1.122, iconKey: "planet" },
];

const dwarfPlanets: CelestialBody[] = [
  { name: "Pluto", gravityRelativeToEarth: 0.063, iconKey: "planet" },
  { name: "Eris", gravityRelativeToEarth: 0.084, iconKey: "planet-ring" },
  { name: "Haumea", gravityRelativeToEarth: 0.044, iconKey: "sparkle" },
  { name: "Makemake", gravityRelativeToEarth: 0.05, iconKey: "satellite" },
  { name: "Ceres", gravityRelativeToEarth: 0.028, iconKey: "circle" },
];

const moons: CelestialBody[] = [
  { name: "Earth Moon", gravityRelativeToEarth: 0.165, iconKey: "moon" },
  { name: "Europa", gravityRelativeToEarth: 0.134, iconKey: "snowflake" },
  { name: "Io", gravityRelativeToEarth: 0.183, iconKey: "flame" },
  { name: "Ganymede", gravityRelativeToEarth: 0.146, iconKey: "satellite" },
  { name: "Titan", gravityRelativeToEarth: 0.138, iconKey: "moon" },
  { name: "Enceladus", gravityRelativeToEarth: 0.011, iconKey: "snowflake" },
];

const stars: CelestialBody[] = [
  { name: "Sun", gravityRelativeToEarth: 27.9, iconKey: "sun" },
  { name: "Proxima Centauri", gravityRelativeToEarth: 1.14, iconKey: "star" },
  { name: "Sirius A", gravityRelativeToEarth: 2.34, iconKey: "sparkle" },
  { name: "Betelgeuse", gravityRelativeToEarth: 0.001, iconKey: "star" },
];

function getBodyIcon(iconKey: string) {
  switch (iconKey) {
    case "sun":
      return <Sun className="h-4 w-4" />;
    case "moon":
      return <Moon className="h-4 w-4" />;
    case "planet-ring":
      return <Orbit className="h-4 w-4" />;
    case "planet":
      return <Circle className="h-4 w-4" />;
    case "satellite":
      return <Satellite className="h-4 w-4" />;
    case "snowflake":
      return <Snowflake className="h-4 w-4" />;
    case "flame":
      return <Flame className="h-4 w-4" />;
    case "sparkle":
      return <Sparkles className="h-4 w-4" />;
    case "star":
      return <Star className="h-4 w-4" />;
    default:
      return <Circle className="h-4 w-4" />;
  }
}

function formatWeight(value: number) {
  return value.toLocaleString(undefined, {
    maximumFractionDigits: value >= 100 ? 1 : 2,
  });
}

function sortBodiesByWeight(bodies: CelestialBody[], sortOrder: SortOrder) {
  if (sortOrder === "none") return bodies;
  const sorted = [...bodies].sort((a, b) => a.gravityRelativeToEarth - b.gravityRelativeToEarth);
  return sortOrder === "heaviest" ? sorted.reverse() : sorted;
}

function GravitySection({
  title,
  subtitle,
  unit,
  earthWeight,
  bodies,
  sortOrder,
}: {
  title: string;
  subtitle: string;
  unit: WeightUnit;
  earthWeight: number;
  bodies: CelestialBody[];
  sortOrder: SortOrder;
}) {
  const visibleBodies = useMemo(() => sortBodiesByWeight(bodies, sortOrder), [bodies, sortOrder]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visibleBodies.map((body) => {
          const bodyWeight = earthWeight * body.gravityRelativeToEarth;
          return (
            <Card key={body.name} className="bg-muted/20 shadow-none">
              <CardContent className="p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{body.name}</p>
                  <span className="text-muted-foreground" aria-hidden="true">{getBodyIcon(body.iconKey)}</span>
                </div>
                <p className="text-xl font-bold">{formatWeight(bodyWeight)} {unit}</p>
                <p className="text-xs text-muted-foreground">{body.gravityRelativeToEarth.toFixed(3)} x Earth gravity</p>
              </CardContent>
            </Card>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function SpaceWeightCalculator() {
  const [weightInput, setWeightInput] = useState("70");
  const [unit, setUnit] = useState<WeightUnit>("kg");
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");
  const [includeDwarfPlanets, setIncludeDwarfPlanets] = useState(false);

  const earthWeight = useMemo(() => {
    const parsed = parseFloat(weightInput);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }, [weightInput]);

  const visiblePlanets = useMemo(() => {
    return includeDwarfPlanets ? [...planets, ...dwarfPlanets] : planets;
  }, [includeDwarfPlanets]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Space Weight Explorer</h1>
        <p className="text-muted-foreground font-medium">See how your Earth weight changes on planets, moons, and stars.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Orbit className="h-5 w-5" /> Earth Baseline
          </CardTitle>
          <CardDescription>Enter your current Earth weight to compare across celestial bodies.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[1fr_180px]">
          <div className="grid gap-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Weight On Earth</Label>
            <Input
              type="number"
              min="0"
              step="0.1"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              className="h-10 text-base font-semibold"
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Unit</Label>
            <Select value={unit} onValueChange={(v: WeightUnit) => setUnit(v)}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="lb">lb</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2 grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sort Bodies</Label>
              <Select value={sortOrder} onValueChange={(v: SortOrder) => setSortOrder(v)}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Default Order</SelectItem>
                  <SelectItem value="heaviest">Heaviest First</SelectItem>
                  <SelectItem value="lightest">Lightest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Card className="w-full shadow-none">
                <CardContent className="p-3 flex items-center justify-between">
                  <Label htmlFor="dwarf-toggle" className="text-xs font-bold uppercase tracking-wider text-muted-foreground cursor-pointer">
                    Include Dwarf Planets
                  </Label>
                  <Toggle
                    id="dwarf-toggle"
                    pressed={includeDwarfPlanets}
                    onPressedChange={setIncludeDwarfPlanets}
                    aria-label="Toggle dwarf planets"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      <GravitySection
        title="Planets"
        subtitle="Surface gravity based comparison"
        unit={unit}
        earthWeight={earthWeight}
        bodies={visiblePlanets}
        sortOrder={sortOrder}
      />

      <GravitySection
        title="Moons"
        subtitle="Famous moons from our solar system"
        unit={unit}
        earthWeight={earthWeight}
        bodies={moons}
        sortOrder={sortOrder}
      />

      <GravitySection
        title="Stars"
        subtitle="Approximate surface-gravity comparison"
        unit={unit}
        earthWeight={earthWeight}
        bodies={stars}
        sortOrder={sortOrder}
      />
    </div>
  );
}
