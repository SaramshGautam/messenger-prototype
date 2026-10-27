import { useEffect, useRef, useState } from "react";
import { FileText, MapPin, Phone, Video, PhoneMissed, Star, Play, Pause, CornerUpLeft, Forward, Ban, CheckCheck, Pencil } from "lucide-react";
import { useM, PersonAvatar, useLongPress, fmtDuration } from "../ui.jsx";
import { contact, msgSummary, ME, findDM } from "../store.js";

const NAME_COLORS = ["#c2185b", "#1565c0", "#2e7d32", "#6a1b9a", "#ef6c00", "#00838f", "#ad1457", "#4e342e"];
export const nameColor = (id) => NAME_COLORS[[...String(id)].reduce((a, ch) => a + ch.charCodeAt(0), 0) % NAME_COLORS.length];

export function AudioPlayer({ audio, msgId, mine }) {
  const { log } = useM();
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const el = useRef(null);
  const timer = useRef(null);
  const mode = useRef(null);
  const stop = () => { clearInterval(timer.current); el.current?.pause(); if (mode.current === "tts") window.speechSynthesis?.cancel(); setPlaying(false); };
  useEffect(() => stop, []); // eslint-disable-line
  const tts = () => {
    mode.current = "tts";
    const synth = window.speechSynthesis;
    if (synth && audio.transcript) {
      synth.cancel();
      const u = new SpeechSynthesisUtterance(audio.transcript);
      u.rate = 0.92;
      u.onend = () => { clearInterval(timer.current); setPlaying(false); setPos(audio.duration); };
      synth.speak(u);
    }
    const t0 = Date.now();
    timer.current = setInterval(() => {
      const p = (Date.now() - t0) / 1000;
      setPos(Math.min(p, audio.duration));
      if (p >= audio.duration + 3) { clearInterval(timer.current); setPlaying(false); }
    }, 200);
  };
  const toggle = (e) => {
    e.stopPropagation();
    if (playing) { stop(); log("audio_paused", { msgId, at: Math.round(pos) }); return; }
    setPlaying(true); setPos(0);
    log("audio_played", { msgId });
    if (audio.src) {
      const a = new Audio(audio.src);
      el.current = a; mode.current = "file";
      a.ontimeupdate = () => setPos(a.currentTime);
      a.onended = () => { setPlaying(false); setPos(audio.duration); };
      a.onerror = () => (audio.transcript ? tts() : setPlaying(false));
      a.play().catch(() => (audio.transcript ? tts() : setPlaying(false)));
    } else tts();
  };
  const pct = audio.duration ? Math.min(100, (pos / audio.duration) * 100) : 0;
  return (
    <span className="wa-audio">
      {!mine && <PersonAvatar id={audio.from ?? "nora"} size="sm" />}
      <button className="wa-audio-play" onClick={toggle} aria-label={playing ? "Pause voice message" : "Play voice message"}>{playing ? <Pause size={22} /> : <Play size={22} />}</button>
      <span className="wa-audio-wave" aria-hidden>{Array.from({ length: 28 }, (_, i) => <i key={i} style={{ height: `${5 + ((i * 41) % 19)}px`, opacity: (i / 28) * 100 < pct ? 1 : 0.35 }} />)}</span>
      <small>{fmtDuration(playing || pos ? pos : audio.duration)}</small>
    </span>
  );
}

function Quote({ conv, m, onJump }) {
  const { world } = useM();
  const q = conv.messages.find((x) => x.id === m.replyTo);
  if (!q) return null;
  return (
    <button className="wa-quote" onClick={(e) => { e.stopPropagation(); onJump(q.id); }} aria-label="Go to the original message">
      <span>
        <strong style={{ color: q.from === ME ? "#1fa855" : nameColor(q.from) }}>{q.from === ME ? "You" : contact(world, q.from).name}</strong>
        <small>{q.deletedForEveryone ? "This message was deleted" : msgSummary(world, q)}</small>
      </span>
      {q.image && !q.deletedForEveryone && <img src={q.image.src} alt="" />}
    </button>
  );
}

function PollView({ conv, m }) {
  const { world, act, log } = useM();
  const poll = m.poll;
  const voters = new Set(poll.options.flatMap((o) => o.votes)).size;
  const max = Math.max(1, ...poll.options.map((o) => o.votes.length));
  return (
    <span className="wa-poll" role="group" aria-label={poll.question}>
      <strong>{poll.question}</strong>
      <small>{poll.multiple ? "Select one or more" : "Select one"}</small>
      {poll.options.map((o) => {
        const mine = o.votes.includes(ME);
        return (
          <button key={o.id} className="wa-poll-opt" role={poll.multiple ? "checkbox" : "radio"} aria-checked={mine}
            onClick={(e) => { e.stopPropagation(); act({ type: "vote", convId: conv.id, msgId: m.id, optionId: o.id }); log(mine ? "poll_vote_removed" : "poll_vote_added", { convId: conv.id, msgId: m.id, optionId: o.id, option: o.text, multiple: poll.multiple }); }}>
            <span className={`wa-poll-check ${poll.multiple ? "sq" : ""} ${mine ? "on" : ""}`} />
            <span className="wa-poll-text"><span>{o.text}</span><b>{o.votes.length}</b>
              <i style={{ width: `${(o.votes.length / max) * 100}%` }} /></span>
          </button>
        );
      })}
      <small className="wa-poll-foot">{voters} {voters === 1 ? "person has" : "people have"} voted{poll.options.some((o) => o.votes.includes(ME)) ? ` · You: ${poll.options.filter((o) => o.votes.includes(ME)).map((o) => o.text).join(", ")}` : ""}</small>
      {void world}
    </span>
  );
}

export default function Bubble({ conv, m, selected, selecting, onSelect, onJump, flash }) {
  const { world, nav, openViewer, log } = useM();
  const mine = m.from === ME;
  const press = useLongPress(() => onSelect(m, "longpress"), () => {});
  if (m.deletedForMe) return null;
  if (m.system) return <div className="wa-system" data-anchor={m.id}><span>{m.system}</span></div>;

  const reacts = Object.entries(m.reactions ?? {});
  const capture = (e) => { if (selecting) { e.preventDefault(); e.stopPropagation(); onSelect(m, "tap"); } };
  const group = conv.kind === "group" && !mine;
  const doc = m.doc ? world.documents[m.doc] : null;
  const place = m.location ? world.places[m.location.placeId] : null;
  const card = m.contact ? contact(world, m.contact.personId) : null;

  let body;
  if (m.deletedForEveryone) {
    body = <span className="wa-deleted"><Ban size={15} /> {mine ? "You deleted this message" : "This message was deleted"}</span>;
  } else if (m.call) {
    const Icon = m.call.status === "missed" ? PhoneMissed : m.call.type === "video" ? Video : Phone;
    body = <span className="wa-call-msg"><span className={m.call.status === "missed" ? "missed" : ""}><Icon size={20} /></span><span><strong>{m.call.status === "missed" ? `Missed ${m.call.type} call` : `${m.call.type === "video" ? "Video" : "Voice"} call`}</strong><small>{m.call.status === "missed" ? (mine ? "No answer" : "Tap to call back") : fmtDuration(m.call.duration)}</small></span></span>;
  } else {
    body = (
      <>
        {m.forwarded && <small className="wa-forwarded"><Forward size={12} /> Forwarded</small>}
        {m.statusRef && (
          <span className="wa-quote status">
            <span><strong>{contact(world, m.statusRef.author).name} · Status</strong><small>{m.statusRef.text ?? "Photo"}</small></span>
            {m.statusRef.src ? <img src={m.statusRef.src} alt="" /> : <i style={{ background: m.statusRef.bg }} />}
          </span>
        )}
        {m.replyTo && <Quote conv={conv} m={m} onJump={onJump} />}
        {m.image && (
          <button className="wa-img" onClick={(e) => { e.stopPropagation(); openViewer([m.image], 0, { convId: conv.id, msgId: m.id }); }} aria-label={`Open photo ${m.image.name ?? ""}`}>
            <img src={m.image.src} alt={m.image.alt} />
          </button>
        )}
        {doc && (
          <button className="wa-doc" onClick={(e) => { e.stopPropagation(); log("document_opened", { convId: conv.id, msgId: m.id, docId: doc.id, name: doc.name }); nav.push({ name: "doc", docId: doc.id }); }}>
            <span className="wa-doc-icon"><FileText size={26} /><small>PDF</small></span>
            <span><strong>{doc.name}</strong><small>{doc.pages.length} page · {doc.size} · PDF</small></span>
          </button>
        )}
        {place && (
          <button className="wa-loc" onClick={(e) => { e.stopPropagation(); log("location_opened", { convId: conv.id, msgId: m.id, placeId: place.id }); nav.push({ name: "map", placeId: place.id }); }}>
            <img src={place.image} alt="" />
            <span><MapPin size={16} /> <strong>{place.name}</strong><small>{place.address}</small></span>
          </button>
        )}
        {m.audio && <AudioPlayer audio={{ ...m.audio, from: m.from }} msgId={m.id} mine={mine} />}
        {m.poll && <PollView conv={conv} m={m} />}
        {m.text && <span className="wa-text">{m.text}</span>}
        {card && (
          <span className="wa-card">
            <span className="wa-card-top"><PersonAvatar id={card.id} /><span><strong>{card.name}</strong>{m.contact.label && <small>{m.contact.label}</small>}</span></span>
            <button onClick={(e) => { e.stopPropagation(); log("contact_card_message", { convId: conv.id, msgId: m.id, personId: card.id }); const dm = findDM(world, card.id); nav.push({ name: "chat", convId: dm?.id, personId: card.id }); }}>Message</button>
          </span>
        )}
      </>
    );
  }

  return (
    <div className={`wa-msg ${mine ? "mine" : ""} ${selected ? "selected" : ""} ${flash ? "flash" : ""}`} data-anchor={m.id} onClickCapture={capture}>
      <div className={`wa-bubble ${m.image && !m.text ? "media" : ""}`} {...press} aria-label="Message. Press and hold to select.">
        {group && <strong className="wa-sender" style={{ color: nameColor(m.from) }}>{contact(world, m.from).name}</strong>}
        {body}
        <span className="wa-meta">
          {m.starred && <Star size={11} fill="currentColor" aria-label="Starred" />}
          {m.edited && <span className="wa-edited"><Pencil size={10} /> Edited</span>}
          <time>{m.time}</time>
          {mine && !m.deletedForEveryone && <CheckCheck size={15} className="wa-ticks" aria-label="Read" />}
        </span>
      </div>
      {reacts.length > 0 && (
        <span className="wa-reacts" aria-label={`Reactions: ${reacts.map(([, e]) => e).join(" ")}`}>
          {[...new Set(reacts.map(([, e]) => e))].join("")}{reacts.length > 1 ? <small>{reacts.length}</small> : null}
        </span>
      )}
      {void CornerUpLeft}
    </div>
  );
}
