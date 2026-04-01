// ─── FDR (Fixed Deposit Receipt) Calculation Engine ────────────────────────
export interface FDRResult {
  principal: number;
  grossInterest: number;
  taxDeducted: number;
  netInterest: number;
  maturityAmount: number;
  yearlyBreakdown: FDRYearBreakdown[];
}

export interface FDRYearBreakdown {
  year: number;
  openingBalance: number;
  grossInterest: number;
  taxDeducted: number;
  netInterest: number;
  closingBalance: number;
}

export function calculateFDR(
  principal: number,
  annualRate: number,
  termMonths: number,
  taxRate: number, // 0.15 for Standard, 0.10 for e-TIN
  autoRenew: boolean
): FDRResult {
  if (principal <= 0 || annualRate <= 0 || termMonths <= 0) {
    return {
      principal,
      grossInterest: 0,
      taxDeducted: 0,
      netInterest: 0,
      maturityAmount: principal,
      yearlyBreakdown: [],
    };
  }

  const yearlyBreakdown: FDRYearBreakdown[] = [];

  if (autoRenew) {
    // Compound loop: Tax deducted annually before next compounding cycle
    const years = Math.ceil(termMonths / 12);
    let currentBalance = principal;
    let totalTaxDeducted = 0;

    for (let i = 1; i <= years; i++) {
      // For the last year, if termMonths is not a multiple of 12,
      // only calculate for the remaining months
      const monthsThisYear = i === years && termMonths % 12 !== 0
        ? termMonths % 12
        : 12;

      const yearlyGrossInterest = currentBalance * (annualRate / 100.0) * (monthsThisYear / 12);
      const yearlyTax = yearlyGrossInterest * taxRate;
      const yearlyNetInterest = yearlyGrossInterest - yearlyTax;

      yearlyBreakdown.push({
        year: i,
        openingBalance: currentBalance,
        grossInterest: yearlyGrossInterest,
        taxDeducted: yearlyTax,
        netInterest: yearlyNetInterest,
        closingBalance: currentBalance + yearlyNetInterest,
      });

      totalTaxDeducted += yearlyTax;
      currentBalance += yearlyNetInterest;
    }

    const totalGrossInterest = (currentBalance - principal) + totalTaxDeducted;

    return {
      principal,
      grossInterest: totalGrossInterest,
      taxDeducted: totalTaxDeducted,
      netInterest: totalGrossInterest - totalTaxDeducted,
      maturityAmount: currentBalance,
      yearlyBreakdown,
    };
  } else {
    // Simple term: Flat calculation
    const grossInterest = principal * (annualRate / 100.0) * (termMonths / 12);
    const taxDeducted = grossInterest * taxRate;
    const netInterest = grossInterest - taxDeducted;
    const maturityAmount = principal + netInterest;

    yearlyBreakdown.push({
      year: 1,
      openingBalance: principal,
      grossInterest,
      taxDeducted,
      netInterest,
      closingBalance: maturityAmount,
    });

    return {
      principal,
      grossInterest,
      taxDeducted,
      netInterest,
      maturityAmount,
      yearlyBreakdown,
    };
  }
}

// ─── DPS (Deposit Plus Scheme) Calculation Engine ──────────────────────────
export interface DPSResult {
  monthlyInstallment: number;
  totalMonths: number;
  totalPrincipalInjected: number;
  grossInterest: number;
  taxDeducted: number;
  netInterest: number;
  maturityAmount: number;
}

export function calculateDPS(
  monthlyInstallment: number,
  annualRate: number,
  years: number,
  taxRate: number // 0.15 for Standard, 0.10 for e-TIN
): DPSResult {
  if (monthlyInstallment <= 0 || annualRate <= 0 || years <= 0) {
    return {
      monthlyInstallment,
      totalMonths: years * 12,
      totalPrincipalInjected: monthlyInstallment * years * 12,
      grossInterest: 0,
      taxDeducted: 0,
      netInterest: 0,
      maturityAmount: monthlyInstallment * years * 12,
    };
  }

  const months = years * 12;
  const totalPrincipalInjected = monthlyInstallment * months;

  // Core arithmetic progression formula for recurring monthly deposits:
  // I = P × [n(n+1) / 2] × (r / 12)
  // where P is installment, n is total months, r is annual rate as decimal fraction
  const grossInterest =
    monthlyInstallment *
    ((months * (months + 1)) / 2.0) *
    (annualRate / 100.0 / 12.0);

  const taxDeducted = grossInterest * taxRate;
  const netInterest = grossInterest - taxDeducted;
  const maturityAmount = totalPrincipalInjected + netInterest;

  return {
    monthlyInstallment,
    totalMonths: months,
    totalPrincipalInjected,
    grossInterest,
    taxDeducted,
    netInterest,
    maturityAmount,
  };
}
