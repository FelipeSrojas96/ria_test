import axios from "axios";

export type Units = "standard" | "metric" | "imperial";

type GeoResult = {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
};

export type Forecast3hItem = {
  dt: number;
  main: { temp: number; temp_min: number; temp_max: number; humidity: number };
  weather: Array<{ description: string; icon: string }>;
  pop?: number;
};

export type Forecast5d3hResponse = {
  list: Forecast3hItem[];
  city: { name: string; country: string; timezone: number };
};

const owm = axios.create({
  baseURL: "https://api.openweathermap.org",
  timeout: 15_000,
});

export async function geocodeCity(
  cityQuery: string,
  apiKey: string,
  limit = 1
): Promise<GeoResult> {
  const { data } = await owm.get<GeoResult[]>("/geo/1.0/direct", {
    params: { q: cityQuery, limit, appid: apiKey },
  });

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
  const { data } = await owm.get<Forecast5d3hResponse>("/data/2.5/forecast", {
    params: { lat, lon, appid: apiKey, units, lang },
  });

  return data;
}

export function iconUrl(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}
