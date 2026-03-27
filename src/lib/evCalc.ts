export function calculateEVBatteryKwh(voltage: number, ah: number): number {
  return (voltage * ah) / 1000;
}

export function adjustEVRange(baseRange: number, isAcOn: boolean, mode: "City" | "Highway"): number {
  let factor = 1;
  // ~10% range penalty for AC
  if (isAcOn) factor *= 0.9;
  // ~10% range penalty for highway speeds in EVs (aerodynamic drag)
  if (mode === "Highway") factor *= 0.9; 

  return baseRange * factor;
}

export function calculateEVCost(batteryKwh: number, price: number): number {
  if (batteryKwh <= 0 || price < 0) return 0;
  return batteryKwh * price;
}

export function calculateEVCostPerKm(fullChargeCost: number, adjustedRange: number): number {
  if (adjustedRange <= 0) return 0;
  return fullChargeCost / adjustedRange;
}

export function calculateEVChargingTime(batteryKwh: number, currentSoc: number, targetSoc: number, chargerPowerKw: number): number {
  if (chargerPowerKw <= 0) return 0;
  const neededKwh = batteryKwh * (targetSoc - currentSoc) / 100;
  if (neededKwh <= 0) return 0;
  // Account for charging efficiency (~90%)
  return (neededKwh / chargerPowerKw) / 0.9;
}
