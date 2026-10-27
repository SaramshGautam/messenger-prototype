import { useMemo, useState } from "react";
import {
  Search, X, Archive, Star, MoreVertical, MessageSquarePlus, Users, UserPlus, ChevronLeft, ArrowRight, Check, Camera,
  ClipboardList, Ban, Lock, Bell, KeyRound, BellOff,
} from "lucide-react";
import { useM, PersonAvatar, ConvAvatar, Sheet, SheetItem } from "../ui.jsx";
import { contact, convTitle, msgSummary, savedContacts, findDM, uid, ME } from "../store.js";

export function Header({ title, onBack, right, sub }) {
  const { nav } = useM();
  return (
    <div className="wa-head">
      {onBack !== false && <button className="wa-icon" onClick={onBack ?? nav.back} aria-label="Back"><ChevronLeft size={26} /></button>}
      <span className="wa-head-title"><strong>{title}</strong>{sub && <small>{sub}</small>}</span>
      <span className="wa-head-right">{right}</span>
    </div>
  );
}

function Highlight({ text = "", term }) {
  const i = text.toLowerCase().indexOf(term.toLowerCase());
  if (i < 0) return text.slice(0, 90);
  const s = Math.max(0, i - 28);
  return <>{s > 0 ? "…" : ""}{text.slice(s, i)}<mark>{text.slice(i, i + term.length)}</mark>{text.slice(i + term.length, i + term.length + 70)}</>;
}

export function ConvRow({ c, onOpen }) {
  const { world } = useM();
  const visible = c.messages.filter((m) => !m.deletedForMe);
  const last = visible[visible.length - 1];
  const unread = world.unread[c.id] ?? 0;
  const who = last && !last.system && c.kind === "group" ? `${last.from === ME ? "You" : contact(world, last.from).name.split(" ")[0]}: ` : last?.from === ME ? "You: " : "";
  return (
    <button className="wa-conv" onClick={onOpen}>
      <ConvAvatar conv={c} />
      <span className="wa-conv-copy">
        <span className="wa-conv-top"><strong>{convTitle(world, c)}</strong><time className={unread ? "unread" : ""}>{last?.day === "Today" ? last.time : last?.day}</time></span>
        <span className="wa-conv-bottom"><small>{c.blocked ? "Blocked" : who + msgSummary(world, last)}</small>{unread > 0 && <i className="wa-unread">{unread}</i>}</span>
      </span>
    </button>
  );
}

const FILTERS = ["All", "Unread", "Groups"];

export function ChatsList() {
  const { world, nav, log, act } = useM();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");
  const [menu, setMenu] = useState(false);
  const term = q.trim().toLowerCase();
  const open = (c, extra = {}) => { act({ type: "markRead", convId: c.id }); log("conversation_opened", { convId: c.id, title: convTitle(world, c), ...extra }); nav.push({ name: "chat", convId: c.id, focusMsgId: extra.msgId }); };

  const list = world.convOrder.map((id) => world.conversations[id]).filter((c) => !c.archived)
    .filter((c) => filter === "All" || (filter === "Unread" ? (world.unread[c.id] ?? 0) > 0 : c.kind === "group"));
  const archivedCount = Object.values(world.conversations).filter((c) => c.archived).length;

  const results = useMemo(() => {
    if (!term) return null;
    const chats = Object.values(world.conversations).filter((c) => convTitle(world, c).toLowerCase().includes(term));
    const people = savedContacts(world).filter((p) => p.name.toLowerCase().includes(term) && !findDM(world, p.id));
    const messages = [];
    for (const id of world.convOrder) {
      const c = world.conversations[id];
      for (const m of [...c.messages].reverse()) {
        if (m.deletedForMe || m.deletedForEveryone || m.system) continue;
        const hay = [m.text, m.doc && world.documents[m.doc]?.name, m.image?.name].filter(Boolean).join(" ");
        if (hay.toLowerCase().includes(term)) messages.push({ c, m, hay });
      }
    }
    return { chats, people, messages };
  }, [term, world]);

  return (
    <div className="wa-page">
      <div className="wa-top">
        <strong className="wa-brand">Chats</strong>
        <span>
          <button className="wa-icon" aria-label="Camera" onClick={() => log("camera_tapped")}><Camera size={22} /></button>
          <button className="wa-icon" aria-label="More options" onClick={() => setMenu(true)}><MoreVertical size={22} /></button>
        </span>
      </div>
      <label className="wa-search"><Search size={18} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search chats and messages"
          onBlur={() => q && log("chat_search", { q })} onKeyDown={(e) => e.key === "Enter" && log("chat_search", { q })} />
        {q && <button className="wa-icon" aria-label="Clear search" onClick={() => setQ("")}><X size={18} /></button>}
      </label>
      {results ? (
        <div className="wa-results">
          {results.chats.length > 0 && <h3 className="wa-section">Chats</h3>}
          {results.chats.map((c) => <ConvRow key={c.id} c={c} onOpen={() => { log("chat_search_result_opened", { q, convId: c.id }); open(c); }} />)}
          {results.people.length > 0 && <h3 className="wa-section">Contacts</h3>}
          {results.people.map((p) => (
            <button key={p.id} className="wa-conv" onClick={() => { log("chat_search_contact_opened", { q, personId: p.id }); nav.push({ name: "chat", personId: p.id }); }}>
              <PersonAvatar id={p.id} /><span className="wa-conv-copy"><strong>{p.name}</strong><small>{p.about}</small></span>
            </button>
          ))}
          <h3 className="wa-section">Messages</h3>
          {results.messages.length === 0 && <p className="wa-empty">No messages found</p>}
          {results.messages.map(({ c, m, hay }) => (
            <button key={c.id + m.id} className="wa-conv result" onClick={() => { log("chat_search_result_opened", { q, convId: c.id, msgId: m.id }); open(c, { msgId: m.id, via: "search" }); }}>
              <span className="wa-conv-copy">
                <span className="wa-conv-top"><strong>{convTitle(world, c)}{c.archived ? " · Archived" : ""}</strong><time>{m.day}</time></span>
                <small className="wa-snippet">{c.kind === "group" || m.from === ME ? `${m.from === ME ? "You" : contact(world, m.from).name.split(" ")[0]}: ` : ""}<Highlight text={hay} term={term} /></small>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="wa-chips">
            {FILTERS.map((f) => <button key={f} className={filter === f ? "on" : ""} onClick={() => { setFilter(f); log("chat_filter", { filter: f }); }}>{f}</button>)}
          </div>
          {archivedCount > 0 && filter === "All" && (
            <button className="wa-conv archived" onClick={() => { log("archived_opened"); nav.push({ name: "archived" }); }}>
              <span className="wa-archive-icon"><Archive size={20} /></span>
              <span className="wa-conv-copy"><span className="wa-conv-top"><strong>Archived</strong><small>{archivedCount}</small></span></span>
            </button>
          )}
          {list.map((c) => <ConvRow key={c.id} c={c} onOpen={() => open(c)} />)}
          {list.length === 0 && <p className="wa-empty">No chats</p>}
        </>
      )}
      <button className="wa-fab" aria-label="New chat" onClick={() => { log("new_chat_opened"); nav.push({ name: "newChat" }); }}><MessageSquarePlus size={24} /></button>
      {menu && (
        <Sheet onClose={() => setMenu(false)}>
          <SheetItem icon={Users} label="New group" onClick={() => { setMenu(false); log("new_group_opened", { via: "menu" }); nav.push({ name: "newGroup" }); }} />
          <SheetItem icon={Star} label="Starred messages" onClick={() => { setMenu(false); log("starred_opened", { via: "menu" }); nav.push({ name: "starred" }); }} />
          <SheetItem icon={Archive} label="Archived chats" onClick={() => { setMenu(false); log("archived_opened", { via: "menu" }); nav.push({ name: "archived" }); }} />
          <SheetItem icon={ClipboardList} label="Settings" onClick={() => { setMenu(false); nav.tab("settings"); }} />
        </Sheet>
      )}
    </div>
  );
}

export function ArchivedList() {
  const { world, nav, log, act } = useM();
  const list = world.convOrder.map((id) => world.conversations[id]).filter((c) => c.archived);
  return (
    <div className="wa-page">
      <Header title="Archived" />
      <p className="wa-note">These chats stay archived when new messages arrive.</p>
      {list.map((c) => <ConvRow key={c.id} c={c} onOpen={() => { act({ type: "markRead", convId: c.id }); log("conversation_opened", { convId: c.id, title: convTitle(world, c), archived: true }); nav.push({ name: "chat", convId: c.id }); }} />)}
      {list.length === 0 && <p className="wa-empty">No archived chats</p>}
    </div>
  );
}

export function StarredList() {
  const { world, nav, log } = useM();
  const items = [];
  for (const id of world.convOrder) {
    const c = world.conversations[id];
    for (const m of c.messages) if (m.starred && !m.deletedForMe && !m.deletedForEveryone) items.push({ c, m });
  }
  return (
    <div className="wa-page">
      <Header title="Starred messages" />
      {items.length === 0 && <p className="wa-empty">Tap and hold on any message to star it, so you can easily find it later.</p>}
      {items.map(({ c, m }) => (
        <button key={c.id + m.id} className="wa-starred" onClick={() => { log("starred_message_opened", { convId: c.id, msgId: m.id }); nav.push({ name: "chat", convId: c.id, focusMsgId: m.id }); }}>
          <span className="wa-starred-top"><PersonAvatar id={m.from} size="xs" /><small><strong>{m.from === ME ? "You" : contact(world, m.from).name}</strong> ▸ {convTitle(world, c)}</small><time>{m.day}</time></span>
          <span className="wa-starred-body">
            {m.image && <img src={m.image.src} alt={m.image.alt} />}
            <span>{msgSummary(world, m)}</span>
            <Star size={13} fill="currentColor" />
          </span>
        </button>
      ))}
    </div>
  );
}

export function NewChat() {
  const { world, nav, log, toast } = useM();
  const [q, setQ] = useState("");
  const list = savedContacts(world).filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="wa-page">
      <Header title="Select contact" sub={`${savedContacts(world).length} contacts`} />
      <label className="wa-search"><Search size={18} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or number" aria-label="Search contacts" /></label>
      <button className="wa-conv" onClick={() => { log("new_group_opened", { via: "new_chat" }); nav.replace({ name: "newGroup" }); }}>
        <span className="wa-round-icon"><Users size={20} /></span><span className="wa-conv-copy"><strong>New group</strong></span>
      </button>
      <button className="wa-conv" onClick={() => toast("Adding contacts isn’t available in the study app")}>
        <span className="wa-round-icon"><UserPlus size={20} /></span><span className="wa-conv-copy"><strong>New contact</strong></span>
      </button>
      <h3 className="wa-section">Contacts</h3>
      {list.map((p) => (
        <button key={p.id} className="wa-conv" onClick={() => { log("contact_chat_opened", { personId: p.id }); const dm = findDM(world, p.id); nav.replace({ name: "chat", convId: dm?.id, personId: p.id }); }}>
          <PersonAvatar id={p.id} /><span className="wa-conv-copy"><strong>{p.name}</strong><small>{p.about}</small></span>
        </button>
      ))}
    </div>
  );
}

// New group: choose members, then name the group.
export function NewGroup() {
  const { world, nav, log, act, toast } = useM();
  const [sel, setSel] = useState([]);
  const [stage, setStage] = useState("members");
  const [name, setName] = useState("");
  const [q, setQ] = useState("");
  const list = savedContacts(world).filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  const toggle = (id) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  if (stage === "name")
    return (
      <div className="wa-page">
        <Header title="New group" onBack={() => setStage("members")} />
        <div className="wa-form">
          <label className="wa-field"><span>Group name</span>
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Group name (required)" aria-label="Group name" maxLength={60} />
          </label>
          <p className="wa-note">Members: {sel.length}</p>
          <div className="wa-chosen">{sel.map((id) => <span key={id}><PersonAvatar id={id} size="sm" /><small>{contact(world, id).name.split(" ")[0]}</small></span>)}</div>
        </div>
        <button className="wa-fab" aria-label="Create group" disabled={!name.trim()} onClick={() => {
          const id = uid("grp");
          act({ type: "createGroup", id, title: name.trim(), members: sel });
          log("group_created", { convId: id, title: name.trim(), members: sel, memberNames: sel.map((x) => contact(world, x).name) });
          toast(`Group “${name.trim()}” created`);
          nav.replace({ name: "chat", convId: id });
        }}><Check size={26} /></button>
      </div>
    );
  return (
    <div className="wa-page">
      <Header title="New group" sub={sel.length ? `${sel.length} selected` : "Add members"} />
      {sel.length > 0 && (
        <div className="wa-chosen">
          {sel.map((id) => <button key={id} onClick={() => toggle(id)} aria-label={`Remove ${contact(world, id).name}`}><PersonAvatar id={id} size="sm" /><small>{contact(world, id).name.split(" ")[0]}</small><X size={12} /></button>)}
        </div>
      )}
      <label className="wa-search"><Search size={18} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or number" aria-label="Search contacts" /></label>
      {list.map((p) => {
        const on = sel.includes(p.id);
        return (
          <button key={p.id} className="wa-conv" aria-pressed={on} onClick={() => { toggle(p.id); log(on ? "group_member_unselected" : "group_member_selected", { personId: p.id }); }}>
            <span className="wa-avatar-check"><PersonAvatar id={p.id} />{on && <i><Check size={12} /></i>}</span>
            <span className="wa-conv-copy"><strong>{p.name}</strong><small>{p.about}</small></span>
          </button>
        );
      })}
      <button className="wa-fab" aria-label="Next" disabled={!sel.length} onClick={() => setStage("name")}><ArrowRight size={26} /></button>
    </div>
  );
}

export function SettingsPage() {
  const { world, nav, openTasks, log } = useM();
  const blocked = Object.values(world.conversations).filter((c) => c.blocked);
  const [showBlocked, setShowBlocked] = useState(false);
  return (
    <div className="wa-page">
      <div className="wa-top"><strong className="wa-brand">Settings</strong></div>
      <div className="wa-me"><PersonAvatar id={ME} size="lg" /><span><strong>{contact(world, ME).name}</strong><small>{contact(world, ME).about}</small></span></div>
      <div className="wa-list">
        <button className="wa-conv" onClick={() => { log("starred_opened", { via: "settings" }); nav.push({ name: "starred" }); }}><span className="wa-round-icon"><Star size={20} /></span><span className="wa-conv-copy"><strong>Starred messages</strong></span></button>
        <button className="wa-conv" onClick={() => nav.push({ name: "archived" })}><span className="wa-round-icon"><Archive size={20} /></span><span className="wa-conv-copy"><strong>Archived chats</strong></span></button>
        <button className="wa-conv" onClick={() => setShowBlocked((v) => !v)}><span className="wa-round-icon"><Ban size={20} /></span><span className="wa-conv-copy"><strong>Blocked contacts</strong><small>{blocked.length}</small></span></button>
        {showBlocked && blocked.map((c) => <p key={c.id} className="wa-note">{convTitle(world, c)}</p>)}
        <button className="wa-conv"><span className="wa-round-icon"><Lock size={20} /></span><span className="wa-conv-copy"><strong>Privacy</strong></span></button>
        <button className="wa-conv"><span className="wa-round-icon"><Bell size={20} /></span><span className="wa-conv-copy"><strong>Notifications</strong></span></button>
        <button className="wa-conv"><span className="wa-round-icon"><KeyRound size={20} /></span><span className="wa-conv-copy"><strong>Account</strong></span></button>
        <button className="wa-conv" onClick={openTasks}><span className="wa-round-icon"><ClipboardList size={20} /></span><span className="wa-conv-copy"><strong>Study tasks</strong><small>For researchers</small></span></button>
      </div>
      {void BellOff}
    </div>
  );
}
