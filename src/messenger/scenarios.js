// Messenger scenarios (task bank v3: T01-M … T04-M): start screen and extra state.
// TASK START: every scenario starts from a fresh copy of world.js.
// CONTINUE: steps 2–4 keep the participant's screen and changes.

import { ME } from "./world.js";
import { photo as P } from "./photos.js";

const chatList = { tab: "chats", stack: [] };
const inChat = (convId, setup) => ({ tab: "chats", stack: [{ name: "chat", convId }], setup });

export const START_STATES = {
  "T01-M": chatList, // Alex Turner, David's read receipt, Nora
  "T02-M": inChat("g_notices"), // Oak Court Notices
  "T03-M": inChat("g_garden"), // Maple Gardening
  "T04-M": { ...chatList, setup: (w) => { // Brookside Community Market: your blurry status is already posted
    w.myStatus = [{ id: "my_blurry", kind: "image", src: P("market-poster-blurry"), alt: "Blurry photo of the market poster", time: "Today, 8:40 AM", viewers: [["grace", "8:52 AM"], ["sam", "9:10 AM"]] }];
  } },
};
export const DEFAULT_START = chatList;

// No scripted (delayed) messages or calls in this task bank.
export const TRIGGERS = {};
export const researcherTriggers = (scenarioId) => (TRIGGERS[scenarioId] ?? []).map(({ id, label }) => ({ id, label }));

// Outgoing calls: nobody answers (rings, then "No answer").
export const CALL_SCRIPTS = {};
export const scriptFor = (personId, incomingScript) => CALL_SCRIPTS[incomingScript ?? personId] ?? { answers: false, lines: [] };

export { ME };
