import { useEffect, useState } from "react";
import { type PowerLevelMilestone as MilestoneType, checkPowerLevel } from "@/lib/realityTranslator";
import { cn } from "@/lib/utils";
import { Crown, Sparkles, Zap, Trophy } from "lucide-react";

interface PowerLevelMilestoneProps {
  amount: number;
  className?: string;
}

const levelIcons: Record<string, React.ReactNode> = {
  LEGENDARY: <Crown className="h-5 w-5" />,
  "OVER 9000": <Sparkles className="h-5 w-5" />,
  ELITE: <Trophy className="h-5 w-5" />,
  POWER: <Zap className="h-5 w-5" />,
};

const levelGradients: Record<string, string> = {
  LEGENDARY:
    "from-amber-400/20 via-yellow-500/20 to-orange-400/20 border-amber-400/40",
  "OVER 9000":
    "from-violet-400/20 via-fuchsia-500/20 to-pink-400/20 border-fuchsia-400/40",
  ELITE:
    "from-sky-400/15 via-blue-500/15 to-cyan-400/15 border-sky-400/30",
  POWER:
    "from-emerald-400/15 via-green-500/15 to-teal-400/15 border-emerald-400/30",
};

const textColors: Record<string, string> = {
  LEGENDARY: "text-amber-600",
  "OVER 9000": "text-fuchsia-600",
  ELITE: "text-sky-600",
  POWER: "text-emerald-600",
};

export function PowerLevelMilestoneCard({ amount, className }: PowerLevelMilestoneProps) {
  const [milestone, setMilestone] = useState<MilestoneType | null>(null);
  const [showBurst, setShowBurst] = useState(false);
  const [prevLevel, setPrevLevel] = useState<string | null>(null);

  useEffect(() => {
    const ms = checkPowerLevel(amount);
    setMilestone(ms);

    // Trigger burst animation when crossing into a new level
    if (ms && ms.level !== prevLevel) {
      setShowBurst(true);
      setPrevLevel(ms.level);
      const timer = setTimeout(() => setShowBurst(false), 2000);
      return () => clearTimeout(timer);
    }
    if (!ms) {
      setPrevLevel(null);
    }
  }, [amount]);

  if (!milestone) return null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-4 bg-gradient-to-br transition-all duration-700",
        levelGradients[milestone.level],
        className
      )}
    >
      {/* Burst effect */}
      {showBurst && (
        <div className="milestone-burst-overlay" />
      )}

      {/* Scanning line effect */}
      <div className="milestone-scan-line" />

      <div className="relative z-10 flex items-start gap-3">
        <div
          className={cn(
            "p-2 rounded-lg shrink-0",
            milestone.level === "LEGENDARY" && "bg-amber-500/20 text-amber-600",
            milestone.level === "OVER 9000" && "bg-fuchsia-500/20 text-fuchsia-600",
            milestone.level === "ELITE" && "bg-sky-500/20 text-sky-600",
            milestone.level === "POWER" && "bg-emerald-500/20 text-emerald-600"
          )}
        >
          {levelIcons[milestone.level]}
        </div>
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-[10px] font-black uppercase tracking-[0.2em]",
                textColors[milestone.level]
              )}
            >
              {milestone.title}
            </span>
          </div>
          <p className="text-xs font-medium text-foreground/70 leading-relaxed">
            {milestone.description}
          </p>
        </div>
      </div>

      {/* Floating particles for OVER 9000 and LEGENDARY */}
      {(milestone.level === "OVER 9000" || milestone.level === "LEGENDARY") && (
        <div className="milestone-particles">
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "milestone-particle",
                milestone.level === "LEGENDARY" ? "bg-amber-400" : "bg-fuchsia-400"
              )}
              style={{
                left: `${15 + i * 14}%`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
