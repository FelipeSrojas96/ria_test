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
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [timezoneOffset, setTimezoneOffset] = useState(0);
  const [hourlyData, setHourlyData] = useState<Forecast3hItem[]>([]);
  const [dailyData, setDailyData] = useState<DailyAgg[]>([]);

  // Geocode only when the city changes
  useEffect(() => {
    let cancelled = false;

    setCoords(null);
    setGeoError(null);

    geocodeCity(cityQuery, apiKey, 1)
      .then((geo) => { if (!cancelled) setCoords({ lat: geo.lat, lon: geo.lon }); })
      .catch((e: any) => { if (!cancelled) setGeoError(e?.message ?? "City not found"); });

    return () => { cancelled = true; };
  }, [cityQuery, apiKey]);

  // Fetch forecast when coords are ready or refresh is triggered
  useEffect(() => {
    if (!coords) return;
    let cancelled = false;

    async function run() {
      try {
        setLoading(true);
        setError(null);

        const forecast = await fetchForecast5d3h(coords!.lat, coords!.lon, apiKey, units, lang);
        if (cancelled) return;

        setTimezoneOffset(forecast.city.timezone);
        setHourlyData(forecast.list);
        setDailyData(aggregateToDaily(forecast, 5));
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => { cancelled = true; };
  }, [coords, apiKey, units, lang, refreshKey]);

  return { loading, error: geoError ?? error, timezoneOffset, hourlyData, dailyData };
}
