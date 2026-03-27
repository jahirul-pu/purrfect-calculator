export interface LoanResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
}

export function calculateLoan(amount: number, rate: number, years: number, months: number): LoanResult {
  const totalMonths = (years * 12) + months;
  if (totalMonths <= 0 || amount <= 0) return { monthlyPayment: 0, totalPayment: 0, totalInterest: 0 };

  const monthlyRate = (rate / 100) / 12;
  
  let monthlyPayment = 0;
  if (monthlyRate === 0) {
    monthlyPayment = amount / totalMonths;
  } else {
    monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
  }

  const totalPayment = monthlyPayment * totalMonths;
  const totalInterest = totalPayment - amount;

  return {
    monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
    totalPayment: parseFloat(totalPayment.toFixed(2)),
    totalInterest: parseFloat(totalInterest.toFixed(2)),
  };
}
