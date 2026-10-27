import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { MessageCircle, CircleDashed, Phone, Settings } from "lucide-react";
import "./messenger.css";
import { MContext } from "./ui.jsx";
import { createWorld, reducer, uid } from "./store.js";
import { DEFAULT_START, START_STATES, TRIGGERS } from "./scenarios.js";
import { ChatsList, ArchivedList, StarredList, NewChat, NewGroup, SettingsPage } from "./components/Lists.jsx";
import { ChatView } from "./components/ChatView.jsx";
import { ContactInfo, GroupInfo, AddMembers, DocViewer, MapView, PhotoViewer } from "./components/Info.jsx";
import { CallsTab, CallScreen } from "./components/Calls.jsx";
import { UpdatesTab, StatusViewer } from "./components/Status.jsx";
import { ForwardSheet } from "./components/Pickers.jsx";

const TABS = [
  { id: "chats", label: "Chats", icon: MessageCircle },
  { id: "updates", label: "Updates", icon: CircleDashed },
  { id: "calls", label: "Calls", icon: Phone },
  { id: "settings", label: "Settings", icon: Settings },
];
const ROOTS = { chats: ChatsList, updates: UpdatesTab, calls: CallsTab, settings: SettingsPage };
const ROUTES = {
  chat: ChatView, contact: ContactInfo, group: GroupInfo, addMembers: AddMembers, archived: ArchivedList, starred: StarredList,
  newChat: NewChat, newGroup: NewGroup, doc: DocViewer, map: MapView,
};

export default function MessengerApp({ scenario, step, logEvent, openTasks, fire }) {
  const start = START_STATES[scenario?.id] ?? DEFAULT_START;
  const [world, dispatch] = useReducer(reducer, null, () => createWorld(start.setup));
  const [tab, setTab] = useState(start.tab);
  const [stack, setStack] = useState(start.stack);
  const [viewer, setViewer] = useState(null);
  const [status, setStatus] = useState(null);
  const [call, setCall] = useState(null); // { with, type, dir, script }
  const [forward, setForward] = useState(null); // { convId, msgIds }
  const [toastMsg, setToastMsg] = useState(null);
  const [banner, setBanner] = useState(null); // in-app notification banner
  const toastTimer = useRef(null);
  const pending = useRef([]); // actions not yet checked against triggers
  const fired = useRef(new Set());
  const worldRef = useRef(world);
  worldRef.current = world;

  const route = stack[stack.length - 1] ?? { name: tab };
  const routeKey = `${tab}:${stack.length}:${JSON.stringify(route)}`;
  const log = useCallback((type, props = {}) => logEvent(type, { app: "messenger", screen: route.name, ...props }), [logEvent, route.name]);

  const toast = useCallback((msg) => {
    clearTimeout(toastTimer.current);
    setToastMsg(msg);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2400);
  }, []);

  // Every state change goes through act() so scripted triggers can react to it.
  const act = useCallback((action) => { pending.current.push(action); dispatch(action); }, []);

  const nav = useMemo(() => ({
    push: (r) => { setStack((s) => [...s, r]); logEvent("navigate", { app: "messenger", to: r.name, ...r }); },
    replace: (r) => setStack((s) => [...s.slice(0, -1), r]),
    back: () => { setStack((s) => s.slice(0, -1)); logEvent("navigate_back", { app: "messenger", from: route.name }); },
    tab: (t) => { setTab(t); setStack([]); logEvent("tab", { app: "messenger", to: t }); },
    reset: (r) => { setTab("chats"); setStack(r ? [r] : []); },
  }), [logEvent, route.name]);

  // ---------- scripted triggers ----------
  const runTrigger = useCallback((t, how) => {
    if (fired.current.has(t.id) && how !== "researcher") return;
    fired.current.add(t.id);
    setTimeout(() => {
      const out = t.run(worldRef.current);
      if (!out) { logEvent("trigger_skipped", { app: "messenger", triggerId: t.id, how }); return; }
      logEvent("trigger_fired", { app: "messenger", triggerId: t.id, how });
      if (out.incomingCall) setCall({ ...out.incomingCall, dir: "in", id: uid("call") });
      if (out.deliver) {
        const { convId, from, messages } = out.deliver;
        dispatch({ type: "send", convId, from, messages: messages.map((m) => ({ id: uid("in"), ...m })) });
        const c = worldRef.current.conversations[convId];
        setBanner({ convId, from, text: messages.map((m) => m.text ?? (m.location ? "📍 Location" : "")).filter(Boolean).join(" · "), title: c?.kind === "group" ? c.title : null });
        setTimeout(() => setBanner(null), 6000);
      }
    }, how === "researcher" ? 300 : t.delay ?? 2000);
  }, [logEvent]);

  const triggers = TRIGGERS[scenario?.id] ?? [];
  useEffect(() => {
    const queue = pending.current;
    if (!queue.length) return;
    pending.current = [];
    for (const a of queue)
      for (const t of triggers) if (t.when && !fired.current.has(t.id) && t.when(a, world)) runTrigger(t, "action");
  }, [world]); // eslint-disable-line
  useEffect(() => {
    for (const t of triggers) if (t.onStep && t.onStep === step) runTrigger(t, "step");
  }, [step]); // eslint-disable-line
  useEffect(() => {
    if (!fire) return;
    const t = triggers.find((x) => x.id === fire.id);
    if (t) runTrigger(t, "researcher");
  }, [fire?.n]); // eslint-disable-line

  useEffect(() => { logEvent("start_state", { app: "messenger", tab: start.tab }); }, []); // eslint-disable-line

  const ctx = {
    world, act, nav, log, toast, route,
    openViewer: (photos, index, context) => { setViewer({ photos, index }); log("photo_opened", { ...context }); },
    openStatus: (author) => { setStatus(author); log("status_opened", { author }); },
    startCall: (personId, type) => { setCall({ with: personId, type, dir: "out", id: uid("call") }); },
    openForward: (req) => setForward(req),
    openTasks,
  };

  const Page = stack.length ? ROUTES[route.name] : ROOTS[tab];
  const fullScreen = ["chat", "doc", "map"].includes(route.name) && stack.length > 0;
  const unreadChats = Object.entries(world.unread).filter(([id, n]) => n > 0 && !world.conversations[id]?.archived).length;

  return (
    <MContext.Provider value={ctx}>
      <div className="wa-app">
        <main className={fullScreen ? "wa-main full" : "wa-main"}>
          <Page key={routeKey} route={route} />
        </main>
        {!fullScreen && (
          <nav className="wa-nav" aria-label="Primary">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} className={tab === id && !stack.length ? "wa-nav-item active" : "wa-nav-item"} onClick={() => nav.tab(id)} aria-current={tab === id}>
                <span className="wa-nav-icon"><Icon size={23} />{id === "chats" && unreadChats > 0 && <i>{unreadChats}</i>}</span>
                <span>{label}</span>
              </button>
            ))}
          </nav>
        )}
        {banner && (
          <button className="wa-banner" onClick={() => { setBanner(null); log("notification_banner_opened", { convId: banner.convId }); nav.reset({ name: "chat", convId: banner.convId }); }}>
            <strong>{banner.title ? `${banner.title}: ` : ""}{world.contacts[banner.from]?.name}</strong>
            <span>{banner.text}</span>
          </button>
        )}
        {forward && <ForwardSheet req={forward} onClose={() => setForward(null)} />}
        {viewer && <PhotoViewer {...viewer} onClose={() => setViewer(null)} />}
        {status && <StatusViewer author={status} onClose={() => setStatus(null)} />}
        {call && <CallScreen key={call.id} call={call} onEnd={() => setCall(null)} />}
        {toastMsg && <div className="wa-toast" role="status">{toastMsg}</div>}
      </div>
    </MContext.Provider>
  );
}
