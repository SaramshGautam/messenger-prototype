// Messenger scenarios (T01-M … T13-M): start screen, scripted events and call scripts.
// TASK START: every scenario starts from a fresh copy of world.js at the chat list.
// CONTINUE: steps 2–4 keep the participant's screen and changes.
// Scripted messages and calls are withheld until their trigger.

import { ME } from "./world.js";

export const START_STATES = {}; // every scenario starts at the conversation list
export const DEFAULT_START = { tab: "chats", stack: [] };

const newestGroupWith = (w, personId) =>
  w.convOrder.map((id) => w.conversations[id]).find((c) => c.kind === "group" && c.created && c.members.includes(personId));

// Each trigger fires at most once per scenario run.
//   onStep: fire when the researcher moves to this step
//   when(action, world): fire after a matching participant action
//   run(world) returns { incomingCall } or { deliver: { convId, from, messages } }
export const TRIGGERS = {
  "T03-M": [{
    id: "lena_video_call", label: "Lena calls (video) — practice call",
    onStep: 3, delay: 4000,
    run: () => ({ incomingCall: { with: "lena", type: "video", script: "lena_practice" } }),
  }],
  "T07-M": [{
    id: "priya_ravi_confirmed", label: "Priya: “Ravi has confirmed…” in the new group",
    when: (a) => a.type === "createGroup" && /saturday\s*helpers/i.test(a.title) && a.members.includes("priya"),
    delay: 3500,
    run: (w) => {
      const g = newestGroupWith(w, "priya");
      if (!g) return null;
      return { deliver: { convId: g.id, from: "priya", messages: [{ text: "Ravi has confirmed. Please add Ravi and send the schedule here so everyone has it." }] } };
    },
  }],
  "T13-M": [{
    id: "elena_location", label: "Elena sends the River Café location",
    when: (a) => a.type === "send" && a.statusReply?.author === "elena",
    delay: 3500,
    run: () => ({ deliver: { convId: "dm_elena", from: "elena", messages: [
      { location: { placeId: "river_cafe" } },
      { text: "Please pass this to Walking Group so everyone can find us." },
    ] } }),
  }],
};

export const researcherTriggers = (scenarioId) => (TRIGGERS[scenarioId] ?? []).map(({ id, label }) => ({ id, label }));

// Simulated call partners. Lines are spoken aloud (text-to-speech) and shown as captions.
//   after: ms after the previous line (or after connecting)
//   waitFor: participant actions to wait for before continuing (or until timeout ms)
export const CALL_SCRIPTS = {
  // T02-M: outgoing call to Omar (he answers voice or video calls)
  omar: { answers: true, lines: [
    { after: 1200, text: "Hello, this is Omar." },
    { after: 7000, text: "Hello. To arrange the repair, please send me the completed Lamp repair form from your phone. Thank you." },
  ] },
  // T03-M: Lena's incoming practice video call
  lena_practice: { answers: true, lines: [
    { after: 2500, text: "Please switch your camera off, then back on." },
    { waitFor: ["camera_off", "camera_on"], timeout: 30000 },
    { after: 1500, text: "Now mute your microphone, then unmute it." },
    { waitFor: ["mic_muted", "mic_unmuted"], timeout: 30000 },
    { after: 1500, text: "That is the practice finished. After we hang up, please send me the photo of your workshop kit." },
  ] },
};
CALL_SCRIPTS.lena = CALL_SCRIPTS.lena_practice; // if the participant calls Lena back
// Anyone else does not answer an outgoing call (rings, then "No answer").
export const scriptFor = (personId, incomingScript) => CALL_SCRIPTS[incomingScript ?? personId] ?? { answers: false, lines: [] };

export { ME };
