import React, { useEffect, useMemo, useRef, useState } from "react";

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
    const [id, name, state, country, key] = index[i];
    if (!key.startsWith(queryKey)) break;

    const label = `${name}, ${country}`;
    const queryStr = `${name},${country}`;

    results.push({ id, label, query: queryStr });
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
  value,
  onSelect,
  placeholder = "Search city…",
}: {
  cityIndex: CityIndexRow[]; // ✅ added
  disabled?: boolean; // ✅ added
  value?: string;
  onSelect: (city: CityPick) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState(value ?? "");
  const debounced = useDebouncedValue(input, 200);

  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const results = useMemo(() => {
    if (disabled) return [];
    return searchCities(cityIndex, debounced, 12);
  }, [cityIndex, debounced, disabled]);

  useEffect(() => {
    setActiveIdx(0);
    setOpen(!disabled && results.length > 0 && debounced.trim().length >= 2);
  }, [debounced, results.length, disabled]);

  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  const commit = (c: CityPick) => {
    onSelect(c);
    setInput(c.label);
    setOpen(false);
    inputRef.current?.blur();
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (disabled) return;

    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      if (results.length) setOpen(true);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (open && results[activeIdx]) {
        e.preventDefault();
        commit(results[activeIdx]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div
      ref={rootRef}
      style={{ position: "relative", width: "100%", maxWidth: 520 }}
    >
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          padding: "10px 12px",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(0,0,0,0.20)",
          backdropFilter: "blur(8px)",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <span style={{ opacity: 0.7 }}>🔎</span>

        <input
          ref={inputRef}
          value={input}
          disabled={disabled}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() =>
            setOpen(
              !disabled && results.length > 0 && normalize(input).length >= 2
            )
          }
          onKeyDown={onKeyDown}
          placeholder={disabled ? "Loading cities…" : placeholder}
          autoComplete="off"
          spellCheck={false}
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            background: "transparent",
            color: "white",
            fontSize: 14,
          }}
        />

        {!!input && !disabled && (
          <button
            onClick={() => {
              setInput("");
              setOpen(false);
              inputRef.current?.focus();
            }}
            style={{
              border: "none",
              background: "transparent",
              color: "rgba(255,255,255,0.75)",
              cursor: "pointer",
              fontSize: 14,
            }}
            aria-label="Clear"
            title="Clear"
          >
            ✕
          </button>
        )}
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(18,18,18,0.95)",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
            zIndex: 50,
          }}
          role="listbox"
        >
          {results.map((r, idx) => {
            const isActive = idx === activeIdx;
            return (
              <div
                key={r.id}
                role="option"
                aria-selected={isActive}
                onMouseEnter={() => setActiveIdx(idx)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  commit(r);
                }}
                style={{
                  padding: "10px 12px",
                  cursor: "pointer",
                  background: isActive
                    ? "rgba(255,255,255,0.08)"
                    : "transparent",
                  borderTop:
                    idx === 0 ? "none" : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.95)" }}>
                  {r.label}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.60)" }}>
                  query: {r.query}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
