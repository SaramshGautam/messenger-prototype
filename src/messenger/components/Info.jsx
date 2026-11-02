import { useState } from "react";
import { MessageCircle, Phone, Video, Search, Ban, UserPlus, Check, Star, Image as ImageIcon, LogOut, X, ChevronLeft, ChevronRight, Navigation, Share2, MapPin, Download } from "lucide-react";
import { useM, PersonAvatar, ConvAvatar } from "../ui.jsx";
import { Header } from "./Lists.jsx";
import { contact, convTitle, findDM, savedContacts, ME } from "../store.js";

export function ContactInfo({ route }) {
  const { world, nav, startCall, log, act, toast } = useM();
  const c = contact(world, route.personId);
  const conv = route.convId ? world.conversations[route.convId] : findDM(world, c.id);
  const media = conv?.messages.filter((m) => m.image && !m.deletedForEveryone && !m.deletedForMe) ?? [];
  const groups = Object.values(world.conversations).filter((g) => g.kind === "group" && g.members.includes(c.id) && g.members.includes(ME));
  const [confirmBlock, setConfirmBlock] = useState(false);
  return (
    <div className="wa-page wa-info">
      <Header title="" />
      <div className="wa-info-id"><PersonAvatar id={c.id} size="xl" /><h2>{c.unsaved ? c.phone : c.name}</h2><p>{c.unsaved ? `~${c.profileName}` : c.phone}</p></div>
      <div className="wa-info-actions">
        <button onClick={() => (conv ? nav.replace({ name: "chat", convId: conv.id }) : nav.replace({ name: "chat", personId: c.id }))}><MessageCircle size={22} /><span>Message</span></button>
        <button onClick={() => { log("call_button", { type: "voice", personId: c.id, via: "info" }); startCall(c.id, "voice"); }}><Phone size={22} /><span>Voice</span></button>
        <button onClick={() => { log("call_button", { type: "video", personId: c.id, via: "info" }); startCall(c.id, "video"); }}><Video size={22} /><span>Video</span></button>
      </div>
      {c.about && <div className="wa-card-block"><small>About</small><p>{c.about}</p></div>}
      {conv && <button className="wa-card-block wa-media-link" onClick={() => { log("shared_media_opened", { convId: conv.id }); nav.push({ name: "media", convId: conv.id }); }} aria-label={`Media, links and docs, ${media.length} items`}>
        <span className="wa-media-link-top"><small>Media, links and docs</small><small>{media.length} <ChevronRight size={14} /></small></span>
        <span className="wa-media-row">{media.slice(-4).reverse().map((m) => <img key={m.id} src={m.image.src} alt={m.image.alt} />)}</span>
      </button>}
      {groups.length > 0 && (
        <div className="wa-card-block"><small>{groups.length} group{groups.length > 1 ? "s" : ""} in common</small>
          {groups.map((g) => <button key={g.id} className="wa-conv" onClick={() => nav.push({ name: "chat", convId: g.id })}><ConvAvatar conv={g} size="sm" /><span className="wa-conv-copy"><strong>{g.title}</strong></span></button>)}
        </div>
      )}
      {conv && (
        <div className="wa-card-block danger">
          {conv.blocked ? (
            <button onClick={() => { act({ type: "block", convId: conv.id, on: false }); log("contact_unblocked", { convId: conv.id, via: "info" }); toast("Unblocked"); }}><Ban size={20} /> Unblock {c.unsaved ? c.phone : c.name}</button>
          ) : (
            <button onClick={() => { log("block_opened", { convId: conv.id, via: "info" }); setConfirmBlock(true); }}><Ban size={20} /> Block {c.unsaved ? c.phone : c.name}</button>
          )}
        </div>
      )}
      {confirmBlock && (
        <div className="wa-dialog-backdrop" onClick={() => setConfirmBlock(false)}>
          <div className="wa-dialog" role="alertdialog" onClick={(e) => e.stopPropagation()}>
            <p><strong>Block {c.unsaved ? c.phone : c.name}?</strong><br /><small>Blocked contacts will no longer be able to call you or send you messages. This contact will not be notified.</small></p>
            <button className="danger" onClick={() => { act({ type: "block", convId: conv.id, on: true }); log("contact_blocked", { convId: conv.id, personId: c.id, via: "info" }); toast("Blocked"); setConfirmBlock(false); }}>Block</button>
            <button onClick={() => { log("block_cancelled", { convId: conv.id }); setConfirmBlock(false); }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function GroupInfo({ route }) {
  const { world, nav, log, act, toast } = useM();
  const g = world.conversations[route.convId];
  const admin = g.admins.includes(ME);
  const media = g.messages.filter((m) => m.image && !m.deletedForEveryone && !m.deletedForMe);
  const [confirmExit, setConfirmExit] = useState(false);
  return (
    <div className="wa-page wa-info">
      <Header title="Group info" />
      <div className="wa-info-id"><ConvAvatar conv={g} size="xl" /><h2>{g.title}</h2><p>Group · {g.members.length} members</p></div>
      <div className="wa-info-actions">
        <button onClick={() => nav.back()}><MessageCircle size={22} /><span>Chat</span></button>
        {admin && <button onClick={() => { log("add_members_opened", { convId: g.id, via: "actions" }); nav.push({ name: "addMembers", convId: g.id }); }}><UserPlus size={22} /><span>Add</span></button>}
        <button onClick={() => toast("Use the search in the chat menu")}><Search size={22} /><span>Search</span></button>
      </div>
      <div className="wa-card-block">
        <small>Description</small>
        <p>{g.description || (admin ? "Add group description" : "No description")}</p>
      </div>
      <button className="wa-card-block wa-media-link" onClick={() => { log("shared_media_opened", { convId: g.id }); nav.push({ name: "media", convId: g.id }); }} aria-label={`Media, links and docs, ${media.length} items`}>
        <span className="wa-media-link-top"><small>Media, links and docs</small><small>{media.length} <ChevronRight size={14} /></small></span>
        <span className="wa-media-row">{media.slice(-4).reverse().map((m) => <img key={m.id} src={m.image.src} alt={m.image.alt} />)}</span>
      </button>
      <div className="wa-card-block">
        <small>{g.members.length} members</small>
        {admin && (
          <button className="wa-conv" onClick={() => { log("add_members_opened", { convId: g.id, via: "members" }); nav.push({ name: "addMembers", convId: g.id }); }}>
            <span className="wa-round-icon green"><UserPlus size={20} /></span><span className="wa-conv-copy"><strong>Add members</strong></span>
          </button>
        )}
        {[ME, ...g.members.filter((x) => x !== ME)].filter((id) => g.members.includes(id)).map((id) => {
          const c = contact(world, id);
          return (
            <button key={id} className="wa-conv" onClick={() => id !== ME && nav.push({ name: "contact", personId: id })}>
              <PersonAvatar id={id} />
              <span className="wa-conv-copy"><span className="wa-conv-top"><strong>{id === ME ? "You" : c.name}</strong>{g.admins.includes(id) && <small className="wa-admin">Group admin</small>}</span><small>{c.about}</small></span>
            </button>
          );
        })}
      </div>
      <div className="wa-card-block danger">
        <button onClick={() => setConfirmExit(true)}><LogOut size={20} /> Exit group</button>
      </div>
      {confirmExit && (
        <div className="wa-dialog-backdrop" onClick={() => setConfirmExit(false)}>
          <div className="wa-dialog" onClick={(e) => e.stopPropagation()}>
            <p>Exit “{g.title}”?</p>
            <button onClick={() => { log("exit_group_cancelled", { convId: g.id }); setConfirmExit(false); }}>Cancel</button>
            <button className="danger" onClick={() => { act({ type: "removeMember", convId: g.id, personId: ME }); log("group_exited", { convId: g.id }); setConfirmExit(false); }}>Exit group</button>
          </div>
        </div>
      )}
      {void Star}{void ImageIcon}
    </div>
  );
}

export function AddMembers({ route }) {
  const { world, nav, log, act, toast } = useM();
  const g = world.conversations[route.convId];
  const [sel, setSel] = useState([]);
  const [q, setQ] = useState("");
  const [confirm, setConfirm] = useState(false);
  const list = savedContacts(world).filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="wa-page">
      <Header title="Add members" sub={sel.length ? `${sel.length} selected` : convTitle(world, g)} />
      <label className="wa-search"><Search size={18} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or number" aria-label="Search contacts" /></label>
      {list.map((p) => {
        const already = g.members.includes(p.id);
        const on = sel.includes(p.id);
        return (
          <button key={p.id} className="wa-conv" disabled={already} aria-pressed={on} onClick={() => setSel((s) => (on ? s.filter((x) => x !== p.id) : [...s, p.id]))}>
            <span className="wa-avatar-check"><PersonAvatar id={p.id} />{(on || already) && <i className={already ? "grey" : ""}><Check size={12} /></i>}</span>
            <span className="wa-conv-copy"><strong>{p.name}</strong><small>{already ? "Already added to the group" : p.about}</small></span>
          </button>
        );
      })}
      <button className="wa-fab" aria-label="Add selected members" disabled={!sel.length} onClick={() => setConfirm(true)}><Check size={26} /></button>
      {confirm && (
        <div className="wa-dialog-backdrop" onClick={() => setConfirm(false)}>
          <div className="wa-dialog" onClick={(e) => e.stopPropagation()}>
            <p>Add {sel.map((id) => contact(world, id).name).join(", ")} to “{g.title}”?</p>
            <button onClick={() => setConfirm(false)}>Cancel</button>
            <button onClick={() => {
              act({ type: "addMembers", convId: g.id, ids: sel });
              log("group_members_added", { convId: g.id, title: g.title, ids: sel, names: sel.map((id) => contact(world, id).name) });
              toast("Added"); setConfirm(false); nav.back();
            }}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function DocViewer({ route }) {
  const { world, nav } = useM();
  const d = world.documents[route.docId];
  return (
    <div className="wa-page wa-docview">
      <div className="wa-head dark"><button className="wa-icon" onClick={nav.back} aria-label="Back"><ChevronLeft size={26} /></button><span className="wa-head-title"><strong>{d.name}</strong><small>{d.pages.length} page</small></span><span /></div>
      <div className="wa-doc-pages">
        {d.pages.map((lines, i) => (
          <div key={i} className="wa-doc-sheet">
            {lines.map((l, j) => (j === 0 ? <h3 key={j}>{l}</h3> : j === 1 ? <h4 key={j}>{l}</h4> : <p key={j}>{l || " "}</p>))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function MapView({ route }) {
  const { world, nav } = useM();
  const p = world.places[route.placeId];
  return (
    <div className="wa-page wa-mapview">
      <Header title={p.name} sub={p.address} onBack={nav.back} />
      <img src={p.image} alt={`Map of ${p.name}, ${p.address}`} />
      <div className="wa-card-block"><p><MapPin size={16} /> <strong>{p.name}</strong> · {p.address}</p>
        <div className="wa-info-actions"><button><Navigation size={20} /><span>Directions</span></button><button><Share2 size={20} /><span>Share</span></button></div>
      </div>
    </div>
  );
}

export function PhotoViewer({ photos, index, onClose }) {
  const [i, setI] = useState(index);
  const p = photos[i];
  return (
    <div className="wa-viewer" role="dialog" aria-label="Photo">
      <div className="wa-head dark">
        <button className="wa-icon" onClick={onClose} aria-label="Close photo"><X size={24} /></button>
        <span className="wa-head-title"><strong>{p.name ?? "Photo"}</strong></span>
        <span className="wa-head-right"><button className="wa-icon" aria-label="Save"><Download size={22} /></button></span>
      </div>
      <div className="wa-viewer-stage" onClick={onClose}>
        <img src={p.src} alt={p.alt} onClick={(e) => e.stopPropagation()} />
        {photos.length > 1 && <>
          <button className="prev" onClick={(e) => { e.stopPropagation(); setI((i - 1 + photos.length) % photos.length); }} aria-label="Previous"><ChevronLeft /></button>
          <button className="next" onClick={(e) => { e.stopPropagation(); setI((i + 1) % photos.length); }} aria-label="Next"><ChevronRight /></button>
        </>}
      </div>
    </div>
  );
}

// ---------- Message info (your own messages): who received and read it ----------
export function MessageInfo({ route }) {
  const { world, openViewer } = useM();
  const conv = world.conversations[route.convId];
  const m = conv?.messages.find((x) => x.id === route.msgId);
  if (!m) return null;
  const isGroup = conv.kind === "group";
  const read = m.receipts?.read ?? [];
  const delivered = m.receipts?.delivered ?? [];
  const Row = ({ id, time }) => (
    <div className="wa-conv static"><PersonAvatar id={id} /><span className="wa-conv-copy"><strong>{contact(world, id).name}</strong><small>{time}</small></span></div>
  );
  return (
    <div className="wa-page wa-info">
      <Header title="Message info" />
      <div className="wa-msginfo-preview">
        <div className="wa-bubble mine">
          {m.image && <img src={m.image.src} alt={m.image.alt} onClick={() => openViewer([m.image], 0, { convId: conv.id, msgId: m.id })} />}
          {m.text && <span className="wa-text">{m.text}</span>}
          <span className="wa-meta"><time>{m.day === "Today" ? "" : `${m.day}, `}{m.time}</time></span>
        </div>
      </div>
      {isGroup ? (
        <>
          <div className="wa-card-block">
            <small className="wa-receipt-head"><span className="wa-ticks">✓✓</span> Read by</small>
            {read.length ? read.map(([id, t]) => <Row key={id} id={id} time={`Today, ${t}`} />) : <p className="wa-note">Nobody yet</p>}
          </div>
          <div className="wa-card-block">
            <small className="wa-receipt-head"><span className="wa-ticks delivered">✓✓</span> Delivered to</small>
            {delivered.length ? delivered.map(([id, t]) => <Row key={id} id={id} time={`Today, ${t}`} />) : <p className="wa-note">Nobody yet</p>}
          </div>
        </>
      ) : (
        <div className="wa-card-block">
          <div className="wa-receipt-row"><span className="wa-ticks">✓✓</span><span><strong>Read</strong><small>{m.status === "read" || !m.status ? (m.readAt ?? `${m.day}, ${m.time}`) : "—"}</small></span></div>
          <div className="wa-receipt-row"><span className="wa-ticks delivered">✓✓</span><span><strong>Delivered</strong><small>{m.status === "sent" ? "—" : (m.deliveredAt ?? `${m.day}, ${m.time}`)}</small></span></div>
        </div>
      )}
    </div>
  );
}

// ---------- Shared media of a chat or group ----------
export function MediaPage({ route }) {
  const { world, openViewer, log } = useM();
  const conv = world.conversations[route.convId];
  const media = conv.messages.filter((m) => m.image && !m.deletedForEveryone && !m.deletedForMe).reverse();
  const photos = media.map((m) => ({ ...m.image, msgId: m.id }));
  return (
    <div className="wa-page">
      <Header title="Media, links and docs" sub={convTitle(world, conv)} />
      <div className="wa-media-grid">
        {media.map((m, i) => (
          <button key={m.id} onClick={() => { log("shared_media_photo_opened", { convId: conv.id, msgId: m.id, name: m.image.name }); openViewer(photos, i, { convId: conv.id, msgId: m.id, via: "shared_media" }); }} aria-label={`Photo ${m.image.name ?? ""}, ${m.day}`}>
            <img src={m.image.src} alt={m.image.alt} />
          </button>
        ))}
        {!media.length && <p className="wa-note">No media</p>}
      </div>
    </div>
  );
}
