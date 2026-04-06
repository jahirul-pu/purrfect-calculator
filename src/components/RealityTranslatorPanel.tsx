import { type RealityComparison } from "@/lib/realityTranslator";
import { Telescope } from "lucide-react";
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
            <span className="text-xl mt-0.5 group-hover:scale-125 transition-transform duration-300">
              {comp.icon}
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
