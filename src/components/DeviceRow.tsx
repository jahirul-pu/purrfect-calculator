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
    <div className="grid grid-cols-1 items-end gap-4 rounded-2xl border border-border/70 bg-background/70 p-4 shadow-sm transition-[box-shadow,transform] duration-200 animate-in fade-in hover:shadow-md sm:grid-cols-12 sm:p-6">
      <div className="sm:col-span-4 grid gap-2">
        <Label htmlFor={`name-${device.id}`} className="text-[10px] uppercase font-medium text-muted-foreground/75 tracking-wider">Device Name</Label>
        <Input 
          id={`name-${device.id}`}
          placeholder="Appliance" 
          value={device.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="h-10 rounded-xl border-border/80 bg-background/80 px-3.5"
        />
      </div>

      <div className="sm:col-span-3 grid gap-2">
        <Label htmlFor={`watts-${device.id}`} className="text-[10px] uppercase font-medium text-muted-foreground/75 tracking-wider">Watts</Label>
        <Input 
          id={`watts-${device.id}`}
          type="number" 
          value={device.watts === 0 ? "" : device.watts}
          onChange={(e) => onUpdate({ watts: parseFloat(e.target.value) || 0 })}
          className="h-10 rounded-xl border-border/80 bg-background/80 px-3.5 font-mono"
        />
      </div>

      <div className="sm:col-span-2 grid gap-2">
        <Label htmlFor={`hours-${device.id}`} className="text-[10px] uppercase font-medium text-muted-foreground/75 tracking-wider">Hrs/Day</Label>
        <Input 
          id={`hours-${device.id}`}
          type="number" 
          value={device.hoursPerDay === 0 ? "" : device.hoursPerDay}
          onChange={(e) => onUpdate({ hoursPerDay: parseFloat(e.target.value) || 0 })}
          className="h-10 rounded-xl border-border/80 bg-background/80 px-3.5 font-mono"
        />
      </div>

      <div className="sm:col-span-2 grid gap-2">
        <Label htmlFor={`qty-${device.id}`} className="text-[10px] uppercase font-medium text-muted-foreground/75 tracking-wider">Qty</Label>
        <Input 
          id={`qty-${device.id}`}
          type="number" 
          value={device.quantity}
          onChange={(e) => onUpdate({ quantity: parseInt(e.target.value) || 1 })}
          className="h-10 rounded-xl border-border/80 bg-background/80 px-3.5 font-mono"
        />
      </div>

      <div className="flex justify-end sm:col-span-1">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onRemove}
          className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
