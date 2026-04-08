import { type Insight, type InsightTone } from "@/lib/insights";
import { AlertTriangle, CheckCircle2, Flame, Sparkles, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const toneStyles: Record<InsightTone, string> = {
  positive: "bg-emerald-500/8 border-emerald-500/25 text-emerald-700",
  neutral: "bg-blue-500/8 border-blue-500/25 text-blue-700",
  warning: "bg-amber-500/8 border-amber-500/25 text-amber-700",
  danger: "bg-rose-500/8 border-rose-500/25 text-rose-700",
};

export function InsightBox({ insight, className }: { insight: Insight; className?: string }) {
  const insightIcon =
    insight.icon === "check-circle-2"
      ? <CheckCircle2 className="h-4 w-4" />
      : insight.icon === "alert-triangle"
        ? <AlertTriangle className="h-4 w-4" />
        : insight.icon === "x-circle"
          ? <XCircle className="h-4 w-4" />
          : <Flame className="h-4 w-4" />;

  return (
    <div
      className={cn(
        "p-4 rounded-xl border flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500",
        toneStyles[insight.tone],
        className
      )}
    >
      <div className="flex items-center gap-2 shrink-0 mt-0.5">
        <Sparkles className="h-4 w-4 opacity-60" />
        <span className="inline-flex items-center">{insightIcon}</span>
      </div>
      <div className="space-y-0.5">
        <p className="text-[10px] font-black uppercase tracking-[0.15em] opacity-50">Insight</p>
        <p className="text-sm font-medium leading-relaxed">{insight.text}</p>
      </div>
    </div>
  );
}
