import { type RealityComparison } from "@/lib/realityTranslator";
import { Activity, Battery, Bike, Car, Droplets, Flame, Home, Lamp, Monitor, Thermometer, Trophy, Tv, Zap, Telescope } from "lucide-react";
import { cn } from "@/lib/utils";

interface RealityTranslatorPanelProps {
  comparisons: RealityComparison[];
  title?: string;
  className?: string;
}

export function RealityTranslatorPanel({
  comparisons,
  title = "Reality Check",
  className,
}: RealityTranslatorPanelProps) {
  if (!comparisons.length) return null;

  const getComparisonIcon = (symbol: string) => {
    switch (symbol) {
      case "zap":
        return <Zap className="h-5 w-5" />;
      case "battery":
        return <Battery className="h-5 w-5" />;
      case "lightbulb":
        return <Lamp className="h-5 w-5" />;
      case "laptop":
      case "monitor":
        return <Monitor className="h-5 w-5" />;
      case "car":
        return <Car className="h-5 w-5" />;
      case "house":
        return <Home className="h-5 w-5" />;
      case "tv":
        return <Tv className="h-5 w-5" />;
      case "bike":
        return <Bike className="h-5 w-5" />;
      case "flame":
        return <Flame className="h-5 w-5" />;
      case "wind":
      case "ice-cream-cone":
      case "sun-medium":
      case "sun":
      case "snowflake":
      case "smile":
        return <Thermometer className="h-5 w-5" />;
      case "shower-head":
        return <Droplets className="h-5 w-5" />;
      case "trophy":
      case "target":
        return <Trophy className="h-5 w-5" />;
      case "trending-up":
      case "chart-column":
      case "rocket":
        return <Activity className="h-5 w-5" />;
      default:
        return <Battery className="h-5 w-5" />;
    }
  };

  return (
    <div
      className={cn(
        "reality-translator-panel rounded-xl border overflow-hidden",
        "bg-gradient-to-br from-violet-500/5 via-fuchsia-500/5 to-amber-500/5",
        "border-violet-500/20",
        className
      )}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-violet-500/15 bg-violet-500/5 flex items-center gap-2">
        <div className="relative">
          <Telescope className="h-4 w-4 text-violet-600" />
          <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-violet-500 animate-ping" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-700">
          {title}
        </span>
      </div>

      {/* Comparisons */}
      <div className="divide-y divide-violet-500/10">
        {comparisons.map((comp, i) => (
          <div
            key={`${comp.label}-${i}`}
            className="px-4 py-3 flex items-start gap-3 hover:bg-violet-500/5 transition-colors group"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <span className="mt-0.5 text-violet-700 group-hover:scale-125 transition-transform duration-300">
              {getComparisonIcon(comp.icon)}
            </span>
            <div className="space-y-0.5 min-w-0">
              <p className="text-xs font-bold text-violet-700 uppercase tracking-wider">
                {comp.label}
              </p>
              <p className="text-sm font-medium text-foreground/80 leading-snug">
                {comp.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
