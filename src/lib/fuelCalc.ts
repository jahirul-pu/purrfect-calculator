export function calculateFuelNeeded(distance: number, kmpl: number): number {
  if (kmpl <= 0 || distance <= 0) return 0;
  return distance / kmpl;
}

export function calculateFuelCost(liters: number, price: number): number {
  if (liters <= 0 || price < 0) return 0;
  return liters * price;
}

export function costPerKmFuel(price: number, kmpl: number): number {
  if (kmpl <= 0 || price < 0) return 0;
  return price / kmpl;
}

export function adjustFuelEfficiency(baseKmpl: number, mode: "City" | "Highway"): number {
  if (baseKmpl <= 0) return 0;
  // Fuel cars usually suffer in the city due to stop-and-go
  let factor = 1;
  if (mode === "City") factor = 0.85; // 15% reduction in city mpg/kmpl
  return baseKmpl * factor;
}
