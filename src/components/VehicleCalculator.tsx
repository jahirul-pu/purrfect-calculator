import { useState, useMemo, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EVCalculator } from "@/components/EVCalculator";
import { FuelCalculator } from "@/components/FuelCalculator";
import { EVChargingCalculator } from "@/components/EVChargingCalculator";
import { TripDistanceCalculator } from "@/components/TripDistanceCalculator";
import { ComparisonCard } from "@/components/ComparisonCard";
import { calculateEVBatteryKwh, adjustEVRange, calculateEVCost, calculateEVCostPerKm } from "@/lib/evCalc";
import { costPerKmFuel, adjustFuelEfficiency } from "@/lib/fuelCalc";

export function VehicleCalculator({ 
  currency, 
  onRangeUpdate 
}: { 
  currency: string; 
  onRangeUpdate?: (range: number, type: "EV" | "Fuel") => void 
}) {
  const [activeTab, setActiveTab] = useState<string>("ev");

  // EV State
  const [evType, setEvType] = useState<"Car" | "Bike">("Car");
  const [evVoltage, setEvVoltage] = useState<number>(0);
  const [evAh, setEvAh] = useState<number>(0);
  const [evRange, setEvRange] = useState<number>(0);
  const [evPrice, setEvPrice] = useState<number>(0);
  const [evAcOn, setEvAcOn] = useState<boolean>(false);
  const [evMode, setEvMode] = useState<"City" | "Highway">("City");

  // Fuel State
  const [fuelEfficiency, setFuelEfficiency] = useState<number>(0);
  const [fuelPrice, setFuelPrice] = useState<number>(0);
  const [fuelMode, setFuelMode] = useState<"City" | "Highway">("City");
  const [fuelTankCapacity, setFuelTankCapacity] = useState<number>(0);

  // Shared Comparison State
  const [distance, setDistance] = useState<number>(0);

  const batteryKwh = useMemo(() => calculateEVBatteryKwh(evVoltage, evAh), [evVoltage, evAh]);
  const fullChargeCost = useMemo(() => calculateEVCost(batteryKwh, evPrice), [batteryKwh, evPrice]);
  const finalEvRange = useMemo(() => {
    if (evType === "Bike") return evRange;
    return adjustEVRange(evRange, evAcOn, evMode);
  }, [evType, evRange, evAcOn, evMode]);
  const evCostPerKm = useMemo(() => calculateEVCostPerKm(fullChargeCost, finalEvRange), [fullChargeCost, finalEvRange]);

  const finalFuelEfficiency = useMemo(() => adjustFuelEfficiency(fuelEfficiency, fuelMode), [fuelEfficiency, fuelMode]);
  const fuelCostPerKm = useMemo(() => costPerKmFuel(fuelPrice, finalFuelEfficiency), [fuelPrice, finalFuelEfficiency]);

  useEffect(() => {
    if (!onRangeUpdate) return;
    if (activeTab === "ev" || activeTab === "charging" || activeTab === "range") {
      onRangeUpdate(finalEvRange, "EV");
    } else if (activeTab === "fuel") {
      onRangeUpdate(fuelTankCapacity * finalFuelEfficiency, "Fuel");
    }
  }, [activeTab, finalEvRange, finalFuelEfficiency, fuelTankCapacity, onRangeUpdate]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Vehicle Energy & Cost</h1>
        <p className="text-muted-foreground">Compare operational costs between Electric and Fuel vehicles.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="ev">EV Cost</TabsTrigger>
              <TabsTrigger value="fuel">Fuel Cost</TabsTrigger>
              <TabsTrigger value="charging">Charging</TabsTrigger>
              <TabsTrigger value="range">Range</TabsTrigger>
            </TabsList>
            
            <TabsContent value="ev" className="mt-0 focus-visible:outline-none">
              <EVCalculator 
                evType={evType} setEvType={setEvType}
                evVoltage={evVoltage} setEvVoltage={setEvVoltage}
                evAh={evAh} setEvAh={setEvAh}
                evRange={evRange} setEvRange={setEvRange}
                evPrice={evPrice} setEvPrice={setEvPrice}
                evAcOn={evAcOn} setEvAcOn={setEvAcOn}
                evMode={evMode} setEvMode={setEvMode}
                currency={currency}
              />
            </TabsContent>
            
            <TabsContent value="fuel" className="mt-0 focus-visible:outline-none">
              <FuelCalculator 
                efficiency={fuelEfficiency} setEfficiency={setFuelEfficiency}
                fuelPrice={fuelPrice} setFuelPrice={setFuelPrice}
                mode={fuelMode} setMode={setFuelMode}
                currency={currency}
                tankCapacity={fuelTankCapacity}
                setTankCapacity={setFuelTankCapacity}
              />
            </TabsContent>
            
            <TabsContent value="charging" className="mt-0 focus-visible:outline-none">
              <EVChargingCalculator batteryKwh={batteryKwh} />
            </TabsContent>

            <TabsContent value="range" className="mt-0 focus-visible:outline-none">
              <TripDistanceCalculator 
                initialFullEvRange={finalEvRange}
                initialFuelEfficiency={finalFuelEfficiency}
                initialTankCapacity={fuelTankCapacity}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-5">
          <ComparisonCard 
            evCostPerKm={evCostPerKm}
            fuelCostPerKm={fuelCostPerKm}
            distance={distance}
            setDistance={setDistance}
            currency={currency}
          />
        </div>
      </div>
    </div>
  );
}
