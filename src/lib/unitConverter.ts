export type Category = "Length" | "Weight" | "Temperature" | "Volume";

export const units: Record<Category, string[]> = {
  Length: ["Meters", "Kilometers", "Centimeters", "Millimeters", "Inches", "Feet", "Yards", "Miles"],
  Weight: ["Kilograms", "Grams", "Milligrams", "Pounds", "Ounces"],
  Temperature: ["Celsius", "Fahrenheit", "Kelvin"],
  Volume: ["Liters", "Milliliters", "Gallons", "Cups"],
};

const lengthRates: Record<string, number> = {
  Meters: 1,
  Kilometers: 1000,
  Centimeters: 0.01,
  Millimeters: 0.001,
  Inches: 0.0254,
  Feet: 0.3048,
  Yards: 0.9144,
  Miles: 1609.34,
};

const weightRates: Record<string, number> = {
  Kilograms: 1,
  Grams: 0.001,
  Milligrams: 0.000001,
  Pounds: 0.453592,
  Ounces: 0.0283495,
};

const volumeRates: Record<string, number> = {
  Liters: 1,
  Milliliters: 0.001,
  Gallons: 3.78541,
  Cups: 0.236588,
};

export function convert(value: number, from: string, to: string, category: Category): number {
  if (category === "Temperature") {
    let celsius = value;
    if (from === "Fahrenheit") celsius = (value - 32) * 5 / 9;
    if (from === "Kelvin") celsius = value - 273.15;

    if (to === "Celsius") return celsius;
    if (to === "Fahrenheit") return celsius * 9 / 5 + 32;
    if (to === "Kelvin") return celsius + 273.15;
    return value;
  }

  const rates = category === "Length" ? lengthRates : category === "Weight" ? weightRates : volumeRates;
  const baseValue = value * rates[from];
  return baseValue / rates[to];
}
