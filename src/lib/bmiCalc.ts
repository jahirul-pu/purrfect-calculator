export type BMICategory = "Underweight" | "Normal" | "Overweight" | "Obese";

export interface BMIResult {
  bmi: number;
  category: BMICategory;
  idealRange: string;
}

export function calculateBMI(weightKg: number, heightCm: number): BMIResult {
  if (weightKg <= 0 || heightCm <= 0) return { bmi: 0, category: "Normal", idealRange: "" };

  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  let category: BMICategory = "Normal";
  if (bmi < 18.5) category = "Underweight";
  else if (bmi < 25) category = "Normal";
  else if (bmi < 30) category = "Overweight";
  else category = "Obese";

  const minIdeal = 18.5 * (heightM * heightM);
  const maxIdeal = 24.9 * (heightM * heightM);

  return {
    bmi: parseFloat(bmi.toFixed(1)),
    category,
    idealRange: `${minIdeal.toFixed(1)}kg - ${maxIdeal.toFixed(1)}kg`,
  };
}

export function imperialToMetric(lbs: number, ft: number, inch: number) {
  const weightKg = lbs * 0.453592;
  const heightCm = (ft * 30.48) + (inch * 2.54);
  return { weightKg, heightCm };
}
