// ─── Reality Translator Engine ─────────────────────────────────────────────
// Translates raw numbers into tangible, funny, physical-world equivalents.
// Makes "10,000 kWh" actually mean something to a human brain.

export interface RealityComparison {
  icon: string;
  label: string;
  value: string;
}

const iconTokenMap: Record<string, string> = {
  "⚡": "zap",
  "🔋": "battery",
  "💡": "lightbulb",
  "💻": "laptop",
  "🖥️": "monitor",
  "🎮": "gamepad-2",
  "❄️": "snowflake",
  "🏠": "house",
  "🍕": "pizza",
  "👕": "shirt",
  "🧊": "ice-cream-cone",
  "📡": "radar",
  "💇": "scissors",
  "📱": "smartphone",
  "♿": "accessibility",
  "🚗": "car",
  "🏡": "house",
  "🚿": "shower-head",
  "👔": "shirt",
  "📺": "tv",
  "🛴": "bike",
  "🕹️": "gamepad-2",
  "🍞": "sandwich",
  "☕": "coffee",
  "👟": "footprints",
  "🎧": "headphones",
  "🏍️": "bike",
  "🏎️": "car",
  "🎓": "graduation-cap",
  "🚢": "ship",
  "🏝️": "palmtree",
  "🛥️": "ship",
  "⏰": "clock-3",
  "🍌": "leaf",
  "🛹": "person-standing",
  "🎹": "music-2",
  "🚌": "bus",
  "🐋": "fish",
  "🏈": "goal",
  "🗼": "tower-control",
  "🌉": "bridge",
  "🏔️": "mountain",
  "🏃": "person-standing",
  "📎": "paperclip",
  "🥚": "egg",
  "🐹": "paw-print",
  "🐱": "cat",
  "🎳": "circle-dot",
  "🐕": "dog",
  "🧑": "user",
  "🐴": "horse",
  "🐘": "elephant",
  "🥄": "utensils",
  "🥃": "glass-water",
  "🛁": "bath",
  "♨️": "waves",
  "🏊": "waves",
  "🚶": "footprints",
  "🛣": "route",
  "🐆": "activity",
  "✈": "plane",
  "🔊": "volume-2",
  "🛰": "satellite",
  "🥶": "snowflake",
  "🧥": "shirt",
  "🌤️": "sun-medium",
  "😊": "smile",
  "☀️": "sun",
  "🔥": "flame",
  "🌋": "mountain",
  "💨": "wind",
};

const toIconKey = (token: string) => iconTokenMap[token] || "sparkles";

// ── POWER / ENERGY TRANSLATIONS ────────────────────────────────────────────

const powerEquivalents: { name: string; icon: string; watts: number }[] = [
  { name: "LED bulb", icon: "💡", watts: 10 },
  { name: "laptop", icon: "💻", watts: 65 },
  { name: "desktop PC", icon: "🖥️", watts: 200 },
  { name: "gaming rig (full tilt)", icon: "🎮", watts: 650 },
  { name: "window AC unit", icon: "❄️", watts: 1200 },
  { name: "central AC system", icon: "🏠", watts: 3500 },
  { name: "electric oven", icon: "🍕", watts: 2400 },
  { name: "washing machine cycle", icon: "👕", watts: 500 },
  { name: "refrigerator", icon: "🧊", watts: 150 },
  { name: "microwave oven", icon: "📡", watts: 1000 },
  { name: "hair dryer", icon: "💇", watts: 1500 },
  { name: "electric car charger (L2)", icon: "⚡", watts: 7200 },
  { name: "Tesla Supercharger", icon: "🔋", watts: 150000 },
];

const energyEquivalents: { name: string; icon: string; kwhPerUnit: number }[] = [
  { name: "smartphone full charge", icon: "📱", kwhPerUnit: 0.012 },
  { name: "electric wheelchair full charge", icon: "♿", kwhPerUnit: 1.5 },
  { name: "Tesla Model 3 full charge", icon: "🚗", kwhPerUnit: 60 },
  { name: "average US home (1 day)", icon: "🏡", kwhPerUnit: 30 },
  { name: "hot shower (10 min)", icon: "🚿", kwhPerUnit: 4 },
  { name: "load of laundry", icon: "👔", kwhPerUnit: 2.5 },
  { name: "hour of Netflix streaming", icon: "📺", kwhPerUnit: 0.1 },
  { name: "electric scooter full charge", icon: "🛴", kwhPerUnit: 1.0 },
  { name: "gaming session (3 hrs)", icon: "🕹️", kwhPerUnit: 1.95 },
  { name: "bread loaf baked", icon: "🍞", kwhPerUnit: 1.5 },
];

export function translatePowerLoad(totalWatts: number): RealityComparison[] {
  if (totalWatts <= 0) return [];
  const results: RealityComparison[] = [];

  for (const eq of powerEquivalents) {
    const count = totalWatts / eq.watts;
    if (count >= 0.8 && count <= 500) {
      results.push({
        icon: toIconKey(eq.icon),
        label: eq.name,
        value: count >= 2
          ? `Running ${Math.round(count)} ${eq.name}s simultaneously`
          : `About ${count.toFixed(1)}× one ${eq.name}`,
      });
    }
    if (results.length >= 3) break;
  }
  return results;
}

export function translateMonthlyEnergy(monthlyKwh: number): RealityComparison[] {
  if (monthlyKwh <= 0) return [];
  const results: RealityComparison[] = [];

  for (const eq of energyEquivalents) {
    const count = monthlyKwh / eq.kwhPerUnit;
    if (count >= 1 && count <= 100000) {
      results.push({
        icon: toIconKey(eq.icon),
        label: eq.name,
        value: `${Math.round(count).toLocaleString()} ${eq.name}s`,
      });
    }
    if (results.length >= 3) break;
  }
  return results;
}

// ── FINANCIAL / LOAN TRANSLATIONS ──────────────────────────────────────────

interface PurchaseEquivalent {
  name: string;
  icon: string;
  cost: number; // in USD for base reference
}

const purchaseEquivalents: PurchaseEquivalent[] = [
  { name: "cup of premium coffee", icon: "☕", cost: 6 },
  { name: "pizza delivery", icon: "🍕", cost: 20 },
  { name: "new video game", icon: "🎮", cost: 70 },
  { name: "pair of running shoes", icon: "👟", cost: 120 },
  { name: "noise-cancelling headphones", icon: "🎧", cost: 300 },
  { name: "flagship smartphone", icon: "📱", cost: 1000 },
  { name: "high-end gaming PC", icon: "🖥️", cost: 2500 },
  { name: "used motorcycle", icon: "🏍️", cost: 5000 },
  { name: "flagship motorcycle", icon: "🏎️", cost: 15000 },
  { name: "decent used car", icon: "🚗", cost: 20000 },
  { name: "semester of college tuition", icon: "🎓", cost: 30000 },
  { name: "luxury world cruise", icon: "🚢", cost: 50000 },
  { name: "down payment on a house", icon: "🏠", cost: 80000 },
  { name: "Lamborghini Huracán", icon: "🏎️", cost: 250000 },
  { name: "private island plot", icon: "🏝️", cost: 500000 },
  { name: "literal yacht", icon: "🛥️", cost: 1000000 },
];

export function translateFinancialAmount(amountUSD: number): RealityComparison[] {
  if (amountUSD <= 0) return [];
  const results: RealityComparison[] = [];

  // Find the closest purchase that fits
  const sorted = [...purchaseEquivalents].sort((a, b) => a.cost - b.cost);

  for (const eq of sorted) {
    const count = amountUSD / eq.cost;
    if (count >= 1 && count <= 500) {
      const countStr = count >= 2
        ? `${Math.round(count)} ${eq.name}${Math.round(count) !== 1 ? "s" : ""}`
        : `one ${eq.name}`;
      results.push({
        icon: toIconKey(eq.icon),
        label: eq.name,
        value: `Enough to buy ${countStr}`,
      });
    }
    if (results.length >= 3) break;
  }

  // Also add a fun time-based comparison
  if (amountUSD > 50) {
    const dailyMinWage = 7.25 * 8; // US federal minimum wage * 8 hrs
    const daysOfWork = amountUSD / dailyMinWage;
    if (daysOfWork >= 1) {
      results.push({
        icon: "clock-3",
        label: "minimum wage work days",
        value: `${Math.round(daysOfWork).toLocaleString()} work days at minimum wage`,
      });
    }
  }

  return results.slice(0, 3);
}

export function translateYearlyInterest(yearlyInterestUSD: number): RealityComparison[] {
  if (yearlyInterestUSD <= 0) return [];
  return translateFinancialAmount(yearlyInterestUSD);
}

// ── UNIT / LENGTH "FUN UNITS" TRANSLATIONS ─────────────────────────────────

interface FunUnit {
  name: string;
  icon: string;
  metersPerUnit: number;
  plural: string;
}

const funLengthUnits: FunUnit[] = [
  { name: "stacked smartphone", icon: "📱", metersPerUnit: 0.147, plural: "stacked smartphones" },
  { name: "banana", icon: "🍌", metersPerUnit: 0.18, plural: "bananas" },
  { name: "skateboard", icon: "🛹", metersPerUnit: 0.81, plural: "skateboards" },
  { name: "grand piano", icon: "🎹", metersPerUnit: 1.5, plural: "grand pianos" },
  { name: "London double-decker bus", icon: "🚌", metersPerUnit: 11.3, plural: "double-decker buses" },
  { name: "blue whale", icon: "🐋", metersPerUnit: 30, plural: "blue whales" },
  { name: "football field", icon: "🏈", metersPerUnit: 91.44, plural: "football fields" },
  { name: "Eiffel Tower", icon: "🗼", metersPerUnit: 330, plural: "Eiffel Towers" },
  { name: "Golden Gate Bridge span", icon: "🌉", metersPerUnit: 2737, plural: "Golden Gate Bridges" },
  { name: "Mount Everest height", icon: "🏔️", metersPerUnit: 8849, plural: "Mount Everests" },
  { name: "marathon distance", icon: "🏃", metersPerUnit: 42195, plural: "marathons" },
];

interface FunWeightUnit {
  name: string;
  icon: string;
  kgPerUnit: number;
  plural: string;
}

const funWeightUnits: FunWeightUnit[] = [
  { name: "paperclip", icon: "📎", kgPerUnit: 0.001, plural: "paperclips" },
  { name: "chicken egg", icon: "🥚", kgPerUnit: 0.06, plural: "chicken eggs" },
  { name: "hamster", icon: "🐹", kgPerUnit: 0.03, plural: "hamsters" },
  { name: "house cat", icon: "🐱", kgPerUnit: 4.5, plural: "house cats" },
  { name: "bowling ball", icon: "🎳", kgPerUnit: 6.35, plural: "bowling balls" },
  { name: "golden retriever", icon: "🐕", kgPerUnit: 30, plural: "golden retrievers" },
  { name: "adult human", icon: "🧑", kgPerUnit: 75, plural: "adult humans" },
  { name: "grand piano", icon: "🎹", kgPerUnit: 480, plural: "grand pianos" },
  { name: "adult horse", icon: "🐴", kgPerUnit: 500, plural: "horses" },
  { name: "small car", icon: "🚗", kgPerUnit: 1200, plural: "small cars" },
  { name: "African elephant", icon: "🐘", kgPerUnit: 6000, plural: "African elephants" },
];

interface FunVolumeUnit {
  name: string;
  icon: string;
  litersPerUnit: number;
  plural: string;
}

const funVolumeUnits: FunVolumeUnit[] = [
  { name: "teaspoon", icon: "🥄", litersPerUnit: 0.005, plural: "teaspoons" },
  { name: "shot glass", icon: "🥃", litersPerUnit: 0.044, plural: "shot glasses" },
  { name: "coffee mug", icon: "☕", litersPerUnit: 0.35, plural: "coffee mugs" },
  { name: "bowling ball volume", icon: "🎳", litersPerUnit: 5.5, plural: "bowling balls (in volume)" },
  { name: "bathtub", icon: "🛁", litersPerUnit: 300, plural: "bathtubs" },
  { name: "hot tub", icon: "♨️", litersPerUnit: 1500, plural: "hot tubs" },
  { name: "Olympic swimming pool", icon: "🏊", litersPerUnit: 2500000, plural: "Olympic swimming pools" },
];

interface FunTempComparison {
  icon: string;
  label: string;
  value: string;
}

interface FunVelocityUnit {
  name: string;
  icon: string;
  metersPerSecond: number;
  plural: string;
}

const funVelocityUnits: FunVelocityUnit[] = [
  { name: "walking pace", icon: "🚶", metersPerSecond: 1.4, plural: "walking paces" },
  { name: "jogging speed", icon: "🏃", metersPerSecond: 2.8, plural: "jogging speeds" },
  { name: "city traffic average", icon: "🚗", metersPerSecond: 13.9, plural: "city traffic averages" },
  { name: "highway cruising speed", icon: "🛣", metersPerSecond: 27.8, plural: "highway cruising speeds" },
  { name: "cheetah sprint", icon: "🐆", metersPerSecond: 29, plural: "cheetah sprints" },
  { name: "Formula 1 race pace", icon: "🏎", metersPerSecond: 83, plural: "Formula 1 race paces" },
  { name: "commercial jet cruising", icon: "✈", metersPerSecond: 250, plural: "commercial jet cruising speeds" },
  { name: "speed of sound", icon: "🔊", metersPerSecond: 343, plural: "speeds of sound" },
  { name: "orbital velocity", icon: "🛰", metersPerSecond: 7800, plural: "orbital velocities" },
];

export function translateLength(meters: number): RealityComparison[] {
  if (meters <= 0 || !isFinite(meters)) return [];
  const results: RealityComparison[] = [];

  for (const unit of funLengthUnits) {
    const count = meters / unit.metersPerUnit;
    if (count >= 1 && count <= 999999) {
      results.push({
        icon: toIconKey(unit.icon),
        label: unit.name,
        value: `${Math.round(count).toLocaleString()} ${unit.plural}`,
      });
    }
    if (results.length >= 3) break;
  }
  return results;
}

export function translateWeight(kg: number): RealityComparison[] {
  if (kg <= 0 || !isFinite(kg)) return [];
  const results: RealityComparison[] = [];

  for (const unit of funWeightUnits) {
    const count = kg / unit.kgPerUnit;
    if (count >= 1 && count <= 999999) {
      results.push({
        icon: toIconKey(unit.icon),
        label: unit.name,
        value: `${Math.round(count).toLocaleString()} ${unit.plural}`,
      });
    }
    if (results.length >= 3) break;
  }
  return results;
}

export function translateVolume(liters: number): RealityComparison[] {
  if (liters <= 0 || !isFinite(liters)) return [];
  const results: RealityComparison[] = [];

  for (const unit of funVolumeUnits) {
    const count = liters / unit.litersPerUnit;
    if (count >= 1 && count <= 999999) {
      results.push({
        icon: toIconKey(unit.icon),
        label: unit.name,
        value: `${Math.round(count).toLocaleString()} ${unit.plural}`,
      });
    }
    if (results.length >= 3) break;
  }
  return results;
}

export function translateTemperature(celsius: number): FunTempComparison[] {
  const comparisons: FunTempComparison[] = [];

  if (celsius < -40) comparisons.push({ icon: "snowflake", label: "Extreme", value: "Colder than the coldest day in Siberia" });
  else if (celsius < -10) comparisons.push({ icon: "snowflake", label: "Frigid", value: "Cold enough to freeze your eyelashes shut" });
  else if (celsius < 0) comparisons.push({ icon: "ice-cream-cone", label: "Freezing", value: "Water turns to ice — bundle up!" });
  else if (celsius < 10) comparisons.push({ icon: "shirt", label: "Chilly", value: "Light jacket weather — your breath is visible" });
  else if (celsius < 20) comparisons.push({ icon: "sun-medium", label: "Mild", value: "Perfect hoodie weather" });
  else if (celsius < 25) comparisons.push({ icon: "smile", label: "Comfortable", value: "Room temperature — t-shirt vibes" });
  else if (celsius < 35) comparisons.push({ icon: "sun", label: "Warm", value: "Beach weather — sunscreen required" });
  else if (celsius < 45) comparisons.push({ icon: "flame", label: "Hot", value: "Hot enough to fry an egg on the sidewalk" });
  else if (celsius < 100) comparisons.push({ icon: "mountain", label: "Extreme", value: "Hotter than Death Valley record" });
  else if (celsius >= 100) comparisons.push({ icon: "wind", label: "Boiling", value: "Water boils — now you're cooking" });

  return comparisons;
}

export function translateVelocity(metersPerSecond: number): RealityComparison[] {
  if (metersPerSecond <= 0 || !isFinite(metersPerSecond)) return [];
  const results: RealityComparison[] = [];

  for (const unit of funVelocityUnits) {
    const count = metersPerSecond / unit.metersPerSecond;
    if (count >= 0.2 && count <= 999999) {
      results.push({
        icon: toIconKey(unit.icon),
        label: unit.name,
        value: count >= 2
          ? `${count.toFixed(1)} ${unit.plural}`
          : `About ${count.toFixed(2)}x ${unit.name}`,
      });
    }
    if (results.length >= 3) break;
  }

  return results;
}

// Helper: convert unit value to base unit (meters, kg, liters, m/s) for fun conversion
export function getBaseValue(value: number, fromUnit: string, category: string): number {
  const lengthToMeters: Record<string, number> = {
    Meters: 1, Kilometers: 1000, Centimeters: 0.01, Millimeters: 0.001,
    Inches: 0.0254, Feet: 0.3048, Yards: 0.9144, Miles: 1609.34,
  };
  const weightToKg: Record<string, number> = {
    Kilograms: 1, Grams: 0.001, Milligrams: 0.000001,
    Pounds: 0.453592, Ounces: 0.0283495,
  };
  const volumeToLiters: Record<string, number> = {
    Liters: 1, Milliliters: 0.001, Gallons: 3.78541, Cups: 0.236588,
  };
  const velocityToMps: Record<string, number> = {
    "Meters/second": 1,
    "Kilometers/hour": 0.2777777778,
    "Miles/hour": 0.44704,
    "Feet/second": 0.3048,
    Knots: 0.5144444444,
  };

  if (category === "Length") return value * (lengthToMeters[fromUnit] || 1);
  if (category === "Weight") return value * (weightToKg[fromUnit] || 1);
  if (category === "Volume") return value * (volumeToLiters[fromUnit] || 1);
  if (category === "Velocity") return value * (velocityToMps[fromUnit] || 1);
  return value;
}

// Master dispatcher for unit categories
export function translateUnit(
  value: number,
  fromUnit: string,
  category: string
): RealityComparison[] {
  const baseVal = getBaseValue(value, fromUnit, category);

  switch (category) {
    case "Length": return translateLength(baseVal);
    case "Weight": return translateWeight(baseVal);
    case "Volume": return translateVolume(baseVal);
    case "Temperature": return translateTemperature(baseVal);
    case "Velocity": return translateVelocity(baseVal);
    default: return [];
  }
}

// ── POWER LEVEL MILESTONES (Easter Eggs) ───────────────────────────────────

export interface PowerLevelMilestone {
  level: string;
  title: string;
  description: string;
  icon: string;
  cssClass: string;
}

export function checkPowerLevel(amount: number): PowerLevelMilestone | null {
  if (amount >= 10_000_000) {
    return {
      level: "LEGENDARY",
      title: "Legendary Wealth Unlocked",
      description: "You've entered 8-figure territory. Your financial power level is... immeasurable.",
      icon: "crown",
      cssClass: "milestone-legendary",
    };
  }
  if (amount >= 1_000_000) {
    return {
      level: "OVER 9000",
      title: "IT'S OVER 9000!",
      description: "Your financial power level has officially broken the scanner. Welcome to the millionaire's club.",
      icon: "sparkles",
      cssClass: "milestone-over-9000",
    };
  }
  if (amount >= 500_000) {
    return {
      level: "ELITE",
      title: "Half-Million Hero",
      description: "Half a million. That's generational thinking. Your compound interest is doing push-ups.",
      icon: "trophy",
      cssClass: "milestone-elite",
    };
  }
  if (amount >= 100_000) {
    return {
      level: "POWER",
      title: "Six-Figure Gateway",
      description: "The first $100K is the hardest. After this, compounding does the heavy lifting.",
      icon: "zap",
      cssClass: "milestone-power",
    };
  }
  return null;
}
