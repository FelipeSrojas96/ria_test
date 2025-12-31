import React, { useState, useEffect } from "react";
import { useCityForecast } from "./lib/oneCall";
import { Next5DaysForecast } from "./Components/DailyForecast/DailyForecast";
import { HourlyForecast } from "./Components/HourlyForecast/HourlyForecast";
import "./App.css";
import { CitySearch } from "./Components/citySearch/citySearch";
import type { CityPick } from "./Components/citySearch/citySearch";

type City = { id: "rio" | "beijing" | "la"; label: string; query: string };

type CityIndexRow = [string, string, string, string, string];
//                [id,   name,   state,  country, key]

const CITIES: City[] = [
  { id: "rio", label: "Rio de Janeiro", query: "Rio de Janeiro,BR" },
  { id: "beijing", label: "Beijing", query: "Beijing,CN" },
  { id: "la", label: "Los Angeles", query: "Los Angeles,CA,US" },
];

type SelectedTab = City["id"] | "custom";

export default function App() {
  const apiKey = import.meta.env.VITE_OWM_API_KEY as string;

  // selected city (used by your forecast hook)
  const [city, setCity] = useState<CityPick>(CITIES[0]);

  // which tab is highlighted (or "custom" if chosen from search)
  const [selectedTab, setSelectedTab] = useState<SelectedTab>("rio");

  // city index loading
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

    return () => {
      cancelled = true;
    };
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
    <div className="body">
      <div className="topBar">
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          disabled={loading}
          className="refreshBtn"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>

        {indexError ? (
          <p className="error topBar__error">{indexError}</p>
        ) : (
          <div className="topBar__search">
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
      </div>

      <div style={{ maxWidth: 430, margin: "0 auto" }}>
        {/* Tabs (the first 3 cities) */}
        <div className="segment">
          {CITIES.map((c) => {
            const active = selectedTab === c.id;

            return (
              <button
                key={c.id}
                onClick={() => {
                  setCity(c); // update forecast city
                  setSelectedTab(c.id); // highlight this tab
                }}
                style={{
                  flex: 1,
                  padding: "8px 8px",
                  borderRadius: 14,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 700,
                  background: active ? "rgba(255,255,255,0.22)" : "transparent",
                  color: "rgba(255,255,255,0.92)",
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {loading && (
          <p style={{ marginTop: 12, textAlign: "center" }}>Loading…</p>
        )}
        {error && <p className="error">{error}</p>}

        {!loading && !error && (
          <div style={{ display: "grid", gap: 14 }}>
            <div className="card">
              <div className="cardBody">
                <HourlyForecast
                  timezoneOffset={timezoneOffset}
                  hourlyData={hourlyData}
                  hours={12}
                />
              </div>
            </div>

            <div className="card">
              <div className="cardBody">
                <Next5DaysForecast dailyData={dailyData} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
