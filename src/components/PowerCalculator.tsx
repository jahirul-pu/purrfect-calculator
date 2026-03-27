import { useState, useMemo } from "react";
import { DeviceRow } from "@/components/DeviceRow";
import { SummaryCard } from "@/components/SummaryCard";
import { IPSRecommendation } from "@/components/IPSRecommendation";
import type { Device } from "@/types";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export function PowerCalculator({ currency }: { currency: string }) {
  const [devices, setDevices] = useState<Device[]>([
    { id: "1", name: "", watts: 0, hoursPerDay: 0, quantity: 0 },
  ]);
  const [electricityRate, setElectricityRate] = useState<number>(0);

  const addDevice = () => {
    setDevices([
      ...devices,
      { id: Date.now().toString(), name: "New Device", watts: 0, hoursPerDay: 0, quantity: 1 },
    ]);
  };

  const updateDevice = (id: string, updates: Partial<Device>) => {
    setDevices(devices.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  };

  const removeDevice = (id: string) => {
    if (devices.length > 1) {
      setDevices(devices.filter((d) => d.id !== id));
    }
  };

  const totalLoad = useMemo(() => 
    devices.reduce((acc, d) => acc + (d.watts * d.quantity), 0), 
  [devices]);

  const dailyKWh = useMemo(() => 
    devices.reduce((acc, d) => acc + (d.watts * d.hoursPerDay * d.quantity / 1000), 0), 
  [devices]);

  const monthlyKWh = dailyKWh * 30;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Power Consumption</h1>
        <p className="text-muted-foreground">Calculate appliance loads and IPS/Solar requirements.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-card rounded-lg border shadow-sm">
            <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <PlusCircle className="h-4 w-4" /> Connected Devices
              </h2>
              <Button onClick={addDevice} variant="outline" size="sm" className="h-8 gap-1">
                <PlusCircle className="h-3.5 w-3.5" /> Add Device
              </Button>
            </div>
            
            <div className="divide-y">
              {devices.map((device) => (
                <DeviceRow
                  key={device.id}
                  device={device}
                  onUpdate={(updates) => updateDevice(device.id, updates)}
                  onRemove={() => removeDevice(device.id)}
                />
              ))}
            </div>
            
            {devices.length === 0 && (
              <div className="p-12 text-center text-muted-foreground italic">
                No devices added yet. Click "Add Device" to start.
              </div>
            )}
          </div>

          <IPSRecommendation totalLoadWatts={totalLoad} totalDailyKwh={dailyKWh} />
        </div>

        {/* Summary Column */}
        <div className="lg:col-span-5">
          <SummaryCard
            totalLoad={totalLoad}
            dailyKWh={dailyKWh}
            monthlyKWh={monthlyKWh}
            electricityRate={electricityRate}
            setElectricityRate={setElectricityRate}
            currency={currency}
          />
        </div>
      </div>
    </div>
  );
}
