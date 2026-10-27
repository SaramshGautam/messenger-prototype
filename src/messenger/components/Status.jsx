import { useEffect, useRef, useState } from "react";
import { X, Send, ChevronLeft, ChevronRight, Plus, MoreVertical } from "lucide-react";
import { useM, PersonAvatar } from "../ui.jsx";
import { contact, findDM, uid } from "../store.js";

export function UpdatesTab() {
  const { world, openStatus, toast } = useM();
  const recent = world.statuses.filter((s) => !s.viewed);
  const viewed = world.statuses.filter((s) => s.viewed);
  const Row = ({ s }) => (
    <button className="wa-conv" onClick={() => openStatus(s.author)}>
      <span className={s.viewed ? "wa-status-ring viewed" : "wa-status-ring"}><PersonAvatar id={s.author} /></span>
      <span className="wa-conv-copy"><strong>{contact(world, s.author).name}</strong><small>{s.time}</small></span>
    </button>
  );
  return (
    <div className="wa-page">
      <div className="wa-top"><strong className="wa-brand">Updates</strong><span><button className="wa-icon" aria-label="More options"><MoreVertical size={22} /></button></span></div>
      <h3 className="wa-section big">Status</h3>
      <button className="wa-conv" onClick={() => toast("Posting a status isn’t part of this study")}>
        <span className="wa-avatar-check"><PersonAvatar id="me" /><i className="plus"><Plus size={12} /></i></span>
        <span className="wa-conv-copy"><strong>My status</strong><small>Tap to add status update</small></span>
      </button>
      {recent.length > 0 && <h3 className="wa-section">Recent updates</h3>}
      {recent.map((s) => <Row key={s.author} s={s} />)}
      {viewed.length > 0 && <h3 className="wa-section">Viewed updates</h3>}
      {viewed.map((s) => <Row key={s.author} s={s} />)}
    </div>
  );
}

const ITEM_MS = 6000;

export function StatusViewer({ author, onClose }) {
  const { world, act, log, toast } = useM();
  const s = world.statuses.find((x) => x.author === author);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reply, setReply] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const acc = useRef(0);
  const item = s.items[i];

  useEffect(() => { act({ type: "statusViewed", author }); }, []); // eslint-disable-line
  useEffect(() => { log("status_item_viewed", { author, itemId: item.id, index: i + 1, of: s.items.length }); acc.current = 0; setElapsed(0); }, [i]); // eslint-disable-line
  const go = (d, how) => {
    log("status_navigate", { author, from: i + 1, direction: d > 0 ? "next" : "previous", how });
    const k = i + d;
    if (k < 0) { acc.current = 0; setElapsed(0); return; }
    if (k >= s.items.length) { onClose(); return; }
    setI(k);
  };
  useEffect(() => {
    if (paused) return;
    const start = Date.now();
    const t = setInterval(() => {
      const e = acc.current + Date.now() - start;
      setElapsed(e);
      if (e >= ITEM_MS) { clearInterval(t); go(1, "auto"); }
    }, 100);
    return () => { clearInterval(t); acc.current += Date.now() - start; };
  }, [paused, i]); // eslint-disable-line

  const submit = (e) => {
    e.preventDefault();
    const v = reply.trim();
    if (!v) return;
    const dm = findDM(world, author);
    const id = uid("msg");
    act({ type: "send", convId: dm?.id, toPerson: dm ? undefined : author, statusReply: { author, itemId: item.id }, messages: [{ id, text: v, statusRef: { author, itemId: item.id, text: item.kind === "text" ? item.text : item.alt, src: item.src, bg: item.bg } }] });
    log("status_reply_sent", { author, itemId: item.id, msgId: id, text: v });
    setReply(""); setPaused(false);
    toast(`Reply sent to ${contact(world, author).name.split(" ")[0]}`);
  };

  return (
    <div className="wa-status" role="dialog" aria-label={`${contact(world, author).name}’s status`}>
      <div className="wa-status-bars">{s.items.map((it, k) => <span key={it.id}><i style={{ width: k < i ? "100%" : k === i ? `${Math.min(100, (elapsed / ITEM_MS) * 100)}%` : "0%" }} /></span>)}</div>
      <div className="wa-status-top">
        <button className="wa-icon" onClick={() => { log("status_closed", { author, itemId: item.id }); onClose(); }} aria-label="Close status"><X size={26} /></button>
        <PersonAvatar id={author} size="sm" />
        <span><strong>{contact(world, author).name}</strong><small>{s.time}</small></span>
        <button className="wa-icon" onClick={() => setPaused((p) => !p)} aria-label={paused ? "Play" : "Pause"}>{paused ? "▶" : "❚❚"}</button>
      </div>
      <div className="wa-status-stage">
        {item.kind === "image" ? <img src={item.src} alt={item.alt} /> : <div className="wa-status-text" style={{ background: item.bg }}><p>{item.text}</p></div>}
        <button className="wa-status-tap prev" onClick={() => go(-1, "tap")} aria-label="Previous"><ChevronLeft size={30} /></button>
        <button className="wa-status-tap next" onClick={() => go(1, "tap")} aria-label="Next"><ChevronRight size={30} /></button>
      </div>
      <form className="wa-status-reply" onSubmit={submit}>
        <input value={reply} onFocus={() => setPaused(true)} onBlur={() => !reply && setPaused(false)} onChange={(e) => setReply(e.target.value)} placeholder="Reply" aria-label={`Reply to ${contact(world, author).name}’s status`} />
        <button type="submit" className="wa-send" aria-label="Send reply" disabled={!reply.trim()}><Send size={20} /></button>
      </form>
    </div>
  );
}
