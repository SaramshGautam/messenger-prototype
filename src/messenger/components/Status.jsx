import { useEffect, useRef, useState } from "react";
import { X, Send, ChevronLeft, ChevronRight, Plus, MoreVertical, Camera, Eye, Trash2, Check } from "lucide-react";
import { useM, PersonAvatar, Sheet, SheetItem } from "../ui.jsx";
import { contact, findDM, uid, ME } from "../store.js";

export function UpdatesTab() {
  const { world, openStatus, log } = useM();
  const [creating, setCreating] = useState(false);
  const mine = world.myStatus;
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
      <div className="wa-conv wa-my-status">
        <button className="wa-my-status-open" onClick={() => (mine.length ? openStatus(ME) : setCreating(true))} aria-label={mine.length ? "View my status" : "Add status update"}>
          <span className={mine.length ? "wa-status-ring viewed" : "wa-avatar-check"}><PersonAvatar id="me" />{!mine.length && <i className="plus"><Plus size={12} /></i>}</span>
          <span className="wa-conv-copy"><strong>My status</strong><small>{mine.length ? `${mine.length} update${mine.length > 1 ? "s" : ""} · ${mine[mine.length - 1].time}` : "Tap to add status update"}</small></span>
        </button>
        <button className="wa-icon wa-add-status" onClick={() => { log("status_add_opened", {}); setCreating(true); }} aria-label="Add status"><Camera size={22} /></button>
      </div>
      {recent.length > 0 && <h3 className="wa-section">Recent updates</h3>}
      {recent.map((s) => <Row key={s.author} s={s} />)}
      {viewed.length > 0 && <h3 className="wa-section">Viewed updates</h3>}
      {viewed.map((s) => <Row key={s.author} s={s} />)}
      {creating && <StatusCreator onClose={() => setCreating(false)} />}
    </div>
  );
}

const ITEM_MS = 6000;

export function StatusViewer({ author, onClose }) {
  const { world, act, log, toast } = useM();
  const mine = author === ME;
  const s = mine ? { author: ME, time: world.myStatus[world.myStatus.length - 1]?.time ?? "", items: world.myStatus } : world.statuses.find((x) => x.author === author);
  const [menu, setMenu] = useState(false);
  const [viewers, setViewers] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reply, setReply] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const acc = useRef(0);
  const item = s.items[Math.min(i, s.items.length - 1)];
  const hold = menu || viewers || confirmDel;

  useEffect(() => { if (!mine) act({ type: "statusViewed", author }); }, []); // eslint-disable-line
  useEffect(() => { if (!s.items.length) onClose(); }, [s.items.length]); // eslint-disable-line
  useEffect(() => { if (item) log("status_item_viewed", { author, itemId: item.id, index: i + 1, of: s.items.length }); acc.current = 0; setElapsed(0); }, [i]); // eslint-disable-line
  const go = (d, how) => {
    log("status_navigate", { author, from: i + 1, direction: d > 0 ? "next" : "previous", how });
    const k = i + d;
    if (k < 0) { acc.current = 0; setElapsed(0); return; }
    if (k >= s.items.length) { onClose(); return; }
    setI(k);
  };
  useEffect(() => {
    if (paused || hold || !item) return;
    const start = Date.now();
    const t = setInterval(() => {
      const e = acc.current + Date.now() - start;
      setElapsed(e);
      if (e >= ITEM_MS) { clearInterval(t); go(1, "auto"); }
    }, 100);
    return () => { clearInterval(t); acc.current += Date.now() - start; };
  }, [paused, hold, i]); // eslint-disable-line
  if (!item) return null;

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
        <span><strong>{mine ? "My status" : contact(world, author).name}</strong><small>{mine ? item.time : s.time}</small></span>
        <button className="wa-icon" onClick={() => setPaused((p) => !p)} aria-label={paused ? "Play" : "Pause"}>{paused ? "▶" : "❚❚"}</button>
        {mine && <button className="wa-icon" onClick={() => { setMenu(true); log("my_status_menu_opened", { itemId: item.id }); }} aria-label="More options"><MoreVertical size={22} /></button>}
      </div>
      <div className="wa-status-stage">
        {item.kind === "image" ? <img src={item.src} alt={item.alt} /> : <div className="wa-status-text" style={{ background: item.bg }}><p>{item.text}</p></div>}
        <button className="wa-status-tap prev" onClick={() => go(-1, "tap")} aria-label="Previous"><ChevronLeft size={30} /></button>
        <button className="wa-status-tap next" onClick={() => go(1, "tap")} aria-label="Next"><ChevronRight size={30} /></button>
      </div>
      {mine ? (
        <button className="wa-status-seen" onClick={() => { setViewers(true); log("status_viewers_opened", { itemId: item.id, count: (item.viewers ?? []).length }); }} aria-label={`Seen by ${(item.viewers ?? []).length}`}>
          <Eye size={20} /> {(item.viewers ?? []).length}
        </button>
      ) : (
      <form className="wa-status-reply" onSubmit={submit}>
          <input value={reply} onFocus={() => setPaused(true)} onBlur={() => !reply && setPaused(false)} onChange={(e) => setReply(e.target.value)} placeholder="Reply" aria-label={`Reply to ${contact(world, author).name}’s status`} />
          <button type="submit" className="wa-send" aria-label="Send reply" disabled={!reply.trim()}><Send size={20} /></button>
        </form>
      )}
      {menu && (
        <Sheet onClose={() => setMenu(false)}>
          <SheetItem icon={Send} label="Forward" onClick={() => { setMenu(false); toast("Forwarding a status isn’t part of this study"); }} />
          <SheetItem icon={Trash2} label="Delete" danger onClick={() => { setMenu(false); log("my_status_delete_opened", { itemId: item.id }); setConfirmDel(true); }} />
        </Sheet>
      )}
      {viewers && (
        <Sheet title={`Viewed by ${(item.viewers ?? []).length}`} onClose={() => setViewers(false)}>
          {(item.viewers ?? []).map(([id, t]) => (
            <div key={id} className="wa-conv static"><PersonAvatar id={id} /><span className="wa-conv-copy"><strong>{contact(world, id).name}</strong><small>Today, {t}</small></span></div>
          ))}
          {!(item.viewers ?? []).length && <p className="wa-note">No views yet</p>}
        </Sheet>
      )}
      {confirmDel && (
        <div className="wa-dialog-backdrop" onClick={() => setConfirmDel(false)}>
          <div className="wa-dialog" role="alertdialog" aria-label="Delete status" onClick={(e) => e.stopPropagation()}>
            <p>Delete this status update? It will also be deleted for everyone who received it.</p>
            <button onClick={() => { log("my_status_delete_cancelled", { itemId: item.id }); setConfirmDel(false); }}>Cancel</button>
            <button className="danger" onClick={() => { act({ type: "deleteStatus", id: item.id }); log("my_status_deleted", { itemId: item.id }); toast("Status deleted"); setConfirmDel(false); setI(0); }}>Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Add a photo status from the study phone's gallery.
export function StatusCreator({ onClose }) {
  const { world, act, log, toast } = useM();
  const [pick, setPick] = useState(null);
  if (!pick)
    return (
      <div className="wa-modal" role="dialog" aria-label="Add status">
        <div className="wa-head"><button className="wa-icon" onClick={onClose} aria-label="Close"><X size={24} /></button><span className="wa-head-title"><strong>Add status</strong><small>Choose a photo</small></span><span className="wa-head-right" /></div>
        <div className="wa-gallery">
          {world.gallery.map((g) => (
            <button key={g.id} onClick={() => { setPick(g); log("status_photo_selected", { galleryId: g.id, photo: g.title }); }} aria-label={g.title}><img src={g.src} alt={g.title} /><span className="wa-gallery-name">{g.title}</span></button>
          ))}
        </div>
      </div>
    );
  const post = () => {
    const id = uid("mys");
    act({ type: "addStatus", id, src: pick.src, alt: pick.title, galleryId: pick.id });
    log("status_posted", { statusId: id, galleryId: pick.id, photo: pick.title });
    toast("Status posted");
    onClose();
  };
  return (
    <div className="wa-status creator" role="dialog" aria-label="Status preview">
      <div className="wa-status-top">
        <button className="wa-icon" onClick={() => setPick(null)} aria-label="Back"><ChevronLeft size={26} /></button>
        <span><strong>Preview</strong><small>{pick.title}</small></span>
      </div>
      <div className="wa-status-stage"><img src={pick.src} alt={pick.title} /></div>
      <div className="wa-status-reply"><span className="wa-status-to">Status (My contacts)</span>
        <button className="wa-send" onClick={post} aria-label="Post status"><Send size={20} /></button></div>
    </div>
  );
}
void Check;
