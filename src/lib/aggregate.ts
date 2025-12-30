// aggregate.ts
import type { Forecast3hItem,Forecast5d3hResponse } from "./openWeather";
export type DailyAgg = {
  dateISO: string; // YYYY-MM-DD in city's local date
  minTemp: number;
  maxTemp: number;
  avgHumidity: number;
  description: string;
  icon: string;
};

function localDateISO(dt: number, tzOffset: number) {
  const shiftedMs = (dt + tzOffset) * 1000;
  return new Date(shiftedMs).toISOString().slice(0, 10);
}

export function aggregateToDaily(
  forecast: Forecast5d3hResponse,
  days = 5
): DailyAgg[] {
  const tz = forecast.city.timezone;

  const byDay = new Map<string, Forecast3hItem[]>();
  for (const it of forecast.list) {
    const key = localDateISO(it.dt, tz);
    (byDay.get(key) ?? byDay.set(key, []).get(key)!).push(it);
  }

  const sorted = [...byDay.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  const out: DailyAgg[] = [];
  for (const [dateISO, items] of sorted) {
    if (out.length >= days) break;

    let minTemp = Infinity;
    let maxTemp = -Infinity;
    let humSum = 0;

    // representative (icon/desc) = closest to ~12:00 local
    let best: { diff: number; it: Forecast3hItem } | null = null;

    for (const it of items) {
      minTemp = Math.min(minTemp, it.main.temp_min);
      maxTemp = Math.max(maxTemp, it.main.temp_max);
      humSum += it.main.humidity;

      const localHour = new Date((it.dt + tz) * 1000).getUTCHours();
      const diff = Math.abs(localHour - 12);
      if (!best || diff < best.diff) best = { diff, it };
    }

    const rep = best?.it ?? items[0];
    const w = rep.weather?.[0];

    out.push({
      dateISO,
      minTemp,
      maxTemp,
      avgHumidity: humSum / items.length,
      description: w?.description ?? "—",
      icon: w?.icon ?? "01d",
    });
  }

  return out;
}
