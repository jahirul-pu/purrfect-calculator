import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
  goldThreshold?: number;
}

/**
 * AnimatedNumber — Kinetic rolling number display.
 * Numbers roll like vintage combination lock dials when values change.
 * Triggers gold effect when crossing the goldThreshold.
 */
export function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 800,
  className,
  goldThreshold,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isGold, setIsGold] = useState(false);
  const previousValue = useRef(value);
  const animationRef = useRef<number | null>(null);

  const animate = useCallback(
    (from: number, to: number) => {
      setIsAnimating(true);
      const startTime = performance.now();
      const diff = to - from;

      const step = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic for mechanical "decelerating" feel
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = from + diff * eased;

        setDisplayValue(current);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(step);
        } else {
          setDisplayValue(to);
          setIsAnimating(false);
        }
      };

      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      animationRef.current = requestAnimationFrame(step);
    },
    [duration]
  );

  useEffect(() => {
    if (value !== previousValue.current) {
      animate(previousValue.current, value);
      previousValue.current = value;
    }
  }, [value, animate]);

  // Gold effect
  useEffect(() => {
    if (goldThreshold && value >= goldThreshold) {
      setIsGold(true);
    } else {
      setIsGold(false);
    }
  }, [value, goldThreshold]);

  // Haptic feedback (vibrate API)
  useEffect(() => {
    if (isAnimating && navigator.vibrate) {
      navigator.vibrate(10);
    }
  }, [isAnimating]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const formatted = displayValue.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span
      className={cn(
        "inline-flex items-baseline tabular-nums transition-all duration-300",
        isAnimating && "animated-number-rolling",
        isGold && "animated-number-gold",
        className
      )}
    >
      {prefix && <span className="animated-number-affix">{prefix}</span>}
      <span className={cn("animated-number-digits", isAnimating && "is-rolling")}>
        {formatted}
      </span>
      {suffix && <span className="animated-number-affix ml-1">{suffix}</span>}
    </span>
  );
}
