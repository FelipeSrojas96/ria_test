import { iconUrl } from "../../lib/openWeather";
import type { DailyAgg } from "../../lib/aggregate";

export function Next5DaysForecast({ dailyData }: { dailyData: DailyAgg[] }) {
  return (
    <div className="flex flex-col">
      <div className="text-[12px] tracking-[1.2px] uppercase text-muted mb-2.5">
        Next 5 days
      </div>

      <div className="flex flex-col">
        {dailyData.map((d, idx) => {
          const date = new Date(`${d.dateISO}T00:00:00Z`);
          const dateLabel =
            idx === 0
              ? "Today"
              : date.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                });

          return (
            <div
              key={d.dateISO}
              className="grid grid-cols-[44px_1fr_72px] items-center gap-3 px-2 py-3 border-b border-stroke last:border-b-0"
            >
              <img
                className="w-[26px] h-[26px] opacity-95"
                src={iconUrl(d.icon)}
                alt={d.description}
              />

              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="font-bold text-primary leading-[1.1]">
                  {dateLabel}
                </div>
                <div className="text-[12px] text-muted leading-[1.1] whitespace-nowrap overflow-hidden text-ellipsis capitalize">
                  {d.description}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 tabular-nums">
                <span className="font-bold text-primary">{Math.round(d.maxTemp)}°</span>
                <span className="text-muted">{Math.round(d.minTemp)}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
