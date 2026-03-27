import type { Device } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeviceRowProps {
  device: Device;
  onUpdate: (updates: Partial<Device>) => void;
  onRemove: () => void;
}

export function DeviceRow({ device, onUpdate, onRemove }: DeviceRowProps) {
  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-12 gap-4 items-end animate-in fade-in duration-300">
      <div className="sm:col-span-5 grid gap-1.5">
        <Label htmlFor={`name-${device.id}`} className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Device Name</Label>
        <Input 
          id={`name-${device.id}`}
          placeholder="Appliance" 
          value={device.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="h-8"
        />
      </div>

      <div className="sm:col-span-2 grid gap-1.5">
        <Label htmlFor={`watts-${device.id}`} className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Watts</Label>
        <Input 
          id={`watts-${device.id}`}
          type="number" 
          value={device.watts === 0 ? "" : device.watts}
          onChange={(e) => onUpdate({ watts: parseFloat(e.target.value) || 0 })}
          className="h-8 font-mono"
        />
      </div>

      <div className="sm:col-span-2 grid gap-1.5">
        <Label htmlFor={`hours-${device.id}`} className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Hrs/Day</Label>
        <Input 
          id={`hours-${device.id}`}
          type="number" 
          value={device.hoursPerDay === 0 ? "" : device.hoursPerDay}
          onChange={(e) => onUpdate({ hoursPerDay: parseFloat(e.target.value) || 0 })}
          className="h-8 font-mono"
        />
      </div>

      <div className="sm:col-span-2 grid gap-1.5">
        <Label htmlFor={`qty-${device.id}`} className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Qty</Label>
        <Input 
          id={`qty-${device.id}`}
          type="number" 
          value={device.quantity}
          onChange={(e) => onUpdate({ quantity: parseInt(e.target.value) || 1 })}
          className="h-8 font-mono"
        />
      </div>

      <div className="sm:col-span-1 flex justify-end">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onRemove}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
