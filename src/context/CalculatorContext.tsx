import { createContext, useContext, useState, type ReactNode } from "react";

interface CrossCalcData {
  // Vehicle → Invest bridge
  vehicleSavings: number;
  vehicleSavingsLabel: string;
  // Loan interest insight
  loanInterestRatio: number;
  // Active tab navigation
  activeMainTab: string;
  setActiveMainTab: (tab: string) => void;
  // Push data from one calc to another
  pushToInvest: (amount: number, label: string) => void;
  investPrefill: { initialBalance: number; monthlyContribution: number; label: string } | null;
  clearInvestPrefill: () => void;
}

const CalculatorContext = createContext<CrossCalcData | null>(null);

export function CalculatorProvider({
  children,
  activeMainTab,
  setActiveMainTab,
}: {
  children: ReactNode;
  activeMainTab: string;
  setActiveMainTab: (tab: string) => void;
}) {
  const [vehicleSavings, setVehicleSavings] = useState(0);
  const [vehicleSavingsLabel, setVehicleSavingsLabel] = useState("");
  const [loanInterestRatio] = useState(0);
  const [investPrefill, setInvestPrefill] = useState<{
    initialBalance: number;
    monthlyContribution: number;
    label: string;
  } | null>(null);

  const pushToInvest = (amount: number, label: string) => {
    setVehicleSavings(amount);
    setVehicleSavingsLabel(label);
    setInvestPrefill({
      initialBalance: 0,
      monthlyContribution: Math.round(amount / 12),
      label,
    });
    setActiveMainTab("invest");
  };

  const clearInvestPrefill = () => setInvestPrefill(null);

  return (
    <CalculatorContext.Provider
      value={{
        vehicleSavings,
        vehicleSavingsLabel,
        loanInterestRatio,
        activeMainTab,
        setActiveMainTab,
        pushToInvest,
        investPrefill,
        clearInvestPrefill,
      }}
    >
      {children}
    </CalculatorContext.Provider>
  );
}

export function useCalculatorContext() {
  const ctx = useContext(CalculatorContext);
  if (!ctx) throw new Error("useCalculatorContext must be inside CalculatorProvider");
  return ctx;
}
