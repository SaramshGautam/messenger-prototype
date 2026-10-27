import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ChevronLeft, Video, Phone, MoreVertical, Paperclip, Camera, Send, Mic, X, Reply, Star, StarOff, Trash2, Forward, Copy, Pin, PinOff,
  Pencil, Search, Ban, Archive, ArchiveRestore, UserPlus, Square, Check, Info, ChevronUp, ChevronDown,
} from "lucide-react";
import { useM, ConvAvatar, Sheet, SheetItem, copyText, fmtDuration } from "../ui.jsx";
import Bubble, { nameColor, AudioPlayer } from "./Bubble.jsx";
import { AttachSheet } from "./Pickers.jsx";
import { contact, convTitle, msgSummary, findDM, uid, ME, QUICK_REACTIONS } from "../store.js";

export function ChatView({ route }) {
  const { world, act, nav, log, toast, startCall, openForward } = useM();
  const existing = route.convId ? world.conversations[route.convId] : findDM(world, route.personId);
  const conv = existing ?? { id: null, kind: "dm", with: route.personId, messages: [] };
  const title = convTitle(world, conv);
  const newConvId = useRef(uid("dm"));
  const [text, setText] = useState("");
  const [sel, setSel] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [editing, setEditing] = useState(null);
  const [menu, setMenu] = useState(false);
  const [moreMenu, setMoreMenu] = useState(false);
  const [confirm, setConfirm] = useState(null); // "delete" | "block"
  const [attach, setAttach] = useState(false);
  const [flash, setFlash] = useState(route.focusMsgId ?? null);
  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState("");
  const [hit, setHit] = useState(0);
  const [rec, setRec] = useState(null);
  const ignoreTap = useRef(0);
  const thread = useRef(null);
  const input = useRef(null);
  const media = useRef(null);

  const isGroup = conv.kind === "group";
  const other = !isGroup ? contact(world, conv.with) : null;
  const iAmMember = !isGroup || conv.members.includes(ME);
  const selMsgs = conv.messages.filter((m) => sel.includes(m.id));
  const single = selMsgs.length === 1 ? selMsgs[0] : null;
  const pinned = conv.messages.filter((m) => m.pinned && !m.deletedForEveryone && !m.deletedForMe);

  // Open at the bottom (or the focused message).
  useLayoutEffect(() => {
    const el = thread.current;
    if (!el) return;
    if (route.focusMsgId) {
      const t = el.querySelector(`[data-anchor="${route.focusMsgId}"]`);
      t?.scrollIntoView({ block: "center" });
      setTimeout(() => setFlash(null), 2400);
    } else el.scrollTop = el.scrollHeight;
  }, []); // eslint-disable-line
  const count = conv.messages.length;
  const prev = useRef(count);
  useEffect(() => {
    if (count > prev.current && thread.current) thread.current.scrollTop = thread.current.scrollHeight;
    prev.current = count;
    if (conv.id) act({ type: "markRead", convId: conv.id });
  }, [count]); // eslint-disable-line

  const jump = (id) => {
    log("jump_to_message", { convId: conv.id, msgId: id });
    const t = thread.current?.querySelector(`[data-anchor="${id}"]`);
    t?.scrollIntoView({ block: "center", behavior: "smooth" });
    setFlash(id);
    setTimeout(() => setFlash(null), 2200);
  };

  const send = (messages, logType = "message_sent", extra = {}) => {
    const ms = messages.map((m) => ({ id: uid("msg"), ...m }));
    act({ type: "send", convId: existing?.id, toPerson: existing ? undefined : route.personId, newConvId: newConvId.current, messages: ms, ...extra.actionExtra });
    for (const m of ms)
      log(logType, {
        convId: existing?.id ?? newConvId.current, to: title, msgId: m.id, text: m.text ?? null,
        replyTo: m.replyTo ?? null, replyToText: m.replyTo ? msgSummary(world, conv.messages.find((x) => x.id === m.replyTo)) : null,
        kind: m.image ? "photo" : m.doc ? "document" : m.location ? "location" : m.contact ? "contact" : m.audio ? "voice" : "text",
        ...extra.log,
      });
  };

  const submit = (e) => {
    e?.preventDefault();
    const v = text.trim();
    if (!v) return;
    if (editing) {
      act({ type: "edit", convId: conv.id, msgId: editing.id, text: v });
      log("message_edited", { convId: conv.id, msgId: editing.id, previousText: editing.text, text: v });
      setEditing(null); setText(""); toast("Message edited");
      return;
    }
    send([{ text: v, replyTo: replyTo?.id }]);
    setText(""); setReplyTo(null);
  };

  // ---------- selection ----------
  const onSelect = (m, how) => {
    if (m.system || m.deletedForEveryone) return;
    if (how === "longpress") {
      ignoreTap.current = Date.now() + 700;
      setSel((s) => (s.includes(m.id) ? s : [...s, m.id]));
      log("message_selected", { convId: conv.id, msgId: m.id, via: how });
      return;
    }
    if (Date.now() < ignoreTap.current) return;
    setSel((s) => (s.includes(m.id) ? s.filter((x) => x !== m.id) : [...s, m.id]));
    log("message_selection_toggled", { convId: conv.id, msgId: m.id });
  };
  const clearSel = () => setSel([]);
  const allStarred = selMsgs.length > 0 && selMsgs.every((m) => m.starred);
  const canDeleteForEveryone = selMsgs.length > 0 && selMsgs.every((m) => m.from === ME && !m.call);
  const canEdit = single && single.from === ME && single.text && !single.call && !single.poll;

  const doAction = (kind) => {
    const ids = [...sel];
    log("selection_action", { action: kind, convId: conv.id, msgIds: ids });
    if (kind === "reply") { setReplyTo(single); setEditing(null); clearSel(); setTimeout(() => input.current?.focus(), 0); }
    if (kind === "star") { act({ type: "star", convId: conv.id, msgIds: ids, on: !allStarred }); log(allStarred ? "messages_unstarred" : "messages_starred", { convId: conv.id, msgIds: ids }); toast(allStarred ? "Unstarred" : "Starred"); clearSel(); }
    if (kind === "copy") { copyText(selMsgs.map((m) => m.text ?? "").join("\n")); log("messages_copied", { convId: conv.id, msgIds: ids, text: selMsgs.map((m) => m.text ?? "").join("\n") }); toast("Message copied"); clearSel(); }
    if (kind === "forward") { openForward({ convId: conv.id, msgIds: ids }); clearSel(); }
    if (kind === "delete") setConfirm("delete");
    if (kind === "pin") { act({ type: "pin", convId: conv.id, msgId: single.id, on: !single.pinned }); log(single.pinned ? "message_unpinned" : "message_pinned", { convId: conv.id, msgId: single.id }); toast(single.pinned ? "Unpinned" : "Pinned"); clearSel(); setMoreMenu(false); }
    if (kind === "edit") { setEditing(single); setReplyTo(null); setText(single.text); clearSel(); setMoreMenu(false); setTimeout(() => input.current?.focus(), 0); }
  };
  const react = (emoji) => {
    const prevR = single.reactions?.[ME] ?? null;
    act({ type: "react", convId: conv.id, msgId: single.id, emoji });
    log(prevR === emoji ? "reaction_removed" : prevR ? "reaction_changed" : "reaction_added", { convId: conv.id, msgId: single.id, reaction: emoji, previous: prevR, messageText: single.text ?? null });
    clearSel();
  };
  const doDelete = (forEveryone) => {
    act({ type: "delete", convId: conv.id, msgIds: sel, forEveryone });
    log(forEveryone ? "deleted_for_everyone" : "deleted_for_me", { convId: conv.id, msgIds: sel, items: selMsgs.map((m) => msgSummary(world, m)) });
    toast(forEveryone ? "Message deleted for everyone" : "Message deleted for you");
    setConfirm(null); clearSel();
  };

  // ---------- voice ----------
  const [, tick] = useState(0);
  useEffect(() => { if (rec?.state !== "recording") return; const t = setInterval(() => tick((n) => n + 1), 500); return () => clearInterval(t); }, [rec?.state]);
  const startRec = async () => {
    log("voice_record_started", { convId: conv.id });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      const chunks = [];
      mr.ondataavailable = (ev) => chunks.push(ev.data);
      mr.onstop = () => { stream.getTracks().forEach((t) => t.stop()); setRec((r) => ({ ...r, state: "preview", src: URL.createObjectURL(new Blob(chunks, { type: mr.mimeType })) })); };
      mr.start(); media.current = mr;
      setRec({ state: "recording", start: Date.now(), simulated: false });
    } catch {
      media.current = null;
      setRec({ state: "recording", start: Date.now(), simulated: true });
    }
  };
  const stopRec = () => {
    const duration = Math.max(1, Math.round((Date.now() - rec.start) / 1000));
    log("voice_record_stopped", { convId: conv.id, duration, simulated: rec.simulated });
    if (media.current?.state === "recording") { setRec((r) => ({ ...r, duration })); media.current.stop(); } else setRec((r) => ({ ...r, state: "preview", duration }));
  };
  // The recording itself stays on the study phone; only its length goes in the log.
  const sendRec = () => { send([{ audio: { duration: rec.duration, src: rec.src, simulated: rec.simulated } }], "voice_message_sent", { log: { duration: rec.duration } }); setRec(null); };

  // ---------- search in chat ----------
  const hits = q.trim() ? conv.messages.filter((m) => !m.deletedForMe && msgSummary(world, m).toLowerCase().includes(q.toLowerCase())).map((m) => m.id).reverse() : [];
  useEffect(() => { if (hits.length) jump(hits[Math.min(hit, hits.length - 1)]); }, [q, hit]); // eslint-disable-line

  const call = (type) => { if (isGroup) { toast("Group calls aren’t available in the study app"); return; } log("call_button", { type, personId: conv.with }); startCall(conv.with, type); };

  let lastDay = null;
  return (
    <div className="wa-chat">
      {sel.length > 0 ? (
        <div className="wa-head select">
          <button className="wa-icon" onClick={clearSel} aria-label="Cancel selection"><X size={24} /></button>
          <span className="wa-head-title"><strong>{sel.length}</strong></span>
          <span className="wa-head-right">
            {single && iAmMember && !conv.blocked && <button className="wa-icon" onClick={() => doAction("reply")} aria-label="Reply"><Reply size={22} /></button>}
            <button className="wa-icon" onClick={() => doAction("star")} aria-label={allStarred ? "Unstar" : "Star"}>{allStarred ? <StarOff size={22} /> : <Star size={22} />}</button>
            <button className="wa-icon" onClick={() => doAction("delete")} aria-label="Delete"><Trash2 size={22} /></button>
            {selMsgs.some((m) => m.text) && <button className="wa-icon" onClick={() => doAction("copy")} aria-label="Copy"><Copy size={21} /></button>}
            <button className="wa-icon" onClick={() => doAction("forward")} aria-label="Forward"><Forward size={22} /></button>
            {single && <button className="wa-icon" onClick={() => setMoreMenu(true)} aria-label="More"><MoreVertical size={22} /></button>}
          </span>
        </div>
      ) : searching ? (
        <div className="wa-head">
          <button className="wa-icon" onClick={() => { setSearching(false); setQ(""); }} aria-label="Close search"><ChevronLeft size={26} /></button>
          <input className="wa-head-input" autoFocus value={q} onChange={(e) => { setQ(e.target.value); setHit(0); }} placeholder="Search…" aria-label={`Search in ${title}`} onBlur={() => q && log("chat_inner_search", { convId: conv.id, q })} />
          <span className="wa-head-right">
            <small>{hits.length ? `${Math.min(hit, hits.length - 1) + 1}/${hits.length}` : q ? "0" : ""}</small>
            <button className="wa-icon" aria-label="Older result" onClick={() => setHit((h) => Math.min(h + 1, hits.length - 1))}><ChevronUp size={22} /></button>
            <button className="wa-icon" aria-label="Newer result" onClick={() => setHit((h) => Math.max(h - 1, 0))}><ChevronDown size={22} /></button>
          </span>
        </div>
      ) : (
        <div className="wa-head">
          <button className="wa-icon" onClick={nav.back} aria-label="Back"><ChevronLeft size={26} /></button>
          <button className="wa-chat-who" onClick={() => conv.id && nav.push(isGroup ? { name: "group", convId: conv.id } : { name: "contact", personId: conv.with, convId: conv.id })}>
            <ConvAvatar conv={conv} size="sm" />
            <span><strong>{title}</strong><small>{isGroup ? conv.members.map((id) => (id === ME ? "You" : contact(world, id).name.split(" ")[0])).join(", ") : other.unsaved ? "Not a contact" : "tap here for contact info"}</small></span>
          </button>
          <span className="wa-head-right">
            <button className="wa-icon" aria-label="Video call" onClick={() => call("video")}><Video size={23} /></button>
            <button className="wa-icon" aria-label="Voice call" onClick={() => call("voice")}><Phone size={21} /></button>
            <button className="wa-icon" aria-label="More options" onClick={() => setMenu(true)}><MoreVertical size={22} /></button>
          </span>
        </div>
      )}

      {sel.length === 1 && !single?.call && (
        <div className="wa-react-bar" role="group" aria-label="React to message">
          {QUICK_REACTIONS.map((e) => <button key={e} className={single?.reactions?.[ME] === e ? "on" : ""} onClick={() => react(e)} aria-label={`React ${e}`}>{e}</button>)}
        </div>
      )}

      {pinned.length > 0 && sel.length === 0 && (
        <button className="wa-pinned" onClick={() => { log("pinned_opened", { convId: conv.id, msgId: pinned[pinned.length - 1].id }); jump(pinned[pinned.length - 1].id); }}>
          <Pin size={15} /><span><strong style={{ color: nameColor(pinned[pinned.length - 1].from) }}>{pinned[pinned.length - 1].from === ME ? "You" : contact(world, pinned[pinned.length - 1].from).name}</strong><small>{msgSummary(world, pinned[pinned.length - 1])}</small></span>
        </button>
      )}

      {other?.unsaved && !conv.blocked && (
        <div className="wa-unknown-banner">
          <p><strong>{other.phone}</strong> · ~{other.profileName}<br /><small>Not a contact · No groups in common</small></p>
          <div>
            <button onClick={() => { log("block_opened", { convId: conv.id, via: "banner" }); setConfirm("block"); }}><Ban size={16} /> Block</button>
            <button onClick={() => toast("Adding contacts isn’t available in the study app")}><UserPlus size={16} /> Add</button>
          </div>
        </div>
      )}

      <div className="wa-thread" ref={thread}>
        <p className="wa-e2e">🔒 Messages are only for the study. Everyone here is fictional.</p>
        {conv.messages.map((m) => {
          if (m.deletedForMe) return null;
          const sep = m.day !== lastDay ? <div className="wa-day" key={`d-${m.id}`}><span>{m.day}</span></div> : null;
          lastDay = m.day;
          return [sep, <Bubble key={m.id} conv={conv} m={m} selected={sel.includes(m.id)} selecting={sel.length > 0} onSelect={onSelect} onJump={jump} flash={flash === m.id} />];
        })}
      </div>

      {conv.blocked ? (
        <button className="wa-blocked-bar" onClick={() => { act({ type: "block", convId: conv.id, on: false }); log("contact_unblocked", { convId: conv.id, via: "composer" }); toast(`${title} unblocked`); }}>
          You blocked this contact. Tap to unblock.
        </button>
      ) : !iAmMember ? (
        <p className="wa-blocked-bar">You can’t send messages to this group because you’re no longer a member.</p>
      ) : (
        <div className="wa-composer">
          {(replyTo || editing) && (
            <div className="wa-compose-bar">
              <span>
                <strong style={{ color: editing ? "#1fa855" : replyTo.from === ME ? "#1fa855" : nameColor(replyTo.from) }}>{editing ? "Edit message" : replyTo.from === ME ? "You" : contact(world, replyTo.from).name}</strong>
                <small>{editing ? editing.text : msgSummary(world, replyTo)}</small>
              </span>
              <button className="wa-icon" aria-label={editing ? "Cancel edit" : "Cancel reply"} onClick={() => { if (editing) { setEditing(null); setText(""); } setReplyTo(null); }}><X size={18} /></button>
            </div>
          )}
          {rec ? (
            <div className="wa-rec">
              <button className="wa-icon" onClick={() => { log("voice_discarded", { convId: conv.id }); setRec(null); }} aria-label="Delete recording"><Trash2 size={22} /></button>
              {rec.state === "recording" ? (
                <>
                  <span className="wa-rec-live"><i /> {fmtDuration((Date.now() - rec.start) / 1000)} {rec.simulated ? "(simulated)" : "Recording…"}</span>
                  <button className="wa-send" onClick={stopRec} aria-label="Stop recording"><Square size={18} fill="#fff" /></button>
                </>
              ) : (
                <>
                  <span className="wa-rec-preview">{rec.src ? <AudioPlayer audio={{ src: rec.src, duration: rec.duration }} msgId="preview" mine /> : `Voice message · ${fmtDuration(rec.duration)}`}</span>
                  <button className="wa-send" onClick={sendRec} aria-label="Send voice message"><Send size={20} /></button>
                </>
              )}
            </div>
          ) : (
            <form className="wa-compose-row" onSubmit={submit}>
              <span className="wa-input">
                <input ref={input} value={text} onChange={(e) => setText(e.target.value)} placeholder={editing ? "Edit message" : "Message"} aria-label={editing ? "Edit message" : "Message"} />
                {!editing && <button type="button" className="wa-icon" aria-label="Attach" onClick={() => { setAttach(true); log("attach_opened", { convId: conv.id }); }}><Paperclip size={21} /></button>}
                {!editing && !text && <button type="button" className="wa-icon" aria-label="Camera" onClick={() => toast("The camera isn’t used in this study")}><Camera size={21} /></button>}
              </span>
              {editing ? (
                <button type="submit" className="wa-send" aria-label="Save edit"><Check size={22} /></button>
              ) : text.trim() ? (
                <button type="submit" className="wa-send" aria-label="Send"><Send size={20} /></button>
              ) : (
                <button type="button" className="wa-send" aria-label="Record voice message" onClick={startRec}><Mic size={21} /></button>
              )}
            </form>
          )}
        </div>
      )}

      {attach && (
        <AttachSheet conv={conv} isGroup={isGroup} onClose={() => setAttach(false)} onSend={(msgs, kind, extra) => { setAttach(false); send(msgs.map((m, i) => (i === 0 && replyTo ? { ...m, replyTo: replyTo.id } : m)), kind, extra); setReplyTo(null); }} />
      )}

      {menu && (
        <Sheet onClose={() => setMenu(false)}>
          <SheetItem icon={Info} label={isGroup ? "Group info" : "View contact"} onClick={() => { setMenu(false); conv.id && nav.push(isGroup ? { name: "group", convId: conv.id } : { name: "contact", personId: conv.with, convId: conv.id }); }} />
          <SheetItem icon={Search} label="Search" onClick={() => { setMenu(false); setSearching(true); log("chat_inner_search_opened", { convId: conv.id }); }} />
          {conv.id && <SheetItem icon={conv.archived ? ArchiveRestore : Archive} label={conv.archived ? "Unarchive chat" : "Archive chat"} onClick={() => { act({ type: "archive", convId: conv.id, on: !conv.archived }); log(conv.archived ? "chat_unarchived" : "chat_archived", { convId: conv.id }); toast(conv.archived ? "Chat unarchived" : "Chat archived"); setMenu(false); }} />}
          {!isGroup && conv.id && (
            conv.blocked
              ? <SheetItem icon={Ban} label="Unblock" onClick={() => { act({ type: "block", convId: conv.id, on: false }); log("contact_unblocked", { convId: conv.id }); setMenu(false); }} />
              : <SheetItem icon={Ban} label="Block" danger onClick={() => { setMenu(false); log("block_opened", { convId: conv.id, via: "menu" }); setConfirm("block"); }} />
          )}
        </Sheet>
      )}
      {moreMenu && single && (
        <Sheet onClose={() => setMoreMenu(false)}>
          <SheetItem icon={single.pinned ? PinOff : Pin} label={single.pinned ? "Unpin" : "Pin"} onClick={() => doAction("pin")} />
          {canEdit && <SheetItem icon={Pencil} label="Edit" onClick={() => doAction("edit")} />}
          <SheetItem icon={Info} label="Info" sub={`Sent ${single.day}, ${single.time}`} onClick={() => setMoreMenu(false)} />
        </Sheet>
      )}
      {confirm === "delete" && (
        <div className="wa-dialog-backdrop" onClick={() => setConfirm(null)}>
          <div className="wa-dialog" role="alertdialog" aria-label="Delete message" onClick={(e) => e.stopPropagation()}>
            <p>Delete {sel.length > 1 ? `${sel.length} messages` : "message"}?</p>
            {canDeleteForEveryone && <button onClick={() => doDelete(true)}>Delete for everyone</button>}
            <button onClick={() => doDelete(false)}>Delete for me</button>
            <button onClick={() => { log("delete_cancelled", { convId: conv.id }); setConfirm(null); }}>Cancel</button>
          </div>
        </div>
      )}
      {confirm === "block" && (
        <div className="wa-dialog-backdrop" onClick={() => setConfirm(null)}>
          <div className="wa-dialog" role="alertdialog" aria-label={`Block ${title}`} onClick={(e) => e.stopPropagation()}>
            <p><strong>Block {other?.unsaved ? other.phone : title}?</strong><br /><small>Blocked contacts will no longer be able to call you or send you messages. This contact will not be notified.</small></p>
            <button className="danger" onClick={() => { act({ type: "block", convId: conv.id, on: true }); log("contact_blocked", { convId: conv.id, personId: conv.with, name: title }); toast(`${other?.unsaved ? other.phone : title} blocked`); setConfirm(null); }}>Block</button>
            <button onClick={() => { log("block_cancelled", { convId: conv.id }); setConfirm(null); }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
