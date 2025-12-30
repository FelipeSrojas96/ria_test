// openWeather.ts
export type Units = "standard" | "metric" | "imperial";

type GeoResult = {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
};

export type Forecast3hItem = {
  dt: number; // unix seconds
  main: { temp: number; temp_min: number; temp_max: number; humidity: number };
  weather: Array<{ description: string; icon: string }>;
  pop?: number;
};

export type Forecast5d3hResponse = {
  list: Forecast3hItem[];
  city: { name: string; country: string; timezone: number }; // timezone offset seconds
};

const OWM = "https://api.openweathermap.org";

export async function geocodeCity(
  cityQuery: string,
  apiKey: string,
  limit = 1
): Promise<GeoResult> {
  // Direct geocoding :contentReference[oaicite:3]{index=3}
  const url = new URL(`${OWM}/geo/1.0/direct`);
  url.searchParams.set("q", cityQuery);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("appid", apiKey);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`);
  const data: GeoResult[] = await res.json();
  if (!data.length) throw new Error(`City not found: "${cityQuery}"`);
  return data[0];
}

export async function fetchForecast5d3h(
  lat: number,
  lon: number,
  apiKey: string,
  units: Units = "metric",
  lang = "en"
): Promise<Forecast5d3hResponse> {
  // 5 day / 3 hour forecast :contentReference[oaicite:4]{index=4}
  const url = new URL(`${OWM}/data/2.5/forecast`);
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("appid", apiKey);
  url.searchParams.set("units", units);
  url.searchParams.set("lang", lang);

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Forecast failed (${res.status}): ${body}`);
  }
  return res.json();
}



export function iconUrl(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}
