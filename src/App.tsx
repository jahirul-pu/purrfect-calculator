import { PowerCalculator } from "@/components/PowerCalculator";
import { BankingCalculator } from "@/components/BankingCalculator";
import { VehicleCalculator } from "@/components/VehicleCalculator";
import { AgeCalculator } from "@/components/AgeCalculator";
import { UnitConverter } from "@/components/UnitConverter";
import { BMICalculator } from "@/components/BMICalculator";
import { LoanCalculator } from "@/components/LoanCalculator";
import { InvestmentCalculator } from "@/components/InvestmentCalculator";
import { CurrencyConverter } from "@/components/CurrencyConverter";
import { RangeMap } from "@/components/RangeMap";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Zap, CarFront, CalendarDays, Scale, Activity, Banknote, Globe, TrendingUp, RefreshCw, Map as MapIcon, Landmark } from "lucide-react";
import { useState } from "react";
import { currencies } from "@/lib/currency";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalculatorProvider } from "@/context/CalculatorContext";

function App() {
  const [currency, setCurrency] = useState("USD");
  const [mapRange, setMapRange] = useState(100);
  const [mapVehicleType, setMapVehicleType] = useState<"EV" | "Fuel">("EV");
  const [activeTab, setActiveTab] = useState("power");

  const activeCurrency = currencies.find(c => c.code === currency) || currencies[0];

  return (
    <CalculatorProvider activeMainTab={activeTab} setActiveMainTab={setActiveTab}>
      <div className="min-h-screen bg-background font-sans antialiased text-foreground">
        <div className="container mx-auto py-10 px-4 md:px-8 max-w-7xl space-y-8 animate-in fade-in duration-700">
          <header className="flex flex-col items-center text-center space-y-6 mb-12 relative">
            <div className="absolute right-0 top-0 hidden md:block">
              <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-lg border">
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
            </div>
            
            <div className="p-3 rounded-full bg-primary/10 text-primary mb-2 shadow-inner">
              <Activity className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
              Ultimate Calculator Suite
            </h1>
            <p className="text-xl text-muted-foreground max-w-[600px]">
              Professional-grade utility tools localized for <strong>{activeCurrency.name}</strong>.
            </p>

            <div className="md:hidden w-full">
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
          </header>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-10">
            <TabsList className="inline-flex h-auto w-full flex-wrap items-center justify-center gap-1 rounded-xl bg-muted p-1 sm:grid sm:grid-cols-5 lg:grid-cols-10">
              <TabsTrigger value="power" className="flex items-center gap-2 py-3 px-4">
                <Zap className="h-4 w-4" /> <span className="hidden sm:inline font-bold">Power</span>
              </TabsTrigger>
              <TabsTrigger value="vehicle" className="flex items-center gap-2 py-3 px-4">
                <CarFront className="h-4 w-4" /> <span className="hidden sm:inline font-bold">Vehicle</span>
              </TabsTrigger>
              <TabsTrigger value="age" className="flex items-center gap-2 py-3 px-4">
                <CalendarDays className="h-4 w-4" /> <span className="hidden sm:inline font-bold">Age</span>
              </TabsTrigger>
              <TabsTrigger value="unit" className="flex items-center gap-2 py-3 px-4">
                <Scale className="h-4 w-4" /> <span className="hidden sm:inline font-bold">Unit</span>
              </TabsTrigger>
              <TabsTrigger value="bmi" className="flex items-center gap-2 py-3 px-4">
                <Activity className="h-4 w-4" /> <span className="hidden sm:inline font-bold">BMI</span>
              </TabsTrigger>
              <TabsTrigger value="loan" className="flex items-center gap-2 py-3 px-4">
                <Banknote className="h-4 w-4" /> <span className="hidden sm:inline font-bold">Loan</span>
              </TabsTrigger>
              <TabsTrigger value="invest" className="flex items-center gap-2 py-3 px-4">
                <TrendingUp className="h-4 w-4" /> <span className="hidden sm:inline font-bold">Invest</span>
              </TabsTrigger>
              <TabsTrigger value="curr" className="flex items-center gap-2 py-3 px-4">
                <RefreshCw className="h-4 w-4" /> <span className="hidden sm:inline font-bold">Currency</span>
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-2 py-3 px-4">
                <MapIcon className="h-4 w-4" /> <span className="hidden sm:inline font-bold">Map</span>
              </TabsTrigger>
              <TabsTrigger value="banking" className="flex items-center gap-2 py-3 px-4">
                <Landmark className="h-4 w-4" /> <span className="hidden sm:inline font-bold">Banking</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-8 transition-all duration-300">
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
              <TabsContent value="banking" className="mt-0 focus-visible:outline-none">
                <BankingCalculator />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </CalculatorProvider>
  );
}

export default App;
