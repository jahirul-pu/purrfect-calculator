export type InvestmentResult = {
  year: number;
  balance: number;
  totalContribution: number;
  totalInterest: number;
};

export function calculateCompoundInterest(
  initialBalance: number,
  monthlyContribution: number,
  annualRate: number,
  years: number
): InvestmentResult[] {
  const results: InvestmentResult[] = [];
  let currentBalance = initialBalance;
  let totalContribution = initialBalance;
  const monthlyRate = annualRate / 100 / 12;

  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      currentBalance = (currentBalance + monthlyContribution) * (1 + monthlyRate);
      totalContribution += monthlyContribution;
    }
    results.push({
      year: y,
      balance: Math.round(currentBalance),
      totalContribution: Math.round(totalContribution),
      totalInterest: Math.round(currentBalance - totalContribution),
    });
  }

  return results;
}
