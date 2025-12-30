import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse";

const INPUT = path.resolve("data/cities_20000.csv"); // <- your downloaded CSV
const OUTPUT = path.resolve("public/cities.index.json");

// [city_id, name, state, country, key]
/** @type {Array<[string,string,string,string,string]>} */
const out = [];

const normalize = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();

fs.createReadStream(INPUT)
  .pipe(
    parse({
      columns: true,
      relax_quotes: true,
      relax_column_count: true,
      trim: true,
      skip_empty_lines: true,
    })
  )
  .on("data", (r) => {
    const city_id = (r.city_id || "").trim();
    const name = (r.city_name || "").trim();
    const state = (r.state_code || "").trim();
    const country = (r.country_code || "").trim();

    if (!city_id || !name || !country) return;

    const key = normalize(`${name} ${state} ${country}`);
    out.push([city_id, name, state, country, key]);
  })
  .on("end", () => {
    out.sort((a, b) => (a[4] < b[4] ? -1 : a[4] > b[4] ? 1 : 0));
    fs.writeFileSync(OUTPUT, JSON.stringify(out));
    console.log(`✅ Wrote ${out.length} rows to ${OUTPUT}`);
  })
  .on("error", (err) => {
    console.error(err);
    process.exit(1);
  });
