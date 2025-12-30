import { useEffect, useState } from "react";
import { geocodeCity, fetchForecast5d3h } from "./openWeather";
import { aggregateToDaily } from "./aggregate";
import type { Units, Forecast3hItem } from "./openWeather";
import type { DailyAgg } from "./aggregate";

export function useCityForecast({
  cityQuery,
  apiKey,
  units = "metric",
  lang = "en",
  refreshKey = 0,
}: {
  cityQuery: string;
  apiKey: string;
  units?: Units;
  lang?: string;
  refreshKey?: number;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [timezoneOffset, setTimezoneOffset] = useState(0);

  const [hourlyData, setHourlyData] = useState<Forecast3hItem[]>([]);
  const [dailyData, setdailyData] = useState<DailyAgg[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setLoading(true);
        setError(null);

        const geo = await geocodeCity(cityQuery, apiKey, 1);
        if (cancelled) return;

        const forecast = await fetchForecast5d3h(
          geo.lat,
          geo.lon,
          apiKey,
          units,
          lang
        );
        if (cancelled) return;

        setTimezoneOffset(forecast.city.timezone);
        setHourlyData(forecast.list);
        setdailyData(aggregateToDaily(forecast, 5));
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [cityQuery, apiKey, units, lang, refreshKey,refreshKey]);

  return { loading, error, timezoneOffset, hourlyData, dailyData };
}
