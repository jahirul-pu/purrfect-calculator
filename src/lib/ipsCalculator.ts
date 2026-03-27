export function calculateIPS(load: number): { watts: number; va: number } {
  const ipsWatts = load * 1.5;
  const ipsVa = ipsWatts / 0.8;
  return {
    watts: Math.ceil(ipsWatts / 50) * 50,
    va: Math.ceil(ipsVa / 50) * 50,
  };
}

export function selectVoltage(load: number, preference: "Auto" | "12V" | "24V"): 12 | 24 {
  if (preference === "12V") return 12;
  if (preference === "24V") return 24;
  return load < 600 ? 12 : 24;
}

export function calculateBattery(load: number, hours: number, voltage: number): number {
  if (voltage === 0 || hours === 0) return 0;
  const energyWh = load * hours;
  const adjustedWh = energyWh * 1.2; // 20% loss
  const batteryAh = (adjustedWh / voltage) * 1.5;
  return Math.ceil(batteryAh / 10) * 10;
}
