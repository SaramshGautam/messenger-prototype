// Converts the Messenger App sheet of the task bank (exported as task-bank/messenger.csv)
// into src/data/scenarios.json.
//
//   npm run convert:tasks
//
// Each scenario is 4 rows: the first row has the Task ID and background (Find),
// followed by Understand, Reply and Share rows with an empty Task ID.
import fs from "node:fs";
import Papa from "papaparse";

const SRC = process.argv[2] ?? "task-bank/messenger.csv";
const OUT = process.argv[3] ?? "src/data/scenarios.json";
const clean = (v) => String(v ?? "").replace(/\r/g, "").trim();

const parsed = Papa.parse(fs.readFileSync(SRC, "utf8").replace(/^﻿/, ""), {
  header: true, skipEmptyLines: "greedy", transformHeader: (h) => h.trim().toLowerCase(),
});
const scenarios = [];
let current = null;
parsed.data.forEach((row, i) => {
  const rawId = clean(row["task id"]);
  if (rawId) {
    const num = rawId.match(/T(\d+)/i)?.[1];
    if (!num) throw new Error(`${SRC} row ${i + 2}: bad Task ID "${rawId}"`);
    // The sheet labels these "T01-S"…; the messenger tasks are named T01-M…
    current = { id: `T${num.padStart(2, "0")}-M`, app: "messenger", number: Number(num), background: clean(row["background & scenario"]), steps: [] };
    scenarios.push(current);
  }
  if (!current) return;
  const goal = clean(row["task goal"]);
  if (!goal) return;
  current.steps.push({
    n: current.steps.length + 1,
    intent: clean(row["intent family"]) || ["Find", "Understand", "Reply", "Share"][current.steps.length],
    goal,
    demands: clean(row["task demands"]),
    setup: clean(row["sandbox setup and starting the state"]),
    outcome: clean(row["correct outcome"]),
    sourceRow: i + 2,
  });
});
for (const s of scenarios) if (s.steps.length !== 4) console.warn(`Warning: ${s.id} has ${s.steps.length} steps`);
fs.mkdirSync("src/data", { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), scenarios }, null, 2));
console.log(`Wrote ${scenarios.length} scenarios (${scenarios.reduce((n, s) => n + s.steps.length, 0)} steps) to ${OUT}`);
