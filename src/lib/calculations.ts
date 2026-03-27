import type { Device } from "../types/device";

// Per Device: daily_kwh = (watt × hours × quantity) / 1000
export const calculateDailyKWh = (device: Device): number => {
  return (device.watts * device.hoursPerDay * device.quantity) / 1000;
};

// Totals: total_load_watts = sum(watt × quantity)
export const calculateTotalLoad = (devices: Device[]): number => {
  return devices.reduce((sum, device) => sum + (device.watts * device.quantity), 0);
};

// total_daily_kwh = sum of all device daily_kwh
export const calculateTotalDailyKWh = (devices: Device[]): number => {
  return devices.reduce((sum, device) => sum + calculateDailyKWh(device), 0);
};

// monthly_kwh = total_daily_kwh × 30
export const calculateMonthlyKWh = (dailyKWh: number): number => {
  return dailyKWh * 30;
};

// IPS Sizing: ips_required = total_load_watts × 1.5
export const calculateIPSRequired = (totalLoadWatts: number): number => {
  return totalLoadWatts * 1.5;
};

// Battery Calculation: energy_wh = total_load_watts × backup_hours
// battery_ah = (energy_wh / system_voltage) × 1.5
export const calculateBatteryAh = (
  totalLoadWatts: number,
  backupHours: number,
  systemVoltage: number
): number => {
  if (systemVoltage === 0) return 0;
  const energyWh = totalLoadWatts * backupHours;
  return (energyWh / systemVoltage) * 1.5;
};

// Voltage Logic: If load < 600W → use 12V, If load ≥ 600W → use 24V
export const determineSystemVoltage = (totalLoadWatts: number): number => {
  if (totalLoadWatts === 0) return 0; // Return 0 if no load
  return totalLoadWatts < 600 ? 12 : 24;
};
