// Messenger scenarios (task bank v3: T01-M … T04-M): start screen and extra state.
// TASK START: every scenario starts from a fresh copy of world.js.
// CONTINUE: steps 2–4 keep the participant's screen and changes.

import { ME } from "./world.js";
import { photo as P } from "./photos.js";

const chatList = { tab: "chats", stack: [] };
const inChat = (convId, setup) => ({ tab: "chats", stack: [{ name: "chat", convId }], setup });

// Everything every task needs is in the world from the start, whichever way the
// app is opened (with or without a scenario). Participants get their tasks on
// paper, so no state may depend on which scenario was picked in the app.
const everything = (w) => {
  // Your story: the blurry market poster you posted by mistake (T04-M).
  w.myStatus = [{ id: "my_blurry", kind: "image", src: P("market-poster-blurry"), alt: "Blurry photo of the market poster", time: "Today, 8:40 AM", viewers: [["grace", "8:52 AM"], ["sam", "9:10 AM"]] }];
};

export const START_STATES = {
  "T01-M": { ...chatList, setup: everything }, // Alex Turner, David's read receipt, Nora
  "T02-M": inChat("g_notices", everything), // Oak Court Notices
  "T03-M": inChat("g_garden", everything), // Maple Gardening
  "T04-M": { ...chatList, setup: everything }, // Brookside Community Market
};
export const DEFAULT_START = { ...chatList, setup: everything };

// No scripted (delayed) messages or calls in this task bank.
export const TRIGGERS = {};
export const researcherTriggers = (scenarioId) => (TRIGGERS[scenarioId] ?? []).map(({ id, label }) => ({ id, label }));

// Outgoing calls: nobody answers (rings, then "No answer").
export const CALL_SCRIPTS = {};
export const scriptFor = (personId, incomingScript) => CALL_SCRIPTS[incomingScript ?? personId] ?? { answers: false, lines: [] };

export { ME };
