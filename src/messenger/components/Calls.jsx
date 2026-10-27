import { useEffect, useRef, useState } from "react";
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Volume2, PhoneIncoming, PhoneOutgoing, PhoneMissed, Link2, ChevronDown } from "lucide-react";
import { useM, PersonAvatar, fmtDuration } from "../ui.jsx";
import { contact } from "../store.js";
import { scriptFor } from "../scenarios.js";

export function CallsTab() {
  const { world, startCall, log } = useM();
  return (
    <div className="wa-page">
      <div className="wa-top"><strong className="wa-brand">Calls</strong></div>
      <button className="wa-conv"><span className="wa-round-icon green"><Link2 size={20} /></span><span className="wa-conv-copy"><strong>Create call link</strong><small>Share a link for your call</small></span></button>
      <h3 className="wa-section">Recent</h3>
      {world.calls.map((c) => {
        const Icon = c.status === "missed" ? PhoneMissed : c.dir === "in" ? PhoneIncoming : PhoneOutgoing;
        return (
          <div key={c.id} className="wa-conv">
            <PersonAvatar id={c.with} />
            <span className="wa-conv-copy">
              <strong className={c.status === "missed" ? "missed" : ""}>{contact(world, c.with).name}</strong>
              <small><Icon size={14} className={c.status === "missed" ? "missed" : "ok"} /> {c.day}, {c.time}</small>
            </span>
            <button className="wa-icon" aria-label={`${c.type === "video" ? "Video" : "Voice"} call ${contact(world, c.with).name}`} onClick={() => { log("call_button", { type: c.type, personId: c.with, via: "calls_tab" }); startCall(c.with, c.type); }}>
              {c.type === "video" ? <Video size={22} /> : <Phone size={21} />}
            </button>
          </div>
        );
      })}
    </div>
  );
}

const speak = (text) => {
  try {
    const s = window.speechSynthesis;
    if (!s) return;
    s.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.92;
    s.speak(u);
  } catch { /* no speech available: captions only */ }
};

// Simulated call. Outgoing calls ring, then the scripted partner answers (or
// nobody answers). Incoming calls ring until accepted or declined.
export function CallScreen({ call, onEnd }) {
  const { world, act, log } = useM();
  const person = contact(world, call.with);
  const script = scriptFor(call.with, call.script);
  const [phase, setPhase] = useState(call.dir === "in" ? "incoming" : "calling");
  const [type, setType] = useState(call.type);
  const [camera, setCamera] = useState(call.type === "video");
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(call.type === "video");
  const [caption, setCaption] = useState(null);
  const [secs, setSecs] = useState(0);
  const [minimized, setMinimized] = useState(false);
  const events = useRef(new Set());
  const t0 = useRef(null);
  const timers = useRef([]);
  const videoRef = useRef(null);
  const stream = useRef(null);
  const ended = useRef(false);

  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.current.push(t); return t; };
  const base = { personId: call.with, callType: call.type, direction: call.dir };

  // camera preview (only shown on screen, never recorded)
  useEffect(() => {
    if (!camera || phase === "ended") { stream.current?.getTracks().forEach((t) => t.stop()); stream.current = null; return; }
    let cancelled = false;
    navigator.mediaDevices?.getUserMedia?.({ video: true }).then((s) => {
      if (cancelled) { s.getTracks().forEach((t) => t.stop()); return; }
      stream.current = s;
      if (videoRef.current) videoRef.current.srcObject = s;
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [camera, phase]);

  const finish = (status, reason) => {
    if (ended.current) return;
    ended.current = true;
    timers.current.forEach(clearTimeout);
    window.speechSynthesis?.cancel();
    stream.current?.getTracks().forEach((t) => t.stop());
    const duration = t0.current ? Math.round((Date.now() - t0.current) / 1000) : 0;
    act({ type: "callLog", with: call.with, dir: call.dir, call: { type, status, duration } });
    log("call_ended", { ...base, status, reason, duration, finalType: type, actions: [...events.current] });
    setPhase("ended");
    later(onEnd, 1200);
  };

  // outgoing: ring, then answer or no answer
  useEffect(() => {
    log(call.dir === "in" ? "incoming_call_shown" : "call_started", base);
    if (call.dir === "out") {
      later(() => setPhase("ringing"), 1200);
      if (script.answers) later(() => connect(), 4000);
      else later(() => finish("missed", "no_answer"), 16000);
    } else {
      later(() => { if (!t0.current && !ended.current) { log("incoming_call_missed", base); finish("missed", "not_answered"); } }, 40000);
    }
    return () => timers.current.forEach(clearTimeout);
  }, []); // eslint-disable-line

  useEffect(() => {
    if (phase !== "connected") return;
    const t = setInterval(() => setSecs(Math.round((Date.now() - t0.current) / 1000)), 500);
    return () => clearInterval(t);
  }, [phase]);

  // Run the partner's script line by line.
  const runLines = (i) => {
    if (ended.current || i >= script.lines.length) return;
    const line = script.lines[i];
    if (line.waitFor) {
      const start = Date.now();
      const check = () => {
        if (ended.current) return;
        if (line.waitFor.every((e) => events.current.has(e)) || Date.now() - start > line.timeout) {
          log("call_script_wait_done", { ...base, waitedFor: line.waitFor, completed: line.waitFor.every((e) => events.current.has(e)) });
          runLines(i + 1);
        } else later(check, 400);
      };
      check();
      return;
    }
    later(() => {
      if (ended.current) return;
      setCaption(line.text);
      speak(line.text);
      log("call_partner_spoke", { ...base, line: line.text });
      runLines(i + 1);
    }, line.after ?? 1000);
  };

  const connect = () => {
    if (ended.current) return;
    t0.current = Date.now();
    setPhase("connected");
    log("call_connected", base);
    runLines(0);
  };

  const mark = (name) => { events.current.add(name); log(`call_${name}`, base); };
  const toggleCamera = () => {
    const next = !camera;
    setCamera(next);
    if (next && type === "voice") setType("video");
    mark(next ? "camera_on" : "camera_off");
  };
  const toggleMute = () => { const next = !muted; setMuted(next); mark(next ? "mic_muted" : "mic_unmuted"); };

  if (minimized)
    return <button className="wa-call-mini" onClick={() => setMinimized(false)}><Phone size={16} /> {person.name} · {phase === "connected" ? fmtDuration(secs) : "Calling…"} — tap to return</button>;

  const video = type === "video";
  return (
    <div className={`wa-call ${video ? "video" : ""}`} role="dialog" aria-label={`Call with ${person.name}`}>
      <div className="wa-call-top">
        <button className="wa-icon" aria-label="Minimize call" onClick={() => setMinimized(true)}><ChevronDown size={26} /></button>
        <small>🔒 Study call (simulated)</small><span />
      </div>
      <div className="wa-call-id">
        <PersonAvatar id={call.with} size="xl" />
        <h2>{person.name}</h2>
        <p>
          {phase === "incoming" && `Incoming ${call.type} call`}
          {phase === "calling" && "Calling…"}
          {phase === "ringing" && "Ringing…"}
          {phase === "connected" && fmtDuration(secs)}
          {phase === "ended" && (t0.current ? "Call ended" : call.dir === "out" ? "No answer" : "Call ended")}
        </p>
        {video && phase === "connected" && <small className="wa-call-note">{person.name.split(" ")[0]}’s video (simulated)</small>}
      </div>
      {caption && phase === "connected" && <p className="wa-call-caption" aria-live="polite">“{caption}”</p>}
      {video && phase !== "ended" && (
        <div className="wa-self-view">{camera ? <video ref={videoRef} autoPlay muted playsInline /> : <span><VideoOff size={22} /> Camera off</span>}</div>
      )}
      {phase === "incoming" ? (
        <div className="wa-incoming">
          <button className="decline" onClick={() => { log("incoming_call_declined", base); finish("missed", "declined"); }} aria-label="Decline"><PhoneOff size={28} /><span>Decline</span></button>
          <button className="accept" onClick={() => { log("incoming_call_accepted", base); connect(); }} aria-label="Accept">{call.type === "video" ? <Video size={28} /> : <Phone size={28} />}<span>Accept</span></button>
        </div>
      ) : phase !== "ended" && (
        <div className="wa-call-controls">
          <button className={camera ? "on" : ""} onClick={toggleCamera} aria-pressed={camera} aria-label={camera ? "Turn camera off" : "Turn camera on"}>{camera ? <Video size={24} /> : <VideoOff size={24} />}<span>{camera ? "Camera on" : "Camera off"}</span></button>
          <button className={muted ? "on" : ""} onClick={toggleMute} aria-pressed={muted} aria-label={muted ? "Unmute" : "Mute"}>{muted ? <MicOff size={24} /> : <Mic size={24} />}<span>{muted ? "Muted" : "Mute"}</span></button>
          <button className={speaker ? "on" : ""} onClick={() => { setSpeaker((v) => !v); mark(speaker ? "speaker_off" : "speaker_on"); }} aria-pressed={speaker} aria-label="Speaker"><Volume2 size={24} /><span>Speaker</span></button>
          <button className="end" onClick={() => finish(t0.current ? "ended" : "missed", "hung_up")} aria-label="End call"><PhoneOff size={26} /><span>End</span></button>
        </div>
      )}
    </div>
  );
}
