import React from "react";
import { iconUrl } from "../lib/openWeather";
import type { DailyAgg } from "../lib/aggregate";
import "./DailyForecast.css";

export function Next5DaysForecast({ dailyData }: { dailyData: DailyAgg[] }) {
  return (
    <div className="forecast">
      <div className="forecast__title">Next 5 days</div>

      <div className="forecast__list">
        {dailyData.map((d, idx) => {
          const date = new Date(`${d.dateISO}T00:00:00Z`);

          const dateLabel =
            idx === 0
              ? "Today"
              : date.toLocaleDateString("en-US", {
                  weekday: "short", // Fri
                  month: "short", // Nov
                  day: "numeric", // 1
                }); // "Fri, Nov 1"

          return (
            <div key={d.dateISO} className="forecast__row">
              <img
                className="forecast__icon"
                src={iconUrl(d.icon)}
                alt={d.description}
              />

              <div className="forecast__mid">
                <div className="forecast__date">{dateLabel}</div>
                <div className="forecast__summary">{d.description}</div>
              </div>

              <div className="forecast__temps">
                <span className="forecast__max">{Math.round(d.maxTemp)}°</span>
                <span className="forecast__min">{Math.round(d.minTemp)}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
