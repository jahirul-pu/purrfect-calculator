import { useState, useEffect } from "react";
import { addMonths, differenceInCalendarDays, differenceInMonths, format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarDays, Clock, Calendar as CalendarIcon, Hash, Hourglass, ChevronDown, Target, HeartPulse, Orbit } from "lucide-react";
import { cn } from "@/lib/utils";

export function AgeCalculator() {
  const [dob, setDob] = useState<Date | undefined>(undefined);
  const [targetDate, setTargetDate] = useState<Date | undefined>(undefined);
  const [isDobCalendarOpen, setIsDobCalendarOpen] = useState(false);
  const [isTargetCalendarOpen, setIsTargetCalendarOpen] = useState(false);
  const [dobManual, setDobManual] = useState({ day: "", month: "", year: "" });
  const [targetPreset, setTargetPreset] = useState<"today" | "yesterday" | "custom">("custom");
  const [liveMode, setLiveMode] = useState(false);
  const [isResultUpdating, setIsResultUpdating] = useState(false);
  
  const [age, setAge] = useState({ years: 0, months: 0, days: 0 });
  const [stats, setStats] = useState({ 
    totalMonths: 0, 
    totalWeeks: 0, 
    totalDays: 0, 
    hours: 0, 
    lifespanProgressPct: 0,
    heartbeatsLived: 0,
    earthOrbitsCompleted: 0,
    birthdayCycleProgressPct: 0,
    birthdayCountdownPct: 0,
    nextBirthdayDays: 0,
    nextBirthdayMonths: 0,
    nextBirthdayRemainingDays: 0,
    nextBirthdayDate: undefined as Date | undefined,
  });

  useEffect(() => {
    if (!dob || !targetDate) return;

    if (targetDate < dob) {
      setAge({ years: 0, months: 0, days: 0 });
      setStats({ totalMonths: 0, totalWeeks: 0, totalDays: 0, hours: 0, lifespanProgressPct: 0, heartbeatsLived: 0, earthOrbitsCompleted: 0, birthdayCycleProgressPct: 0, birthdayCountdownPct: 0, nextBirthdayDays: 0, nextBirthdayMonths: 0, nextBirthdayRemainingDays: 0, nextBirthdayDate: undefined });
      return;
    }

    let y = targetDate.getFullYear() - dob.getFullYear();
    let m = targetDate.getMonth() - dob.getMonth();
    let d = targetDate.getDate() - dob.getDate();

    if (d < 0) {
      m--;
      const tempDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0);
      d += tempDate.getDate();
    }
    if (m < 0) {
      y--;
      m += 12;
    }

    setAge({ years: y, months: m, days: d });

    const timeDiffMs = targetDate.getTime() - dob.getTime();
    const totalDays = Math.floor(timeDiffMs / (1000 * 60 * 60 * 24));
    const averageLifespanDays = 80 * 365.25;
    const lifespanProgressPct = Math.min(100, (totalDays / averageLifespanDays) * 100);
    const heartbeatsLived = Math.floor(totalDays * 24 * 60 * 70);
    const earthOrbitsCompleted = Math.floor(totalDays / 365.25);
    
    const currentYearBirthday = new Date(dob);
    currentYearBirthday.setFullYear(targetDate.getFullYear());
    const isBirthdayToday = currentYearBirthday.toDateString() === targetDate.toDateString();
    
    let nextBday = currentYearBirthday;
    if (currentYearBirthday < targetDate) {
      nextBday.setFullYear(targetDate.getFullYear() + 1);
    }
    const lastBday = new Date(nextBday);
    lastBday.setFullYear(nextBday.getFullYear() - 1);

    const daysToNext = isBirthdayToday
      ? 0
      : Math.ceil((nextBday.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));
    const monthsToNext = isBirthdayToday ? 0 : differenceInMonths(nextBday, targetDate);
    const anchorDate = addMonths(targetDate, monthsToNext);
    const remainingDaysToNext = isBirthdayToday ? 0 : differenceInCalendarDays(nextBday, anchorDate);
    const cycleDays = Math.max(1, differenceInCalendarDays(nextBday, lastBday));
    const elapsedInCycleDays = differenceInCalendarDays(targetDate, lastBday);
    const birthdayCycleProgressPct = Math.min(100, Math.max(0, (elapsedInCycleDays / cycleDays) * 100));
    const birthdayCountdownPct = 100 - birthdayCycleProgressPct;

    setStats({
      totalMonths: (y * 12) + m,
      totalWeeks: Math.floor(totalDays / 7),
      totalDays: totalDays,
      hours: totalDays * 24,
      lifespanProgressPct,
      heartbeatsLived,
      earthOrbitsCompleted,
      birthdayCycleProgressPct,
      birthdayCountdownPct,
      nextBirthdayDays: daysToNext,
      nextBirthdayMonths: monthsToNext,
      nextBirthdayRemainingDays: remainingDaysToNext,
      nextBirthdayDate: nextBday
    });

  }, [dob, targetDate]);

  const isValidSelection = dob && targetDate && targetDate >= dob;

  useEffect(() => {
    if (!(dob && targetDate && targetDate >= dob)) return;
    setIsResultUpdating(true);
    const timer = window.setTimeout(() => setIsResultUpdating(false), 320);
    return () => window.clearTimeout(timer);
  }, [dob, targetDate]);

  useEffect(() => {
    if (!liveMode) return;

    setTargetDate(new Date());
    const interval = window.setInterval(() => {
      setTargetDate(new Date());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [liveMode]);

  const handleDobSelect = (selectedDate: Date | undefined) => {
    setDob(selectedDate);
    if (selectedDate) {
      setDobManual({
        day: String(selectedDate.getDate()).padStart(2, "0"),
        month: String(selectedDate.getMonth() + 1).padStart(2, "0"),
        year: String(selectedDate.getFullYear()),
      });
    }
    if (selectedDate) setIsDobCalendarOpen(false);
  };

  const handleTargetDateSelect = (selectedDate: Date | undefined) => {
    setLiveMode(false);
    setTargetPreset("custom");
    setTargetDate(selectedDate);
    if (selectedDate) setIsTargetCalendarOpen(false);
  };

  const hoverLiftCardClass = "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm";

  const handleDobPartInput = (part: "day" | "month" | "year", value: string) => {
    const maxLen = part === "year" ? 4 : 2;
    const cleaned = value.replace(/\D/g, "").slice(0, maxLen);

    setDobManual((prev) => {
      const next = { ...prev, [part]: cleaned };

      const day = Number(next.day);
      const month = Number(next.month);
      const year = Number(next.year);

      const hasCompleteDate = next.day.length >= 1 && next.month.length >= 1 && next.year.length === 4;
      if (!hasCompleteDate) return next;

      if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31) return next;

      const candidate = new Date(year, month - 1, day);
      const isSameDate =
        candidate.getFullYear() === year &&
        candidate.getMonth() === month - 1 &&
        candidate.getDate() === day;

      if (!isSameDate || candidate > new Date()) return next;

      setDob(candidate);
      return next;
    });
  };

  const applyTargetPreset = (preset: "today" | "yesterday" | "custom") => {
    setTargetPreset(preset);

    if (preset === "today") {
      setLiveMode(false);
      setTargetDate(new Date());
      return;
    }

    if (preset === "yesterday") {
      setLiveMode(false);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      setTargetDate(yesterday);
      return;
    }

    setLiveMode(false);
    setIsTargetCalendarOpen(true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Life Timeline Explorer</h1>
        <p className="text-muted-foreground/80 font-medium">Explore your age as a story of time, rhythm, and orbit.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-4 space-y-4">
          <Card className="bg-muted/30 border-border/60 shadow-none">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-4 w-4" /> Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date of Birth</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    value={dobManual.day}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDobPartInput("day", e.target.value)}
                    placeholder="DD"
                    className="h-9 text-sm"
                  />
                  <Input
                    value={dobManual.month}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDobPartInput("month", e.target.value)}
                    placeholder="MM"
                    className="h-9 text-sm"
                  />
                  <Input
                    value={dobManual.year}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDobPartInput("year", e.target.value)}
                    placeholder="YYYY"
                    className="h-9 text-sm"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground/75">Manual format: DD / MM / YYYY</p>
                <Popover open={isDobCalendarOpen} onOpenChange={setIsDobCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-between text-left font-normal",
                        !dob && "text-muted-foreground"
                      )}
                    >
                      <div className="flex items-center">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dob ? format(dob, "PPP") : <span>Pick birth date</span>}
                      </div>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dob}
                      onSelect={handleDobSelect}
                      initialFocus
                      disabled={(date) => date > new Date()}
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Calculate Age At</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={targetPreset === "today" ? "default" : "outline"}
                    className="h-8 text-xs"
                    onClick={() => applyTargetPreset("today")}
                  >
                    Today
                  </Button>
                  <Button
                    type="button"
                    variant={targetPreset === "yesterday" ? "default" : "outline"}
                    className="h-8 text-xs"
                    onClick={() => applyTargetPreset("yesterday")}
                  >
                    Yesterday
                  </Button>
                  <Button
                    type="button"
                    variant={targetPreset === "custom" ? "default" : "outline"}
                    className="h-8 text-xs"
                    onClick={() => applyTargetPreset("custom")}
                  >
                    Custom
                  </Button>
                </div>

                <div className="rounded-lg border bg-background p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Live Mode</p>
                    <p className="text-[11px] text-muted-foreground/75">Updates age every second in real time.</p>
                  </div>
                  <Switch
                    checked={liveMode}
                    onCheckedChange={(checked) => {
                      setLiveMode(checked);
                      if (checked) {
                        setTargetPreset("today");
                      }
                    }}
                    aria-label="Toggle live mode"
                  />
                </div>

                <Popover open={isTargetCalendarOpen} onOpenChange={setIsTargetCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-between text-left font-normal",
                        !targetDate && "text-muted-foreground"
                      )}
                    >
                      <div className="flex items-center">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {targetDate ? format(targetDate, "PPP") : <span>Pick target date</span>}
                      </div>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={targetDate}
                      onSelect={handleTargetDateSelect}
                      initialFocus
                      fromYear={1900}
                      toYear={2100}
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-8 space-y-6">
          <Card className="bg-primary/10 border-primary/35 shadow-[0_18px_45px_-32px_hsl(var(--primary)/0.85)]">
            <CardContent className="pt-8 pb-8 text-center space-y-6">
              {!isValidSelection ? (
                <div className="py-4 text-muted-foreground font-medium">
                  {!dob ? "Select your date of birth" : "Target date must be after birth date"}
                </div>
              ) : (
                <div
                  className="rounded-xl border border-primary/30 bg-white dark:bg-slate-950/70 p-7 shadow-md"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/80">You Are</p>
                  <div className="mt-3 flex flex-wrap justify-center items-end gap-x-4 gap-y-2 text-5xl font-black leading-none tracking-tight sm:text-6xl">
                    <span className="inline-flex items-end gap-2">
                      <AnimatedNumber value={age.years} duration={700} className="tabular-nums" />
                      <span className="text-xl font-semibold text-muted-foreground/80 sm:text-2xl">Years</span>
                    </span>
                    <span className="inline-flex items-end gap-2">
                      <AnimatedNumber value={age.months} duration={700} className="tabular-nums" />
                      <span className="text-xl font-semibold text-muted-foreground/80 sm:text-2xl">Months</span>
                    </span>
                    <span className="inline-flex items-end gap-2">
                      <AnimatedNumber value={age.days} duration={700} className="tabular-nums" />
                      <span className="text-xl font-semibold text-muted-foreground/80 sm:text-2xl">Days</span>
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-muted-foreground/75">old</p>
                </div>
              )}
            </CardContent>
          </Card>

          {isValidSelection && (
            <div className={cn("space-y-4 transition-all duration-300", isResultUpdating && "opacity-85") }>
              <Card className={cn("border-border/60 bg-background shadow-none", hoverLiftCardClass)}>
                <CardContent className="p-5 grid gap-5 md:grid-cols-[1fr_160px]">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                        <span>Life Progress</span>
                        <span><AnimatedNumber value={stats.lifespanProgressPct} decimals={1} duration={550} suffix="%" /></span>
                      </div>
                      <Progress value={stats.lifespanProgressPct} className="h-3 bg-muted [&>div]:bg-primary" />
                      <p className="text-xs text-muted-foreground/75">Progress against an 80-year reference lifespan.</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                        <span>Time To Next Birthday</span>
                        <span><AnimatedNumber value={stats.nextBirthdayDays} duration={550} suffix=" days" /></span>
                      </div>
                      <Progress value={stats.birthdayCountdownPct} className="h-3 bg-muted [&>div]:bg-amber-500" />
                      <p className="text-xs text-muted-foreground/75">Countdown across your current birthday cycle.</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="relative h-32 w-32 rounded-full" style={{ background: `conic-gradient(hsl(var(--primary)) ${stats.birthdayCycleProgressPct}%, hsl(var(--muted)) ${stats.birthdayCycleProgressPct}% 100%)` }}>
                      <div className="absolute inset-2 rounded-full bg-background border flex flex-col items-center justify-center text-center px-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Next B-Day</p>
                        <p className="text-2xl font-black tabular-nums"><AnimatedNumber value={stats.nextBirthdayDays} duration={600} /></p>
                        <p className="text-[10px] text-muted-foreground/75">days left</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={cn("border-border/60 bg-background shadow-none", hoverLiftCardClass)}>
                <CardContent className="p-5 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg bg-background p-4 border">
                    <div className="flex items-center gap-2 text-muted-foreground/80 mb-1">
                      <Target className="h-4 w-4" />
                      <p className="text-[10px] font-bold uppercase tracking-wider">Lifespan Progress</p>
                    </div>
                    <p className="text-sm leading-relaxed">
                      You have lived about <span className="font-bold"><AnimatedNumber value={stats.lifespanProgressPct} decimals={1} duration={550} suffix="%" /></span> of an average 80-year lifespan.
                    </p>
                  </div>
                  <div className="rounded-lg bg-background p-4 border">
                    <div className="flex items-center gap-2 text-muted-foreground/80 mb-1">
                      <HeartPulse className="h-4 w-4" />
                      <p className="text-[10px] font-bold uppercase tracking-wider">Heartbeats Lived</p>
                    </div>
                    <p className="text-sm leading-relaxed">
                      Approximate heartbeats so far: <span className="font-bold"><AnimatedNumber value={stats.heartbeatsLived / 1_000_000_000} decimals={2} duration={550} suffix=" billion" /></span>.
                    </p>
                  </div>
                  <div className="rounded-lg bg-background p-4 border">
                    <div className="flex items-center gap-2 text-muted-foreground/80 mb-1">
                      <Orbit className="h-4 w-4" />
                      <p className="text-[10px] font-bold uppercase tracking-wider">Earth Orbits</p>
                    </div>
                    <p className="text-sm leading-relaxed">
                      Earth orbits completed: <span className="font-bold"><AnimatedNumber value={stats.earthOrbitsCompleted} duration={550} /></span>.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className={cn("flex flex-col items-center justify-center p-4 text-center shadow-none border-border/70", hoverLiftCardClass)}>
                <CalendarIcon className="w-4 h-4 text-muted-foreground/80 mb-2" />
                <p className="font-bold text-lg"><AnimatedNumber value={stats.totalMonths} duration={550} /></p>
                <p className="text-[9px] uppercase font-bold text-muted-foreground/75 tracking-tighter">Total Months</p>
              </Card>
              <Card className={cn("flex flex-col items-center justify-center p-4 text-center shadow-none border-border/70", hoverLiftCardClass)}>
                <Hash className="w-4 h-4 text-muted-foreground/80 mb-2" />
                <p className="font-bold text-lg"><AnimatedNumber value={stats.totalWeeks} duration={550} /></p>
                <p className="text-[9px] uppercase font-bold text-muted-foreground/75 tracking-tighter">Total Weeks</p>
              </Card>
              <Card className={cn("flex flex-col items-center justify-center p-4 text-center shadow-none border-border/70", hoverLiftCardClass)}>
                <CalendarDays className="w-4 h-4 text-muted-foreground/80 mb-2" />
                <p className="font-bold text-lg"><AnimatedNumber value={stats.totalDays} duration={550} /></p>
                <p className="text-[9px] uppercase font-bold text-muted-foreground/75 tracking-tighter">Total Days</p>
              </Card>
              <Card className={cn("flex flex-col items-center justify-center p-4 text-center shadow-none border-border/70", hoverLiftCardClass)}>
                <Hourglass className="w-4 h-4 text-muted-foreground/80 mb-2" />
                <p className="font-bold text-lg"><AnimatedNumber value={stats.hours} duration={550} /></p>
                <p className="text-[9px] uppercase font-bold text-muted-foreground/75 tracking-tighter">Total Hours</p>
              </Card>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
