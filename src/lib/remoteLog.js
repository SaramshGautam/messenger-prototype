// Sends every logged interaction to Firestore, grouped by session.
//
//   sessions/{sessionId}                    who is using the app (participant ID, device, app, times)
//   sessions/{sessionId}/events/{eventId}   what they did (one document per logged event)
//
// Logging is turned on only when the Firebase settings are present in .env.local
// (see README → "Remote logging"). Without them the app works as before and
// keeps the log in memory only (researcher menu → Log).
//
// No names are stored: researchers enter a participant ID such as P07.

import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, connectAuthEmulator } from "firebase/auth";
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  doc, setDoc, updateDoc, writeBatch, collection, serverTimestamp, connectFirestoreEmulator,
} from "firebase/firestore";

const env = import.meta.env;
const config = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};
export const remoteEnabled = Boolean(config.apiKey && config.projectId);

const APP_VERSION = env.VITE_APP_VERSION ?? "dev";
const APP_NAME = "messenger-prototype"; // sessions from the sandbox have app "sandbox" or no app field
const FLUSH_MS = 2000;
const MAX_BATCH = 400; // Firestore allows 500 writes per batch

let db = null;
let auth = null;
let ready = null; // promise resolved once signed in
let session = null; // { id, participantId }
let queue = [];
let timer = null;
let seq = 0;
let status = remoteEnabled ? "connecting" : "off"; // off | connecting | ok | error
const listeners = new Set();
const setStatus = (s) => { status = s; listeners.forEach((fn) => fn(s)); };
export const getStatus = () => status;
export const onStatus = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

function init() {
  if (!remoteEnabled || ready) return ready;
  const app = initializeApp(config);
  // Offline cache: events written while the phone is offline are sent when it reconnects.
  db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });
  auth = getAuth(app);
  if (env.VITE_FIREBASE_EMULATOR) { // local testing only: npm run emulators
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  }
  ready = signInAnonymously(auth)
    .then(() => setStatus("ok"))
    .catch((e) => { console.error("Remote logging: sign-in failed", e); setStatus("error"); throw e; });
  return ready;
}

const clean = (v) => JSON.parse(JSON.stringify(v ?? null)); // drop undefined / functions

function deviceInfo() {
  try {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      screen: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      standalone: window.matchMedia?.("(display-mode: standalone)").matches ?? false,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  } catch {
    return {};
  }
}

const KEY = "messenger.session";
const save = () => { try { if (session) sessionStorage.setItem(KEY, JSON.stringify({ ...session, seq })); else sessionStorage.removeItem(KEY); } catch { /* storage unavailable */ } };

// A session started earlier in this browser tab (survives a page reload).
export function savedSession() {
  try { return JSON.parse(sessionStorage.getItem(KEY) ?? "null"); } catch { return null; }
}
export function resumeSession(saved) {
  session = { id: saved.id, participantId: saved.participantId, practice: saved.practice, remote: saved.remote };
  seq = saved.seq ?? 0;
  if (remoteEnabled && !session.practice) createSessionDoc().catch(() => {});
  return session;
}

// Create the session document once per session (remembered in sessionStorage).
async function createSessionDoc(extra = {}) {
  if (!session || session.practice || session.remote) return;
  await init();
  const s = session;
  setDoc(doc(db, "sessions", s.id), {
    participantId: s.participantId,
    app: APP_NAME,
    researcher: extra.researcher ?? "", note: extra.note ?? "",
    ownerUid: auth.currentUser?.uid ?? null,
    appVersion: APP_VERSION,
    device: deviceInfo(),
    startedAt: serverTimestamp(),
    startedAtClient: new Date().toISOString(),
    endedAt: null,
    eventCount: 0,
  }).catch((e) => { console.error("Remote logging: could not create session", e); setStatus("error"); });
  s.remote = true;
  save();
}

const newId = () => `${new Date().toISOString().slice(0, 10)}_${Math.random().toString(36).slice(2, 8)}`;

// Start a new session for a participant (called when the researcher enters a participant ID).
// practice: true = not saved to the cloud (demos, piloting).
export async function startSession({ participantId, researcher = "", note = "", practice = false }) {
  await endSession("new_session");
  session = { id: newId(), participantId, practice };
  seq = 0;
  save();
  if (!remoteEnabled || practice) return session;
  try {
    await createSessionDoc({ researcher, note });
  } catch (e) {
    console.error("Remote logging: could not create session", e);
    setStatus("error");
  }
  return session;
}

export async function endSession(reason = "ended") {
  if (!session) return;
  const s = session;
  await flush();
  session = null;
  save();
  if (!remoteEnabled || s.practice) return;
  try {
    updateDoc(doc(db, "sessions", s.id), { endedAt: serverTimestamp(), endReason: reason, eventCount: seq }).catch((e) => console.error("Remote logging: could not close session", e));
  } catch (e) {
    console.error("Remote logging: could not close session", e);
  }
}

export const currentSession = () => session;

// Queue one event (the same object that goes into the in-app log).
export function logRemote(event) {
  if (!session) return;
  seq += 1;
  save();
  if (!remoteEnabled || session.practice) return;
  queue.push({ app: APP_NAME, ...clean(event), seq, sessionId: session.id, participantId: session.participantId });
  if (queue.length >= MAX_BATCH) flush();
  else if (!timer) timer = setTimeout(flush, FLUSH_MS);
}

export async function flush() {
  clearTimeout(timer);
  timer = null;
  if (!remoteEnabled || !queue.length || !session || session.practice) return;
  const items = queue.splice(0, MAX_BATCH);
  const sid = session.id;
  try {
    await init();
    if (!session.remote) await createSessionDoc();
    const uid = auth.currentUser?.uid ?? null;
    const batch = writeBatch(db);
    const events = collection(db, "sessions", sid, "events");
    for (const e of items) batch.set(doc(events, `${String(e.seq).padStart(6, "0")}_${e.id ?? ""}`.slice(0, 120)), { ...e, uid, serverTime: serverTimestamp() });
    await batch.commit();
    updateDoc(doc(db, "sessions", sid), { eventCount: seq, lastEventAt: serverTimestamp() }).catch(() => {}); // counter only
    if (status !== "ok") setStatus("ok");
  } catch (e) {
    console.error("Remote logging: write failed, will retry", e);
    setStatus("error");
    queue.unshift(...items);
    timer = setTimeout(flush, FLUSH_MS * 5);
  }
  if (queue.length) flush();
}

// Send what is queued when the page is hidden or closed.
if (typeof window !== "undefined") {
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flush(); });
  window.addEventListener("pagehide", () => { flush(); });
}
