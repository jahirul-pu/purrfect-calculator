import { PowerCalculator } from "@/components/PowerCalculator";
import { BankingCalculator } from "@/components/BankingCalculator";
import { VehicleCalculator } from "@/components/VehicleCalculator";
import { AgeCalculator } from "@/components/AgeCalculator";
import { UnitConverter } from "@/components/UnitConverter";
import { BMICalculator } from "@/components/BMICalculator";
import { LoanCalculator } from "@/components/LoanCalculator";
import { InvestmentCalculator } from "@/components/InvestmentCalculator";
import { BatteryPackCalculator } from "@/components/BatteryPackCalculator";
import { CurrencyConverter } from "@/components/CurrencyConverter";
import { RangeMap } from "@/components/RangeMap";
import { PercentageCalculator } from "@/components/PercentageCalculator";
import { SpaceWeightCalculator } from "@/components/SpaceWeightCalculator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Zap, CarFront, CalendarDays, Scale, Activity, Banknote, Globe, TrendingUp, Map as MapIcon, Percent, Moon, Sun, Orbit, Battery, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { currencies } from "@/lib/currency";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalculatorProvider } from "@/context/CalculatorContext";
import { Toggle } from "@/components/ui/toggle";
import { Label } from "@/components/ui/label";

const THEME_STORAGE_KEY = "calculator-theme";
type TabGroup = "energy" | "mobility" | "finance" | "tools";

function App() {
  const [currency, setCurrency] = useState("USD");
  const [mapRange, setMapRange] = useState(100);
  const [mapVehicleType, setMapVehicleType] = useState<"EV" | "Fuel">("EV");
  const [activeTab, setActiveTab] = useState("power");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<TabGroup, boolean>>({
    energy: false,
    mobility: false,
    finance: false,
    tools: false,
  });

  const activeCurrency = currencies.find(c => c.code === currency) || currencies[0];

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      return;
    }

    if (savedTheme === "light") {
      setIsDarkMode(false);
      return;
    }

    setIsDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem(THEME_STORAGE_KEY, isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const toggleGroup = (group: TabGroup) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  return (
    <CalculatorProvider activeMainTab={activeTab} setActiveMainTab={setActiveTab}>
      <div className="min-h-screen bg-background font-sans antialiased text-foreground">
        <div className="container mx-auto py-10 px-4 md:px-8 max-w-7xl space-y-8 animate-in fade-in duration-700">
          <div className="sticky top-0 z-40 -mx-4 md:-mx-8 px-4 md:px-8 py-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
              <div className="hidden md:flex items-center gap-3 bg-muted/30 p-2 rounded-lg border">
                <div className="flex items-center gap-2">
                  {isDarkMode ? <Moon className="h-4 w-4 text-muted-foreground" /> : <Sun className="h-4 w-4 text-muted-foreground" />}
                  <Label htmlFor="desktop-theme-toggle" className="text-xs text-muted-foreground">Dark</Label>
                  <Toggle
                    id="desktop-theme-toggle"
                    pressed={isDarkMode}
                    onPressedChange={setIsDarkMode}
                    aria-label="Toggle dark mode"
                  />
                </div>
                <Globe className="h-4 w-4 text-muted-foreground" />
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-[120px] h-8 border-none bg-transparent focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(c => (
                      <SelectItem key={c.code} value={c.code}>{c.code} ({c.symbol})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:hidden w-full space-y-3">
                <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    <Label htmlFor="mobile-theme-toggle">Dark mode</Label>
                  </div>
                  <Toggle
                    id="mobile-theme-toggle"
                    pressed={isDarkMode}
                    onPressedChange={setIsDarkMode}
                    aria-label="Toggle dark mode"
                  />
                </div>

                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-full">
                    <Globe className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(c => (
                      <SelectItem key={c.code} value={c.code}>{c.code} - {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <header className="flex flex-col items-center text-center space-y-6 mb-6">
            <div className="p-3 rounded-full bg-primary/10 text-primary mb-2 shadow-inner">
              <Activity className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
              Ultimate Calculator Suite
            </h1>
            <p className="text-xl text-muted-foreground max-w-[600px]">
              Professional-grade utility tools localized for <strong>{activeCurrency.name}</strong>.
            </p>
          </header>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-10 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8 lg:space-y-0">
            <TabsList className="sticky top-[88px] z-30 h-auto w-full flex-wrap items-center justify-center gap-1 rounded-xl bg-muted p-1 lg:h-fit lg:self-start lg:flex lg:flex-col lg:items-stretch lg:justify-start lg:border lg:border-primary/20 lg:bg-gradient-to-b lg:from-primary/[0.10] lg:to-background lg:p-2 lg:[&>button]:w-full lg:[&>button]:justify-start lg:[&>[role=tab]]:relative lg:[&>[role=tab]]:rounded-xl lg:[&>[role=tab]]:border lg:[&>[role=tab]]:border-transparent lg:[&>[role=tab]]:bg-transparent lg:[&>[role=tab]]:text-muted-foreground lg:[&>[role=tab]:hover]:border-primary/25 lg:[&>[role=tab]:hover]:bg-primary/[0.08] lg:[&>[role=tab]:hover]:text-foreground lg:[&>[role=tab][data-state=active]]:border-primary/35 lg:[&>[role=tab][data-state=active]]:bg-primary/[0.16] lg:[&>[role=tab][data-state=active]]:text-primary lg:[&>[role=tab][data-state=active]]:shadow-[inset_3px_0_0_0_hsl(var(--primary))]">
              <button
                type="button"
                className="hidden lg:flex items-center gap-2 rounded-md px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground/80 transition-colors hover:bg-primary/[0.08] hover:text-primary"
                onClick={() => toggleGroup("energy")}
                aria-expanded={!collapsedGroups.energy}
              >
                <Zap className="h-3.5 w-3.5" /> Energy
                <ChevronDown className={`ml-auto h-3.5 w-3.5 transition-transform ${collapsedGroups.energy ? "-rotate-90" : "rotate-0"}`} />
              </button>
              <TabsTrigger value="power" className={`flex items-center gap-2 py-3 px-4 ${collapsedGroups.energy ? "lg:hidden" : ""}`}>
                <Zap className="h-4 w-4" /> <span className="hidden sm:inline font-bold">Power</span>
              </TabsTrigger>
              <TabsTrigger value="batteryPack" className={`flex items-center gap-2 py-3 px-4 ${collapsedGroups.energy ? "lg:hidden" : ""}`}>
                <Battery className="h-4 w-4 shrink-0" strokeWidth={2.25} /> <span className="hidden sm:inline font-bold">Battery Pack</span>
              </TabsTrigger>

              <button
                type="button"
                className="hidden lg:flex mt-2 items-center gap-2 rounded-md px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground/80 transition-colors hover:bg-primary/[0.08] hover:text-primary"
                onClick={() => toggleGroup("mobility")}
                aria-expanded={!collapsedGroups.mobility}
              >
                <CarFront className="h-3.5 w-3.5" /> Mobility
                <ChevronDown className={`ml-auto h-3.5 w-3.5 transition-transform ${collapsedGroups.mobility ? "-rotate-90" : "rotate-0"}`} />
              </button>
              <TabsTrigger value="vehicle" className={`flex items-center gap-2 py-3 px-4 ${collapsedGroups.mobility ? "lg:hidden" : ""}`}>
                <CarFront className="h-4 w-4" /> <span className="hidden sm:inline font-bold">Vehicle</span>
              </TabsTrigger>
              <TabsTrigger value="map" className={`flex items-center gap-2 py-3 px-4 ${collapsedGroups.mobility ? "lg:hidden" : ""}`}>
                <MapIcon className="h-4 w-4" /> <span className="hidden sm:inline font-bold">Map</span>
              </TabsTrigger>

              <button
                type="button"
                className="hidden lg:flex mt-2 items-center gap-2 rounded-md px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground/80 transition-colors hover:bg-primary/[0.08] hover:text-primary"
                onClick={() => toggleGroup("finance")}
                aria-expanded={!collapsedGroups.finance}
              >
                <Banknote className="h-3.5 w-3.5" /> Finance
                <ChevronDown className={`ml-auto h-3.5 w-3.5 transition-transform ${collapsedGroups.finance ? "-rotate-90" : "rotate-0"}`} />
              </button>
              <TabsTrigger value="loan" className={`flex items-center gap-2 py-3 px-4 ${collapsedGroups.finance ? "lg:hidden" : ""}`}>
                <Banknote className="h-4 w-4" /> <span className="hidden sm:inline font-bold">Loan</span>
              </TabsTrigger>
              <TabsTrigger value="invest" className={`flex items-center gap-2 py-3 px-4 ${collapsedGroups.finance ? "lg:hidden" : ""}`}>
                <TrendingUp className="h-4 w-4" /> <span className="hidden sm:inline font-bold">Invest</span>
              </TabsTrigger>
              <TabsTrigger value="curr" className={`flex items-center gap-2 py-3 px-4 ${collapsedGroups.finance ? "lg:hidden" : ""}`}>
                <Globe className="h-4 w-4 shrink-0" strokeWidth={2.25} /> <span className="hidden sm:inline font-bold">Currency</span>
              </TabsTrigger>
              <TabsTrigger value="banking" className={`flex items-center gap-2 py-3 px-4 ${collapsedGroups.finance ? "lg:hidden" : ""}`}>
                <Banknote className="h-4 w-4 shrink-0" strokeWidth={2.25} /> <span className="hidden sm:inline font-bold">Banking</span>
              </TabsTrigger>

              <button
                type="button"
                className="hidden lg:flex mt-2 items-center gap-2 rounded-md px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground/80 transition-colors hover:bg-primary/[0.08] hover:text-primary"
                onClick={() => toggleGroup("tools")}
                aria-expanded={!collapsedGroups.tools}
              >
                <Scale className="h-3.5 w-3.5" /> Tools
                <ChevronDown className={`ml-auto h-3.5 w-3.5 transition-transform ${collapsedGroups.tools ? "-rotate-90" : "rotate-0"}`} />
              </button>
              <TabsTrigger value="bmi" className={`flex items-center gap-2 py-3 px-4 ${collapsedGroups.tools ? "lg:hidden" : ""}`}>
                <Activity className="h-4 w-4" /> <span className="hidden sm:inline font-bold">BMI</span>
              </TabsTrigger>
              <TabsTrigger value="age" className={`flex items-center gap-2 py-3 px-4 ${collapsedGroups.tools ? "lg:hidden" : ""}`}>
                <CalendarDays className="h-4 w-4" /> <span className="hidden sm:inline font-bold">Age</span>
              </TabsTrigger>
              <TabsTrigger value="percent" className={`flex items-center gap-2 py-3 px-4 ${collapsedGroups.tools ? "lg:hidden" : ""}`}>
                <Percent className="h-4 w-4" /> <span className="hidden sm:inline font-bold">Percent</span>
              </TabsTrigger>
              <TabsTrigger value="unit" className={`flex items-center gap-2 py-3 px-4 ${collapsedGroups.tools ? "lg:hidden" : ""}`}>
                <Scale className="h-4 w-4" /> <span className="hidden sm:inline font-bold">Unit</span>
              </TabsTrigger>
              <TabsTrigger value="space" className={`flex items-center gap-2 py-3 px-4 ${collapsedGroups.tools ? "lg:hidden" : ""}`}>
                <Orbit className="h-4 w-4" /> <span className="hidden sm:inline font-bold">Space</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-8 min-w-0 transition-all duration-300 lg:mt-0">
              <TabsContent value="power" className="mt-0 focus-visible:outline-none">
                <PowerCalculator currency={currency} />
              </TabsContent>
              <TabsContent value="vehicle" className="mt-0 focus-visible:outline-none">
                <VehicleCalculator 
                  currency={currency} 
                  onRangeUpdate={(range: number, type: "EV" | "Fuel") => {
                    setMapRange(range);
                    setMapVehicleType(type);
                  }}
                />
              </TabsContent>
              <TabsContent value="age" className="mt-0 focus-visible:outline-none">
                <AgeCalculator />
              </TabsContent>
              <TabsContent value="unit" className="mt-0 focus-visible:outline-none">
                <UnitConverter />
              </TabsContent>
              <TabsContent value="bmi" className="mt-0 focus-visible:outline-none">
                <BMICalculator />
              </TabsContent>
              <TabsContent value="percent" className="mt-0 focus-visible:outline-none">
                <PercentageCalculator />
              </TabsContent>
              <TabsContent value="loan" className="mt-0 focus-visible:outline-none">
                <LoanCalculator currency={currency} />
              </TabsContent>
              <TabsContent value="invest" className="mt-0 focus-visible:outline-none">
                <InvestmentCalculator currency={currency} />
              </TabsContent>
              <TabsContent value="curr" className="mt-0 focus-visible:outline-none">
                <CurrencyConverter />
              </TabsContent>
              <TabsContent value="map" className="mt-0 focus-visible:outline-none">
                <RangeMap rangeKm={mapRange} vehicleType={mapVehicleType} />
              </TabsContent>
              <TabsContent value="space" className="mt-0 focus-visible:outline-none">
                <SpaceWeightCalculator />
              </TabsContent>
              <TabsContent value="banking" className="mt-0 focus-visible:outline-none">
                <BankingCalculator />
              </TabsContent>
              <TabsContent value="batteryPack" className="mt-0 focus-visible:outline-none">
                <BatteryPackCalculator />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </CalculatorProvider>
  );
}

export default App;
