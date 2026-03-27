import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Timer, Battery } from "lucide-react";
import { calculateEVChargingTime } from "@/lib/evCalc";

export function EVChargingCalculator({ batteryKwh }: { batteryKwh: number }) {
  const [currentSoc, setCurrentSoc] = useState<number>(0);
  const [targetSoc, setTargetSoc] = useState<number>(0);
  const [chargerPowerWatts, setChargerPowerWatts] = useState<number>(0);

  const chargerPowerKw = chargerPowerWatts / 1000;
  const chargingTime = calculateEVChargingTime(batteryKwh, currentSoc, targetSoc, chargerPowerKw);
  
  const hours = Math.floor(chargingTime);
  const minutes = Math.round((chargingTime - hours) * 60);

  return (
    <Card className="animate-in slide-in-from-right duration-500 shadow-lg border-2">
      <CardHeader className="bg-muted/30">
        <CardTitle className="text-xl flex items-center gap-2">
          <Zap className="h-6 w-6 text-yellow-500" /> EV Charging Time
        </CardTitle>
        <CardDescription>Direct control over charging power for precise estimation.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                Current Charge (%)
              </Label>
              <div className="relative">
                <Input 
                  type="number" 
                  value={currentSoc === 0 ? "" : currentSoc} 
                  onChange={(e) => setCurrentSoc(Number(e.target.value))} 
                  className="font-bold h-11 pr-10"
                />
                <span className="absolute right-3 top-2.5 text-muted-foreground font-bold">%</span>
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target Charge (%)</Label>
              <div className="relative">
                <Input 
                  type="number" 
                  value={targetSoc === 0 ? "" : targetSoc} 
                  onChange={(e) => setTargetSoc(Number(e.target.value))} 
                  className="font-bold h-11 pr-10"
                />
                <span className="absolute right-3 top-2.5 text-muted-foreground font-bold">%</span>
              </div>
            </div>

            <div className="grid gap-2 p-4 rounded-xl border-2 border-primary/10 bg-primary/5">
              <Label className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2 mb-1">
                <Zap className="h-3 w-3" /> Charging Power (Watts)
              </Label>
              <div className="relative">
                <Input 
                  type="number" 
                  step="100"
                  value={chargerPowerWatts === 0 ? "" : chargerPowerWatts} 
                  onChange={(e) => setChargerPowerWatts(Number(e.target.value))} 
                  className="font-bold h-12 text-lg border-primary/20 focus-visible:ring-primary"
                />
                <span className="absolute right-4 top-3 text-muted-foreground font-bold">W</span>
              </div>
              <p className="text-[10px] text-muted-foreground italic pl-1">Equivalent to {(chargerPowerWatts / 1000).toFixed(2)} kW</p>
            </div>
          </div>

          <div className="flex flex-col justify-center items-center p-12 rounded-2xl border-4 border-primary/20 bg-primary/5 relative overflow-hidden group shadow-inner h-full min-h-[300px]">
             <div className="absolute -right-8 -top-8 opacity-[0.03] transform rotate-12 transition-transform group-hover:rotate-45 scale-150">
               <Battery className="h-64 w-64" />
             </div>
             
             <div className="text-center space-y-4 relative z-10 w-full">
               <div className="inline-flex p-4 rounded-full bg-primary/10 text-primary mb-2 shadow-sm">
                 <Timer className="h-10 w-10" />
               </div>
               <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Est. Charging Time</p>
               
               <div className="flex items-center gap-2 justify-center">
                 <div className="text-center">
                   <p className="text-6xl font-black tabular-nums">{hours}</p>
                   <p className="text-[10px] uppercase font-bold text-muted-foreground">Hours</p>
                 </div>
                 <span className="text-3xl font-black text-muted-foreground/30 mb-4">:</span>
                 <div className="text-center">
                   <p className="text-6xl font-black tabular-nums">{minutes.toString().padStart(2, '0')}</p>
                   <p className="text-[10px] uppercase font-bold text-muted-foreground">Minutes</p>
                 </div>
               </div>

               <div className="pt-6 border-t border-primary/10 flex flex-col gap-1">
                 <p className="text-xs font-bold text-muted-foreground flex items-center justify-center gap-1">
                   Energy Needed: <span className="text-foreground">{(batteryKwh * Math.max(0, (targetSoc - currentSoc)) / 100).toFixed(1)} kWh</span>
                 </p>
                 <p className="text-[10px] text-muted-foreground/80 font-medium italic">
                   Calculated with 90% charging efficiency
                 </p>
               </div>
             </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
