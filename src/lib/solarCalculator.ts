export function calculateSolar(dailyKwh: number, sunlightHours: number): { panelWatts: number; solarKwh: number } {
  if (sunlightHours <= 0 || dailyKwh === 0) return { panelWatts: 0, solarKwh: 0 };

  const rawPanelWatts = (dailyKwh * 1000) / (sunlightHours * 0.75);
  const panelWatts = Math.ceil(rawPanelWatts / 100) * 100; // round to nearest 100W
  
  const solarKwh = (panelWatts * sunlightHours * 0.75) / 1000;

  return { panelWatts, solarKwh };
}
