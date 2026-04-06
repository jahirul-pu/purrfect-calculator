import { useState, useEffect } from "react";
import { addMonths, differenceInCalendarDays, differenceInMonths, format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarDays, Clock, Calendar as CalendarIcon, Hash, Hourglass, ChevronDown, Cake } from "lucide-react";
import { cn } from "@/lib/utils";

export function AgeCalculator() {
  const [dob, setDob] = useState<Date | undefined>(undefined);
  const [targetDate, setTargetDate] = useState<Date | undefined>(undefined);
  const [isDobCalendarOpen, setIsDobCalendarOpen] = useState(false);
  const [isTargetCalendarOpen, setIsTargetCalendarOpen] = useState(false);
  
  const [age, setAge] = useState({ years: 0, months: 0, days: 0 });
  const [stats, setStats] = useState({ 
    totalMonths: 0, 
    totalWeeks: 0, 
    totalDays: 0, 
    hours: 0, 
    nextBirthdayDays: 0,
    nextBirthdayMonths: 0,
    nextBirthdayRemainingDays: 0,
    nextBirthdayDate: undefined as Date | undefined,
  });

  useEffect(() => {
    if (!dob || !targetDate) return;

    if (targetDate < dob) {
      setAge({ years: 0, months: 0, days: 0 });
      setStats({ totalMonths: 0, totalWeeks: 0, totalDays: 0, hours: 0, nextBirthdayDays: 0, nextBirthdayMonths: 0, nextBirthdayRemainingDays: 0, nextBirthdayDate: undefined });
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
    
    const currentYearBirthday = new Date(dob);
    currentYearBirthday.setFullYear(targetDate.getFullYear());
    const isBirthdayToday = currentYearBirthday.toDateString() === targetDate.toDateString();
    
    let nextBday = currentYearBirthday;
    if (currentYearBirthday < targetDate) {
      nextBday.setFullYear(targetDate.getFullYear() + 1);
    }
    const daysToNext = isBirthdayToday
      ? 0
      : Math.ceil((nextBday.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));
    const monthsToNext = isBirthdayToday ? 0 : differenceInMonths(nextBday, targetDate);
    const anchorDate = addMonths(targetDate, monthsToNext);
    const remainingDaysToNext = isBirthdayToday ? 0 : differenceInCalendarDays(nextBday, anchorDate);

    setStats({
      totalMonths: (y * 12) + m,
      totalWeeks: Math.floor(totalDays / 7),
      totalDays: totalDays,
      hours: totalDays * 24,
      nextBirthdayDays: daysToNext,
      nextBirthdayMonths: monthsToNext,
      nextBirthdayRemainingDays: remainingDaysToNext,
      nextBirthdayDate: nextBday
    });

  }, [dob, targetDate]);

  const isValidSelection = dob && targetDate && targetDate >= dob;

  const handleDobSelect = (selectedDate: Date | undefined) => {
    setDob(selectedDate);
    if (selectedDate) setIsDobCalendarOpen(false);
  };

  const handleTargetDateSelect = (selectedDate: Date | undefined) => {
    setTargetDate(selectedDate);
    if (selectedDate) setIsTargetCalendarOpen(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Age Calculator</h1>
        <p className="text-muted-foreground font-medium">Calculate your exact age and life milestones.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-4 w-4" /> Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date of Birth</Label>
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
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-8 pb-8 text-center space-y-6">
              {!isValidSelection ? (
                <div className="py-4 text-muted-foreground font-medium">
                  {!dob ? "Select your date of birth" : "Target date must be after birth date"}
                </div>
              ) : (
                <div className="grid grid-cols-3 divide-x border rounded-lg bg-background p-6 shadow-sm">
                  <div className="space-y-1">
                    <p className="text-4xl font-bold">{age.years}</p>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Years</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-4xl font-bold">{age.months}</p>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Months</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-4xl font-bold">{age.days}</p>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Days</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {isValidSelection && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="flex flex-col items-center justify-center p-4 text-center">
                <CalendarIcon className="w-4 h-4 text-muted-foreground mb-2" />
                <p className="font-bold text-lg">{stats.totalMonths}</p>
                <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-tighter">Total Months</p>
              </Card>
              <Card className="flex flex-col items-center justify-center p-4 text-center">
                <Hash className="w-4 h-4 text-muted-foreground mb-2" />
                <p className="font-bold text-lg">{stats.totalWeeks.toLocaleString()}</p>
                <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-tighter">Total Weeks</p>
              </Card>
              <Card className="flex flex-col items-center justify-center p-4 text-center">
                <CalendarDays className="w-4 h-4 text-muted-foreground mb-2" />
                <p className="font-bold text-lg">{stats.totalDays.toLocaleString()}</p>
                <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-tighter">Total Days</p>
              </Card>
              <Card className="flex flex-col items-center justify-center p-4 text-center">
                <Hourglass className="w-4 h-4 text-muted-foreground mb-2" />
                <p className="font-bold text-lg">{stats.hours.toLocaleString()}</p>
                <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-tighter">Total Hours</p>
              </Card>
              </div>

              <Card className="w-full p-5 border-primary/20 bg-primary/5">
                <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:justify-between sm:text-left gap-3">
                  <div className="flex items-center gap-2">
                    <Cake className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Until Next Birthday</p>
                  </div>
                  <div className="text-2xl font-bold sm:ml-auto sm:text-right">
                    {stats.nextBirthdayDays === 0
                      ? "Today"
                      : `${stats.nextBirthdayMonths} months, ${stats.nextBirthdayRemainingDays} days`}
                  </div>
                </div>
                {stats.nextBirthdayDate && (
                  <p className="text-sm text-muted-foreground mt-3 text-center sm:text-left">
                    Next birthday: {format(stats.nextBirthdayDate, "PPP")}
                  </p>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
