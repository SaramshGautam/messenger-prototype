// Downloads all study sessions and events from Firestore.
//
//   npm run logs:export                 → logs-export/<date>/sessions.csv, events.csv, events.jsonl
//   npm run logs:export -- --participant P07
//
// Needs a service-account key (Firebase console → Project settings → Service accounts →
// Generate new private key). Save it OUTSIDE the repo and point to it:
//   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
import fs from "node:fs";
import path from "node:path";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const args = process.argv.slice(2);
const only = args.includes("--participant") ? args[args.indexOf("--participant") + 1] : null;

initializeApp({ credential: applicationDefault(), projectId: process.env.FIREBASE_PROJECT_ID ?? process.env.VITE_FIREBASE_PROJECT_ID });
const db = getFirestore();

const ts = (v) => (v?.toDate ? v.toDate().toISOString() : v ?? "");
const csv = (rows, cols) => [cols.join(","), ...rows.map((r) => cols.map((c) => {
  const v = r[c] == null ? "" : typeof r[c] === "object" ? JSON.stringify(r[c]) : String(r[c]);
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}).join(","))].join("\n");

let q = db.collection("sessions");
if (only) q = q.where("participantId", "==", only);
const sessions = (await q.get()).docs.map((d) => ({ sessionId: d.id, ...d.data() }));
const events = [];
for (const s of sessions) {
  const snap = await db.collection("sessions").doc(s.sessionId).collection("events").orderBy("seq").get();
  for (const d of snap.docs) events.push({ ...d.data(), serverTime: ts(d.data().serverTime) });
}

const out = path.join("logs-export", new Date().toISOString().slice(0, 10));
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, "sessions.csv"), csv(sessions.map((s) => ({ ...s, startedAt: ts(s.startedAt), endedAt: ts(s.endedAt), lastEventAt: ts(s.lastEventAt) })),
  ["sessionId", "app", "participantId", "researcher", "startedAt", "endedAt", "endReason", "eventCount", "appVersion", "device", "note"]));
fs.writeFileSync(path.join(out, "events.jsonl"), events.map((e) => JSON.stringify(e)).join("\n"));
const base = ["participantId", "sessionId", "seq", "timestamp", "serverTime", "app", "scenarioId", "step", "intent", "type", "screen"];
const extra = [...new Set(events.flatMap((e) => Object.keys(e)))].filter((k) => !base.includes(k) && k !== "id");
fs.writeFileSync(path.join(out, "events.csv"), csv(events, [...base, ...extra]));
console.log(`Exported ${sessions.length} sessions and ${events.length} events to ${out}/`);
