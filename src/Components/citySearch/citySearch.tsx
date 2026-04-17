import { useEffect, useMemo, useState } from "react";
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption } from "@headlessui/react";
import { SEARCH_WRAPPER, DROPDOWN } from "../../styles";

export type CityIndexRow = [string, string, string, string, string];
//                     [id,   name,   state,  country, key]
export type CityPick = { id: string; label: string; query: string };

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();

function lowerBound(arr: CityIndexRow[], target: string) {
  let lo = 0,
    hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid][4] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

export function searchCities(
  index: CityIndexRow[],
  q: string,
  limit = 15
): CityPick[] {
  const queryKey = normalize(q);
  if (queryKey.length < 2) return [];

  const start = lowerBound(index, queryKey);
  const results: CityPick[] = [];

  for (let i = start; i < index.length && results.length < limit; i++) {
    const [id, name, , country, key] = index[i];
    if (!key.startsWith(queryKey)) break;
    results.push({ id, label: `${name}, ${country}`, query: `${name},${country}` });
  }

  return results;
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

export function CitySearch({
  cityIndex,
  disabled,
  onSelect,
  placeholder = "Search city…",
}: {
  cityIndex: CityIndexRow[];
  disabled?: boolean;
  onSelect: (city: CityPick) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");
  const debounced = useDebouncedValue(input, 200);

  const results = useMemo(() => {
    if (disabled) return [];
    return searchCities(cityIndex, debounced, 12);
  }, [cityIndex, debounced, disabled]);

  const handleChange = (city: CityPick | null) => {
    if (!city) return;
    setInput(city.label);
    onSelect(city);
  };

  return (
    <Combobox immediate onChange={handleChange} disabled={disabled}>
      <div className="relative w-full max-w-[520px]">
        <div className={`${SEARCH_WRAPPER} ${disabled ? "opacity-60" : ""}`}>
          <span className="opacity-70 select-none">🔎</span>

          <ComboboxInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={disabled ? "Loading cities…" : placeholder}
            autoComplete="off"
            spellCheck={false}
            displayValue={() => input}
            className="w-full border-none outline-none bg-transparent text-primary text-[14px] placeholder:text-faint disabled:cursor-not-allowed"
          />

          {!!input && !disabled && (
            <button
              onClick={() => setInput("")}
              className="border-none bg-transparent text-muted cursor-pointer text-[14px] p-0 leading-none"
              aria-label="Clear"
              title="Clear"
            >
              ✕
            </button>
          )}
        </div>

        <ComboboxOptions className={DROPDOWN}>
          {results.map((r, idx) => (
            <ComboboxOption
              key={r.id}
              value={r}
              className={({ focus }) =>
                `px-3 py-[10px] cursor-pointer text-[14px] text-primary ${
                  idx !== 0 ? "border-t border-white/[0.06]" : ""
                } ${focus ? "bg-glass" : "bg-transparent"}`
              }
            >
              {r.label}
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </div>
    </Combobox>
  );
}
