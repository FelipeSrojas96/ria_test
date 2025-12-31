import React from "react";
import "./HourlyForecast.css";
import { iconUrl, type Forecast3hItem } from "../../lib/openWeather";
export function HourlyForecast({
  timezoneOffset,
  hourlyData,
  hours = 12,
}: {
  timezoneOffset: number;
  hourlyData: Forecast3hItem[];
  hours?: number;
}) {
  const count = Math.max(1, Math.ceil(hours / 3));
  const data = (hourlyData ?? []).slice(0, count);

  return (
    <div className="nextHours">
      <div className="nextHours__strip">
        {data.map((h) => {
          const w = h.weather?.[0];
          const localMs = (h.dt + timezoneOffset) * 1000;

          const label = new Date(localMs).toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });

          return (
            <div key={h.dt} className="nextHours__card">
              <div className="nextHours__time">{label}</div>

              <div className="nextHours__iconWrap">
                {w?.icon ? (
                  <img
                    className="nextHours__icon"
                    src={iconUrl(w.icon)}
                    alt={w.description}
                  />
                ) : null}
              </div>

              <div className="nextHours__temp">{Math.round(h.main.temp)}°</div>
              <div className="nextHours__humidity">
                {Math.round(h.main.humidity)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
