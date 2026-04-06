export type Category = "Length" | "Weight" | "Temperature" | "Volume" | "Velocity";

export const units: Record<Category, string[]> = {
  Length: ["Meters", "Kilometers", "Centimeters", "Millimeters", "Inches", "Feet", "Yards", "Miles"],
  Weight: ["Kilograms", "Grams", "Milligrams", "Pounds", "Ounces"],
  Temperature: ["Celsius", "Fahrenheit", "Kelvin"],
  Volume: ["Liters", "Milliliters", "Gallons", "Cups"],
  Velocity: ["Meters/second", "Kilometers/hour", "Miles/hour", "Feet/second", "Knots"],
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

const velocityRates: Record<string, number> = {
  "Meters/second": 1,
  "Kilometers/hour": 0.2777777778,
  "Miles/hour": 0.44704,
  "Feet/second": 0.3048,
  Knots: 0.5144444444,
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

  const rates =
    category === "Length"
      ? lengthRates
      : category === "Weight"
        ? weightRates
        : category === "Volume"
          ? volumeRates
          : velocityRates;
  const baseValue = value * rates[from];
  return baseValue / rates[to];
}
