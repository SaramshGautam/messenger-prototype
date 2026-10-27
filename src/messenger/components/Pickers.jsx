import { useMemo, useRef, useState } from "react";
import { FileText, Image as ImageIcon, Camera, MapPin, User, X, Send, Search, Check, ChevronLeft, Navigation, Smartphone } from "lucide-react";
import { useM, PersonAvatar, ConvAvatar } from "../ui.jsx";
import { contact, convTitle, savedContacts, findDM, msgSummary, uid, ME } from "../store.js";

function Modal({ title, onClose, onBack, children, right }) {
  return (
    <div className="wa-modal" role="dialog" aria-label={title}>
      <div className="wa-head">
        <button className="wa-icon" onClick={onBack ?? onClose} aria-label={onBack ? "Back" : "Close"}>{onBack ? <ChevronLeft size={26} /> : <X size={24} />}</button>
        <span className="wa-head-title"><strong>{title}</strong></span>
        <span className="wa-head-right">{right}</span>
      </div>
      {children}
    </div>
  );
}

// ---------- Gallery (study phone photos + the real phone's photo picker) ----------
function GalleryPicker({ onBack, onSend }) {
  const { world, log, act } = useM();
  const [sel, setSel] = useState([]);
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState(false);
  const fileRef = useRef(null);
  const chosen = world.gallery.filter((g) => sel.includes(g.id));
  const pickNative = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const item = { id: uid("dev"), title: f.name || "Photo from phone", src: URL.createObjectURL(f), device: true };
    act({ type: "addGallery", item });
    log("device_photo_picked", { name: f.name, size: f.size, type: f.type, lastModified: f.lastModified });
    setSel([item.id]);
    setPreview(true);
  };
  if (preview && chosen.length)
    return (
      <Modal title={chosen.length > 1 ? `${chosen.length} photos` : chosen[0].title} onBack={() => setPreview(false)}>
        <div className="wa-preview"><img src={chosen[0].src} alt={chosen[0].title} /></div>
        {chosen.length > 1 && <div className="wa-preview-strip">{chosen.map((g) => <img key={g.id} src={g.src} alt={g.title} />)}</div>}
        <div className="wa-caption-row">
          <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Add a caption…" aria-label="Add a caption" />
          <button className="wa-send" aria-label="Send" onClick={() => {
            const msgs = chosen.map((g, i) => ({ image: { src: g.src, alt: g.title, name: g.title, galleryId: g.id }, text: i === 0 && caption.trim() ? caption.trim() : undefined }));
            onSend(msgs, "photo_sent", { log: { photos: chosen.map((g) => g.title), galleryIds: chosen.map((g) => g.id), caption: caption.trim() || null } });
          }}><Send size={20} /></button>
        </div>
      </Modal>
    );
  return (
    <Modal title="Gallery" onBack={onBack} right={<button className="wa-text-btn" disabled={!sel.length} onClick={() => { setPreview(true); log("gallery_selected", { galleryIds: sel, titles: chosen.map((g) => g.title) }); }}>Next{sel.length ? ` (${sel.length})` : ""}</button>}>
      <button className="wa-device-photos" onClick={() => { log("device_photo_picker_opened"); fileRef.current?.click(); }}>
        <Smartphone size={20} /> <span><strong>All photos on this phone</strong><small>Includes screenshots you take</small></span>
      </button>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickNative} />
      <p className="wa-sub">Recent</p>
      <div className="wa-gallery">
        {world.gallery.map((g) => {
          const k = sel.indexOf(g.id);
          return (
            <button key={g.id} className={k >= 0 ? "on" : ""} aria-pressed={k >= 0} aria-label={g.title} onClick={() => setSel((s) => (k >= 0 ? s.filter((x) => x !== g.id) : [...s, g.id]))}>
              <img src={g.src} alt={g.title} /><span className="wa-gallery-name">{g.title}</span>{k >= 0 && <i>{k + 1}</i>}
            </button>
          );
        })}
      </div>
    </Modal>
  );
}

function DocPicker({ onBack, onSend }) {
  const { world, log } = useM();
  const [pick, setPick] = useState(null);
  if (pick) {
    const d = world.documents[pick];
    return (
      <Modal title="Send document" onBack={() => setPick(null)}>
        <div className="wa-doc-preview"><FileText size={56} /><strong>{d.name}</strong><small>{d.pages.length} page · {d.size}</small>
          <div className="wa-doc-page">{d.pages[0].map((l, i) => <p key={i}>{l || " "}</p>)}</div></div>
        <div className="wa-caption-row"><span /><button className="wa-send" aria-label="Send" onClick={() => onSend([{ doc: d.id }], "document_sent", { log: { docId: d.id, name: d.name } })}><Send size={20} /></button></div>
      </Modal>
    );
  }
  return (
    <Modal title="Files" onBack={onBack}>
      <p className="wa-sub">Documents on this phone</p>
      {world.deviceFiles.map((id) => {
        const d = world.documents[id];
        return (
          <button key={id} className="wa-conv" onClick={() => { setPick(id); log("document_selected", { docId: id, name: d.name }); }}>
            <span className="wa-doc-icon small"><FileText size={22} /></span>
            <span className="wa-conv-copy"><strong>{d.name}</strong><small>{d.size} · PDF</small></span>
          </button>
        );
      })}
    </Modal>
  );
}

function LocationPicker({ onBack, onSend }) {
  const { world, log } = useM();
  const [q, setQ] = useState("");
  const list = Object.values(world.places).filter((p) => `${p.name} ${p.address}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <Modal title="Send location" onBack={onBack}>
      <div className="wa-map-hero"><img src={world.places.river_park.image} alt="Map" /></div>
      <label className="wa-search"><Search size={18} /><input value={q} onChange={(e) => setQ(e.target.value)} onBlur={() => q && log("location_search", { q })} placeholder="Search places" aria-label="Search places" /></label>
      <button className="wa-conv" onClick={() => onSend([{ location: { placeId: "community_center", current: true } }], "location_sent", { log: { placeId: "community_center", current: true } })}>
        <span className="wa-round-icon green"><Navigation size={20} /></span>
        <span className="wa-conv-copy"><strong>Send your current location</strong><small>Study location: Community Center</small></span>
      </button>
      <p className="wa-sub">Nearby places</p>
      {list.map((p) => (
        <button key={p.id} className="wa-conv" onClick={() => onSend([{ location: { placeId: p.id } }], "location_sent", { log: { placeId: p.id, name: p.name, address: p.address } })}>
          <span className="wa-round-icon"><MapPin size={20} /></span>
          <span className="wa-conv-copy"><strong>{p.name}</strong><small>{p.address}</small></span>
        </button>
      ))}
    </Modal>
  );
}

function ContactPicker({ onBack, onSend }) {
  const { world } = useM();
  const [q, setQ] = useState("");
  const list = savedContacts(world).filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <Modal title="Share contact" onBack={onBack}>
      <label className="wa-search"><Search size={18} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search contacts" /></label>
      {list.map((p) => (
        <button key={p.id} className="wa-conv" onClick={() => onSend([{ contact: { personId: p.id } }], "contact_sent", { log: { personId: p.id, name: p.name } })}>
          <PersonAvatar id={p.id} /><span className="wa-conv-copy"><strong>{p.name}</strong><small>{p.phone}</small></span>
        </button>
      ))}
    </Modal>
  );
}

const OPTIONS = [
  { id: "document", label: "Document", icon: FileText, color: "#7f66ff" },
  { id: "gallery", label: "Gallery", icon: ImageIcon, color: "#007bfc" },
  { id: "camera", label: "Camera", icon: Camera, color: "#ff2e74" },
  { id: "location", label: "Location", icon: MapPin, color: "#1fa855" },
  { id: "contact", label: "Contact", icon: User, color: "#009de2" },
];

export function AttachSheet({ onClose, onSend }) {
  const { log, toast } = useM();
  const [view, setView] = useState(null);
  const done = (msgs, kind, extra) => { onSend(msgs, kind, extra); };
  if (view === "gallery") return <GalleryPicker onBack={() => setView(null)} onSend={done} />;
  if (view === "document") return <DocPicker onBack={() => setView(null)} onSend={done} />;
  if (view === "location") return <LocationPicker onBack={() => setView(null)} onSend={done} />;
  if (view === "contact") return <ContactPicker onBack={() => setView(null)} onSend={done} />;
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="wa-attach" role="dialog" aria-label="Attach" onClick={(e) => e.stopPropagation()}>
        {OPTIONS.map(({ id, label, icon: Icon, color }) => (
          <button key={id} onClick={() => { log("attach_option", { option: id }); if (id === "camera") { toast("The camera isn’t used in this study"); return; } setView(id); }}>
            <span style={{ background: color }}><Icon size={24} /></span>{label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- Forward ----------
export function ForwardSheet({ req, onClose }) {
  const { world, act, log, toast } = useM();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState([]);
  const [note, setNote] = useState("");
  const src = world.conversations[req.convId];
  const items = src.messages.filter((m) => req.msgIds.includes(m.id));
  const targets = useMemo(() => {
    const chats = world.convOrder.map((id) => world.conversations[id]).filter((c) => !c.blocked && (c.kind === "dm" ? !world.contacts[c.with]?.unsaved : c.members.includes(ME)));
    const others = savedContacts(world).filter((p) => !findDM(world, p.id)).map((p) => ({ id: `new:${p.id}`, kind: "dm", with: p.id, messages: [], isNew: true }));
    return [...chats, ...others];
  }, []); // eslint-disable-line
  const shown = targets.filter((c) => convTitle(world, c).toLowerCase().includes(q.toLowerCase()));
  const send = () => {
    const recipients = [];
    for (const key of sel) {
      const t = targets.find((c) => c.id === key);
      const payload = items.map((m) => {
        const { text, image, doc, audio, location, contact: card, poll } = m;
        return { id: uid("fw"), text, image, doc, audio, location, contact: card, poll: poll ? { ...poll, options: poll.options.map((o) => ({ ...o, votes: [] })) } : undefined, forwarded: true };
      });
      if (note.trim()) payload.push({ id: uid("msg"), text: note.trim() });
      act({ type: "send", convId: t.isNew ? undefined : t.id, toPerson: t.isNew ? t.with : undefined, messages: payload });
      recipients.push(convTitle(world, t));
    }
    log("messages_forwarded", { fromConvId: req.convId, msgIds: req.msgIds, items: items.map((m) => msgSummary(world, m)), recipients, note: note.trim() || null });
    toast(`Forwarded to ${recipients.join(", ")}`);
    onClose();
  };
  return (
    <Modal title="Forward to…" onClose={onClose}>
      <label className="wa-search"><Search size={18} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search chats" /></label>
      <div className="wa-forward-list">
        {shown.map((c) => {
          const on = sel.includes(c.id);
          return (
            <button key={c.id} className="wa-conv" aria-pressed={on} onClick={() => setSel((s) => (on ? s.filter((x) => x !== c.id) : [...s, c.id]))}>
              <span className="wa-avatar-check"><ConvAvatar conv={c} />{on && <i><Check size={12} /></i>}</span>
              <span className="wa-conv-copy"><strong>{convTitle(world, c)}</strong>{c.kind === "group" && <small>{c.members.length} members</small>}</span>
            </button>
          );
        })}
      </div>
      {sel.length > 0 && (
        <div className="wa-forward-foot">
          <small>{sel.map((id) => convTitle(world, targets.find((c) => c.id === id))).join(", ")}</small>
          <div className="wa-caption-row">
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a message (optional)" aria-label="Add a message" />
            <button className="wa-send" aria-label="Send forward" onClick={send}><Send size={20} /></button>
          </div>
        </div>
      )}
      {void contact}
    </Modal>
  );
}
