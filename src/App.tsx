import { useState, useEffect } from "react";
import { useCityForecast } from "./lib/oneCall";
import { Next5DaysForecast } from "./Components/DailyForecast/DailyForecast";
import { HourlyForecast } from "./Components/HourlyForecast/HourlyForecast";
import { CitySearch } from "./Components/citySearch/citySearch";
import type { CityPick, CityIndexRow } from "./Components/citySearch/citySearch";
import { CARD, ERROR, SKELETON, PILL_BASE, PILL_ACTIVE, PILL_INACTIVE, REFRESH_BTN } from "./styles";

type City = { id: "rio" | "beijing" | "la"; label: string; query: string };
type SelectedTab = City["id"] | "custom";

const CITIES: City[] = [
  { id: "rio",     label: "Rio de Janeiro", query: "Rio de Janeiro,BR" },
  { id: "beijing", label: "Beijing",        query: "Beijing,CN" },
  { id: "la",      label: "Los Angeles",    query: "Los Angeles,CA,US" },
];

export default function App() {
  const apiKey = import.meta.env.VITE_OWM_API_KEY as string;

  const [city, setCity] = useState<CityPick>(CITIES[0]);
  const [selectedTab, setSelectedTab] = useState<SelectedTab>("rio");
  const [cityIndex, setCityIndex] = useState<CityIndexRow[] | null>(null);
  const [indexError, setIndexError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/cities.index.json");
        if (!r.ok)
          throw new Error(`Failed to load cities.index.json (${r.status})`);
        const data = (await r.json()) as CityIndexRow[];
        if (!cancelled) setCityIndex(data);
      } catch (e: any) {
        if (!cancelled)
          setIndexError(e?.message ?? "Failed to load city index");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const { loading, error, timezoneOffset, hourlyData, dailyData } =
    useCityForecast({
      cityQuery: city.query,
      apiKey,
      units: "metric",
      lang: "en",
      refreshKey,
    });

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="max-w-[430px] mx-auto">

        {/* Search + refresh bar */}
        <div className="flex items-center gap-2 mb-5">
          {indexError ? (
            <p className={`m-0 flex-1 ${ERROR}`}>{indexError}</p>
          ) : (
            <div className="flex-1 min-w-0">
              <CitySearch
                cityIndex={cityIndex ?? []}
                disabled={!cityIndex}
                onSelect={(picked) => {
                  setCity(picked);
                  setSelectedTab("custom");
                }}
              />
            </div>
          )}

          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            disabled={loading}
            aria-label="Refresh"
            title="Refresh"
            className={REFRESH_BTN}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18" height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={loading ? "animate-spin" : ""}
            >
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
          </button>
        </div>

        {/* Current city name */}
        <div className="text-center mb-3">
          <h1 className="text-2xl font-semibold tracking-tight text-primary m-0">
            {city.label}
          </h1>
        </div>

        {/* City tabs */}
        <div className="flex gap-1 mb-3.5">
          {CITIES.map((c) => {
            const active = selectedTab === c.id;
            return (
              <button
                key={c.id}
                onClick={() => { setCity(c); setSelectedTab(c.id); }}
                aria-pressed={active}
                className={`${PILL_BASE} ${active ? PILL_ACTIVE : PILL_INACTIVE}`}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {error && <p className={`mt-2.5 ${ERROR}`}>{error}</p>}

        <div className="grid gap-3.5">
          <div className={CARD}>
            {loading
              ? <div className={`h-[110px] ${SKELETON}`} aria-busy="true" aria-label="Loading hourly forecast" />
              : <HourlyForecast timezoneOffset={timezoneOffset} hourlyData={hourlyData} hours={12} />
            }
          </div>

          <div className={CARD}>
            {loading
              ? <div className={`h-[200px] ${SKELETON}`} aria-busy="true" aria-label="Loading daily forecast" />
              : <Next5DaysForecast dailyData={dailyData} />
            }
          </div>
        </div>
      </div>
    </div>
  );
}
