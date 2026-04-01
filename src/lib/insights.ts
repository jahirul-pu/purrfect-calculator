// ─── Playfully Serious Insight Engine ──────────────────────────────────────
// Generates human, witty reactions to financial math results.

export type InsightTone = "positive" | "neutral" | "warning" | "danger";

export interface Insight {
  emoji: string;
  text: string;
  tone: InsightTone;
}

// ── Investment Insights ────────────────────────────────────────────────────
export function getInvestmentInsight(
  totalContribution: number,
  finalBalance: number,
  years: number,
  monthlyContribution: number
): Insight {
  if (totalContribution <= 0 || finalBalance <= 0) {
    return { emoji: "💡", text: "Enter your strategy to see what your money can become.", tone: "neutral" };
  }

  const growthPct = ((finalBalance / totalContribution) - 1) * 100;
  const interestEarned = finalBalance - totalContribution;

  if (growthPct > 200) {
    return {
      emoji: "🚀",
      text: `Your money just tripled. That's ${years} years of patience paying off — your future self is golfing.`,
      tone: "positive",
    };
  }
  if (growthPct > 100) {
    return {
      emoji: "🎯",
      text: `You doubled your money. Compound interest did half the work — you just had to not touch it.`,
      tone: "positive",
    };
  }
  if (interestEarned > monthlyContribution * 12 * 3) {
    return {
      emoji: "🍺",
      text: `Your interest alone covers ${Math.floor(interestEarned / (monthlyContribution * 12))} years of contributions. Your future self is buying you a beer.`,
      tone: "positive",
    };
  }
  if (growthPct > 50) {
    return {
      emoji: "📈",
      text: `Solid ${growthPct.toFixed(0)}% growth. You're outpacing inflation and most savings accounts. Not bad at all.`,
      tone: "positive",
    };
  }
  if (growthPct > 20) {
    return {
      emoji: "🌱",
      text: `Growing steadily at ${growthPct.toFixed(0)}%. Consider bumping the monthly contribution to accelerate compounding.`,
      tone: "neutral",
    };
  }
  return {
    emoji: "⏳",
    text: `${growthPct.toFixed(0)}% return over ${years} years. A longer term or higher rate could supercharge this.`,
    tone: "neutral",
  };
}

// ── Loan Insights ──────────────────────────────────────────────────────────
export function getLoanInsight(
  amount: number,
  totalInterest: number,
  monthlyPayment: number,
  totalMonths: number
): Insight {
  if (amount <= 0 || totalInterest <= 0) {
    return { emoji: "🏦", text: "Enter your loan details to see the true cost of borrowing.", tone: "neutral" };
  }

  const interestRatio = (totalInterest / amount) * 100;

  if (interestRatio > 80) {
    return {
      emoji: "🔥",
      text: `Yikes. You're paying ${interestRatio.toFixed(0)}% of the principal in interest alone — nearly the whole loan again. A shorter term will save you massively.`,
      tone: "danger",
    };
  }
  if (interestRatio > 40) {
    return {
      emoji: "😬",
      text: `Ouch. ${interestRatio.toFixed(0)}% of your principal goes to interest. That's like buying the bank a gift. Let's look at a shorter term.`,
      tone: "warning",
    };
  }
  if (interestRatio > 20) {
    return {
      emoji: "💰",
      text: `${interestRatio.toFixed(0)}% interest overhead is manageable. Making an extra payment per year could shave off ${Math.round(totalMonths * 0.12)} months.`,
      tone: "neutral",
    };
  }
  if (interestRatio > 5) {
    return {
      emoji: "✅",
      text: `Only ${interestRatio.toFixed(0)}% interest — well-negotiated. At this rate, the money is working for you, not against you.`,
      tone: "positive",
    };
  }
  return {
    emoji: "🎉",
    text: `Almost zero interest cost — your bank must really like you. Lock this in!`,
    tone: "positive",
  };
}

// ── FDR Insights ───────────────────────────────────────────────────────────
export function getFDRInsight(
  principal: number,
  maturityAmount: number,
  grossInterest: number,
  taxDeducted: number,
  autoRenew: boolean,
  termMonths: number
): Insight {
  if (principal <= 0 || maturityAmount <= principal) {
    return { emoji: "🏦", text: "Enter your deposit details to see what your fixed deposit will earn.", tone: "neutral" };
  }

  const returnPct = ((maturityAmount - principal) / principal) * 100;
  const taxPct = taxDeducted / grossInterest * 100;

  if (autoRenew && returnPct > 30) {
    return {
      emoji: "🔄",
      text: `Auto-renewal just compounded ${returnPct.toFixed(1)}% growth. That's the power of reinvesting — your FDR is earning interest on interest.`,
      tone: "positive",
    };
  }
  if (taxPct >= 15) {
    return {
      emoji: "📋",
      text: `Tax ate ৳${Math.round(taxDeducted).toLocaleString()} of your earnings. Link your e-TIN to keep 5% more — that's real money over time.`,
      tone: "warning",
    };
  }
  if (termMonths >= 36) {
    return {
      emoji: "🎯",
      text: `${returnPct.toFixed(1)}% return over ${Math.round(termMonths / 12)} years with a guaranteed rate. FDRs are boring, but boring wins.`,
      tone: "positive",
    };
  }
  return {
    emoji: "💎",
    text: `Your deposit earns ৳${Math.round(maturityAmount - principal).toLocaleString()} — safe, predictable, and tax-accounted.`,
    tone: "neutral",
  };
}

// ── DPS Insights ───────────────────────────────────────────────────────────
export function getDPSInsight(
  totalPrincipal: number,
  netInterest: number,
  maturityAmount: number,
  monthlyInstallment: number,
  years: number
): Insight {
  if (totalPrincipal <= 0 || netInterest <= 0) {
    return { emoji: "🐷", text: "Set your monthly installment to see how your savings grow over time.", tone: "neutral" };
  }

  const yieldPct = (netInterest / totalPrincipal) * 100;
  const freeMonths = Math.floor(netInterest / monthlyInstallment);

  if (freeMonths > 12) {
    return {
      emoji: "🎁",
      text: `Your interest earned you ${freeMonths} free months of installments. That's the bank literally paying you to save.`,
      tone: "positive",
    };
  }
  if (yieldPct > 15) {
    return {
      emoji: "🚀",
      text: `${yieldPct.toFixed(1)}% net yield — your ৳${monthlyInstallment.toLocaleString()}/mo turned into ৳${Math.round(maturityAmount).toLocaleString()}. Discipline is a superpower.`,
      tone: "positive",
    };
  }
  if (years >= 5) {
    return {
      emoji: "🏗️",
      text: `${years} years of consistent saving. Small amounts compound into a ৳${Math.round(maturityAmount).toLocaleString()} nest egg. Slow and steady.`,
      tone: "positive",
    };
  }
  return {
    emoji: "💪",
    text: `Saving ৳${monthlyInstallment.toLocaleString()}/month for ${years} years nets you ৳${Math.round(netInterest).toLocaleString()} in interest. Every month counts.`,
    tone: "neutral",
  };
}

// ── Vehicle / Savings Insights ─────────────────────────────────────────────
export function getVehicleSavingsInsight(
  savings: number,
  distance: number,
  currencySymbol: string
): Insight {
  if (savings <= 0 || distance <= 0) {
    return { emoji: "⚡", text: "Compare EV vs Fuel costs above to see potential savings.", tone: "neutral" };
  }

  const annualSavings = savings * 365; // Rough daily approximation if distance is daily
  
  if (savings > 100) {
    return {
      emoji: "🌿",
      text: `${currencySymbol}${Math.round(savings).toLocaleString()} saved per trip. Over a year, that's enough for a vacation — or better yet, compound it.`,
      tone: "positive",
    };
  }
  if (savings > 20) {
    return {
      emoji: "⚡",
      text: `EV saves you ${currencySymbol}${Math.round(savings).toLocaleString()} every ${distance}km. The fuel you're NOT buying is future wealth.`,
      tone: "positive",
    };
  }
  return {
    emoji: "📊",
    text: `Marginal savings of ${currencySymbol}${savings.toFixed(2)} per trip. Over thousands of km, this still compounds.`,
    tone: "neutral",
  };
}
