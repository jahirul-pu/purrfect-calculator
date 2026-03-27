import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MapPin, Battery, Fuel, Gauge, Navigation, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface TripDistanceCalculatorProps {
  initialFullEvRange: number;
  initialFuelEfficiency: number;
  initialTankCapacity: number;
}

export function TripDistanceCalculator({ 
  initialFullEvRange, 
  initialFuelEfficiency,
  initialTankCapacity
}: TripDistanceCalculatorProps) {
  // Local states for flexibility
  const [fullEvRange, setFullEvRange] = useState<number>(0);
  const [evSoc, setEvSoc] = useState<number>(0);
  
  const [fuelEfficiency, setFuelEfficiency] = useState<number>(0);
  const [fuelTankCapacity, setFuelTankCapacity] = useState<number>(0);
  const [fuelLiters, setFuelLiters] = useState<number>(0);

  // Update when parent props change (initial load or tab switch)
  useEffect(() => { setFullEvRange(initialFullEvRange); }, [initialFullEvRange]);
  useEffect(() => { setFuelEfficiency(initialFuelEfficiency); }, [initialFuelEfficiency]);
  useEffect(() => { setFuelTankCapacity(initialTankCapacity); }, [initialTankCapacity]);

  const evRemainingRange = useMemo(() => {
    return (evSoc / 100) * fullEvRange;
  }, [evSoc, fullEvRange]);

  const fuelRemainingRange = useMemo(() => {
    return fuelLiters * fuelEfficiency;
  }, [fuelLiters, fuelEfficiency]);

  const fuelPercentage = fuelTankCapacity > 0 ? (fuelLiters / fuelTankCapacity) * 100 : 0;

  return (
    <Card className="animate-in fade-in duration-500 shadow-lg border-2">
      <CardHeader className="bg-muted/30">
        <CardTitle className="text-xl flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          Trip Distance Calculator
        </CardTitle>
        <CardDescription>Estimate your remaining travel distance based on current energy/fuel.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 pt-6">
        <Tabs defaultValue="ev-trip" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger value="ev-trip" className="flex items-center gap-2 font-bold">
              <Battery className="h-4 w-4" /> EV Range
            </TabsTrigger>
            <TabsTrigger value="fuel-trip" className="flex items-center gap-2 font-bold">
              <Fuel className="h-4 w-4" /> Fuel Range
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ev-trip" className="space-y-6 mt-6 focus-visible:outline-none">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  Full Battery Range (km)
                </Label>
                <Input 
                  type="number" 
                  value={fullEvRange === 0 ? "" : fullEvRange} 
                  onChange={(e) => setFullEvRange(parseFloat(e.target.value) || 0)}
                  className="font-bold h-11"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Battery (%)</Label>
                <div className="relative">
                  <Input 
                    type="number" 
                    min="0" 
                    max="100" 
                    value={evSoc} 
                    onChange={(e) => setEvSoc(parseFloat(e.target.value) || 0)}
                    className="font-bold h-11 pr-10"
                  />
                  <span className="absolute right-3 top-2.5 text-muted-foreground font-bold">%</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold opacity-70">Energy Level</span>
                <span className="font-black text-primary">{evSoc}%</span>
              </div>
              <Progress value={evSoc} className="h-3 bg-background" />
            </div>

            <div className="p-8 rounded-2xl border-4 border-primary/20 bg-primary/5 text-center space-y-3 shadow-inner">
              <div className="flex items-center justify-center gap-2 text-primary/80">
                <Navigation className="h-6 w-6 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-[0.2em]">Remaining Adventure</span>
              </div>
              <p className="text-6xl font-black tracking-tighter text-primary">
                {Math.round(evRemainingRange)} <span className="text-2xl ml-1">km</span>
              </p>
              <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground font-bold uppercase bg-background/50 py-1 px-3 rounded-full w-fit mx-auto">
                <Info className="h-3 w-3" /> Based on {fullEvRange}km full capacity
              </div>
            </div>
          </TabsContent>

          <TabsContent value="fuel-trip" className="space-y-6 mt-6 focus-visible:outline-none">
             <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mileage (km/L)</Label>
                <Input 
                  type="number" 
                  value={fuelEfficiency === 0 ? "" : fuelEfficiency} 
                  onChange={(e) => setFuelEfficiency(parseFloat(e.target.value) || 0)}
                  className="font-bold h-11"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tank Capacity (L)</Label>
                <Input 
                  type="number" 
                  value={fuelTankCapacity === 0 ? "" : fuelTankCapacity} 
                  onChange={(e) => setFuelTankCapacity(parseFloat(e.target.value) || 0)}
                  className="font-bold h-11"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Fuel (L)</Label>
                <Input 
                  type="number" 
                  value={fuelLiters === 0 ? "" : fuelLiters} 
                  onChange={(e) => setFuelLiters(parseFloat(e.target.value) || 0)}
                  className="font-bold h-11"
                />
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold opacity-70">Fuel Gauge</span>
                <span className="font-black text-primary">{Math.round(fuelPercentage)}% Full</span>
              </div>
              <Progress value={fuelPercentage} className="h-3 bg-background" />
            </div>

            <div className="p-8 rounded-2xl border-4 border-emerald-500/20 bg-emerald-500/5 text-center space-y-3 shadow-inner">
              <div className="flex items-center justify-center gap-2 text-emerald-600/80">
                <Gauge className="h-6 w-6 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-[0.2em]">Remaining Road</span>
              </div>
              <p className="text-6xl font-black tracking-tighter text-emerald-600">
                {Math.round(fuelRemainingRange)} <span className="text-2xl ml-1">km</span>
              </p>
              <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground font-bold uppercase bg-background/50 py-1 px-3 rounded-full w-fit mx-auto">
                <Info className="h-3 w-3" /> {fuelLiters}L @ {fuelEfficiency}km/L
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
