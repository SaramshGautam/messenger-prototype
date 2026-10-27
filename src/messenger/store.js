import * as base from "./world.js";

export const ME = base.ME;
export const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

let seq = 0;
export const uid = (p) => `${p}_${Date.now().toString(36)}_${++seq}`;
export const clock = (d = new Date()) => d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// Sort key for the fictional day labels ("Today", "Yesterday", "Oct 31", "Dec 18, 2023").
export function dayKey(day, time) {
  let d = 0;
  if (day === "Today") d = 400;
  else if (day === "Yesterday") d = 399;
  else {
    const mm = day?.match(/^([A-Z][a-z]{2}) (\d+)(, (\d{4}))?/);
    if (mm) d = (mm[4] ? -1000 : 0) + MONTHS.indexOf(mm[1]) * 31 + Number(mm[2]);
  }
  let t = 0;
  const tm = time?.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (tm) t = ((Number(tm[1]) % 12) + (tm[3].toUpperCase() === "PM" ? 12 : 0)) * 60 + Number(tm[2]);
  return d * 1440 + t;
}

export function createWorld(setup) {
  const w = structuredClone({
    contacts: base.contacts,
    documents: base.documents,
    deviceFiles: base.deviceFiles,
    places: base.places,
    gallery: base.gallery,
    statuses: base.statuses,
    calls: base.calls,
    conversations: Object.fromEntries(base.conversations.map((c) => [c.id, c])),
  });
  const last = (c) => c.messages[c.messages.length - 1];
  w.convOrder = Object.values(w.conversations)
    .sort((a, b) => dayKey(last(b)?.day, last(b)?.time) - dayKey(last(a)?.day, last(a)?.time))
    .map((c) => c.id);
  w.unread = { g_oak: 1, dm_priya: 2, dm_deals: 3, g_walk: 2, g_setup: 0 };
  setup?.(w);
  return w;
}

// ---------- selectors ----------
export const contact = (w, id) => w.contacts[id] ?? { id, name: id };
export const displayName = (w, id) => (id === ME ? "You" : contact(w, id).name);
export const convTitle = (w, c) => (c.kind === "dm" ? contact(w, c.with).name : c.title);
export const findDM = (w, personId) => Object.values(w.conversations).find((c) => c.kind === "dm" && c.with === personId);
export const findMsg = (w, convId, msgId) => w.conversations[convId]?.messages.find((m) => m.id === msgId);
export const savedContacts = (w) => Object.values(w.contacts).filter((c) => c.id !== ME && !c.unsaved).sort((a, b) => a.name.localeCompare(b.name));

export function msgSummary(w, m) {
  if (!m) return "";
  if (m.deletedForEveryone) return m.from === ME ? "You deleted this message" : "This message was deleted";
  if (m.system) return m.system;
  if (m.call) return `${m.call.type === "video" ? "Video" : "Voice"} call`;
  if (m.poll) return `📊 ${m.poll.question}`;
  if (m.audio) return "🎤 Voice message";
  if (m.location) return `📍 ${w.places[m.location.placeId]?.name ?? "Location"}`;
  if (m.contact) return m.text ? m.text : `👤 ${contact(w, m.contact.personId).name}`;
  if (m.doc) return m.text ? `📄 ${m.text}` : `📄 ${w.documents[m.doc]?.name}`;
  if (m.image) return m.text ? `📷 ${m.text}` : "📷 Photo";
  return m.text ?? "";
}

// ---------- reducer ----------
export function reducer(w, a) {
  const next = structuredClone(w);
  const now = new Date();
  const conv = a.convId ? next.conversations[a.convId] : null;
  const msgs = (ids) => conv.messages.filter((m) => ids.includes(m.id));
  const bump = (id) => { next.convOrder = [id, ...next.convOrder.filter((x) => x !== id)]; };
  switch (a.type) {
    case "send": { // a.messages from ME (or a.from for incoming)
      let c = conv;
      if (!c && a.toPerson) {
        c = Object.values(next.conversations).find((x) => x.kind === "dm" && x.with === a.toPerson);
        if (!c) { c = { id: a.newConvId ?? uid("dm"), kind: "dm", with: a.toPerson, messages: [] }; next.conversations[c.id] = c; }
      }
      for (const msg of a.messages) c.messages.push({ from: a.from ?? ME, day: "Today", time: clock(now), sentAt: now.getTime(), ...msg });
      if (a.from && a.from !== ME) { c.archived = c.archived && c.kind === "group" ? c.archived : false; next.unread[c.id] = (next.unread[c.id] ?? 0) + a.messages.length; }
      bump(c.id);
      return next;
    }
    case "markRead": { next.unread[a.convId] = 0; return next; }
    case "react": {
      const m = findMsg(next, a.convId, a.msgId);
      m.reactions ??= {};
      if (!a.emoji || m.reactions[ME] === a.emoji) delete m.reactions[ME];
      else m.reactions[ME] = a.emoji;
      return next;
    }
    case "star": { msgs(a.msgIds).forEach((m) => { m.starred = a.on; }); return next; }
    case "pin": { const m = findMsg(next, a.convId, a.msgId); m.pinned = a.on; return next; }
    case "delete": {
      for (const m of msgs(a.msgIds)) {
        if (a.forEveryone) {
          for (const k of ["text", "image", "doc", "audio", "location", "contact", "poll", "replyTo", "reactions", "forwarded", "edited", "starred", "pinned"]) delete m[k];
          m.deletedForEveryone = true;
        } else m.deletedForMe = true;
      }
      return next;
    }
    case "edit": { const m = findMsg(next, a.convId, a.msgId); m.history = [...(m.history ?? []), m.text]; m.text = a.text; m.edited = true; return next; }
    case "vote": {
      const poll = findMsg(next, a.convId, a.msgId).poll;
      const opt = poll.options.find((o) => o.id === a.optionId);
      const had = opt.votes.includes(ME);
      if (poll.multiple) opt.votes = had ? opt.votes.filter((v) => v !== ME) : [...opt.votes, ME];
      else { poll.options.forEach((o) => (o.votes = o.votes.filter((v) => v !== ME))); if (!had) opt.votes.push(ME); }
      return next;
    }
    case "createGroup": {
      next.conversations[a.id] = {
        id: a.id, kind: "group", title: a.title, members: [ME, ...a.members], admins: [ME], color: "#2e7d6b", description: "", created: true,
        messages: [
          { id: uid("sys"), system: `You created group “${a.title}”`, day: "Today", time: clock(now) },
          { id: uid("sys"), system: `You added ${a.members.map((id) => contact(next, id).name.split(" ")[0]).join(", ")}`, day: "Today", time: clock(now) },
        ],
      };
      bump(a.id);
      return next;
    }
    case "addMembers": {
      for (const id of a.ids) if (!conv.members.includes(id)) conv.members.push(id);
      conv.messages.push({ id: uid("sys"), system: `You added ${a.ids.map((id) => contact(next, id).name.split(" ")[0]).join(", ")}`, day: "Today", time: clock(now) });
      return next;
    }
    case "removeMember": {
      conv.members = conv.members.filter((x) => x !== a.personId);
      conv.messages.push({ id: uid("sys"), system: `You removed ${contact(next, a.personId).name.split(" ")[0]}`, day: "Today", time: clock(now) });
      return next;
    }
    case "renameGroup": { conv.title = a.title; return next; }
    case "block": { conv.blocked = a.on; return next; }
    case "archive": { conv.archived = a.on; return next; }
    case "callLog": {
      next.calls.unshift({ id: uid("call"), with: a.with, dir: a.dir, type: a.call.type, status: a.call.status, day: "Today", time: clock(now), duration: a.call.duration });
      const c = Object.values(next.conversations).find((x) => x.kind === "dm" && x.with === a.with);
      if (c) { c.messages.push({ id: uid("call"), from: a.dir === "out" ? ME : a.with, day: "Today", time: clock(now), call: a.call }); bump(c.id); }
      return next;
    }
    case "statusViewed": { const s = next.statuses.find((x) => x.author === a.author); if (s) s.viewed = true; return next; }
    case "addGallery": { next.gallery.unshift(a.item); return next; }
    default: return w;
  }
}
