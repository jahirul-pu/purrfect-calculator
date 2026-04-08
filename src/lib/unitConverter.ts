export type Category = "Length" | "Weight" | "Temperature" | "Volume" | "Velocity" | "Energy";

export const units: Record<Category, string[]> = {
  Length: ["Meters", "Kilometers", "Centimeters", "Millimeters", "Inches", "Feet", "Yards", "Miles"],
  Weight: ["Kilograms", "Grams", "Milligrams", "Pounds", "Ounces", "Tons"],
  Temperature: ["Celsius", "Fahrenheit", "Kelvin"],
  Volume: ["Liters", "Milliliters", "Gallons", "Cups"],
  Velocity: ["Meters/second", "Kilometers/hour", "Miles/hour", "Feet/second", "Knots"],
  Energy: [
    "Joules",
    "Kilojoules",
    "Watt-hours",
    "Kilowatt-hours",
    "Calories",
    "BTU",
    "Watts",
    "Kilowatts",
    "Horsepower",
    "Newton-meters",
    "Pound-feet",
  ],
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
  Tons: 1000,
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

const energyRates: Record<string, number> = {
  Joules: 1,
  Kilojoules: 1000,
  "Watt-hours": 3600,
  "Kilowatt-hours": 3600000,
  Calories: 4184,
  BTU: 1055.06,
};

const powerRates: Record<string, number> = {
  Watts: 1,
  Kilowatts: 1000,
  Horsepower: 745.6998715822702,
};

const torqueRates: Record<string, number> = {
  "Newton-meters": 1,
  "Pound-feet": 1.3558179483314004,
};

const energyUnitGroups: Record<string, "energy" | "power" | "torque"> = {
  Joules: "energy",
  Kilojoules: "energy",
  "Watt-hours": "energy",
  "Kilowatt-hours": "energy",
  Calories: "energy",
  BTU: "energy",
  Watts: "power",
  Kilowatts: "power",
  Horsepower: "power",
  "Newton-meters": "torque",
  "Pound-feet": "torque",
};

export function getEnergyUnitGroup(unit: string): "energy" | "power" | "torque" | null {
  return energyUnitGroups[unit] || null;
}

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

  if (category === "Energy") {
    const fromGroup = getEnergyUnitGroup(from);
    const toGroup = getEnergyUnitGroup(to);

    if (!fromGroup || !toGroup) return value;
    if (fromGroup !== toGroup) return value;

    const rates = fromGroup === "energy"
      ? energyRates
      : fromGroup === "power"
        ? powerRates
        : torqueRates;

    const baseValue = value * rates[from];
    return baseValue / rates[to];
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
