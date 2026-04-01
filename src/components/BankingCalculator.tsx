import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FDRCalculator } from "@/components/FDRCalculator";
import { DPSCalculator } from "@/components/DPSCalculator";
import { Landmark, PiggyBank } from "lucide-react";

export function BankingCalculator() {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Banking Calculator</h1>
        <p className="text-muted-foreground font-medium">
          FDR &amp; DPS maturity projections for Bangladeshi banking products.
        </p>
      </div>

      <Tabs defaultValue="fdr" className="w-full space-y-6">
        <TabsList className="inline-flex h-auto w-full items-center justify-center gap-1 rounded-xl bg-muted p-1 grid grid-cols-2">
          <TabsTrigger
            value="fdr"
            className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm"
          >
            <Landmark className="h-4 w-4" />
            <span className="font-bold">FDR</span>
            <span className="hidden sm:inline text-muted-foreground text-xs font-medium">Fixed Deposit</span>
          </TabsTrigger>
          <TabsTrigger
            value="dps"
            className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-sky-500/10 data-[state=active]:text-sky-700 data-[state=active]:shadow-sm"
          >
            <PiggyBank className="h-4 w-4" />
            <span className="font-bold">DPS</span>
            <span className="hidden sm:inline text-muted-foreground text-xs font-medium">Deposit Plus</span>
          </TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 lg:col-start-3">
            <TabsContent forceMount value="fdr" className="mt-0 focus-visible:outline-none data-[state=inactive]:hidden">
              <FDRCalculator />
            </TabsContent>
            <TabsContent forceMount value="dps" className="mt-0 focus-visible:outline-none data-[state=inactive]:hidden">
              <DPSCalculator />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
