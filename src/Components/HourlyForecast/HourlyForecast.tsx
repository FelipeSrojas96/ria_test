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
    <div className="overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
      <div className="flex gap-2.5 snap-x snap-mandatory w-max mx-auto">
      {data.map((h) => {
        const w = h.weather?.[0];
        const label = new Date((h.dt + timezoneOffset) * 1000).toISOString().slice(11, 16);

        return (
          <div key={h.dt} className="snap-start min-w-[64px] px-2.5 pt-2.5 pb-2 text-center">
            <div className="text-[12px] text-muted font-bold">{label}</div>

            <div className="h-[34px] flex items-center justify-center">
              {w?.icon && (
                <img
                  className="opacity-95 w-[30px] h-[30px]"
                  src={iconUrl(w.icon)}
                  alt={w.description}
                />
              )}
            </div>

            <div className="text-[14px] font-extrabold text-primary mt-0.5">
              {Math.round(h.main.temp)}°
            </div>
            <div className="text-[11px] text-muted mt-0.5">
              {Math.round(h.main.humidity)}%
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}
