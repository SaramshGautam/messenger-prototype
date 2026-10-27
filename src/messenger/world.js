// Shared baseline dataset for the messenger app (task bank v2, T01-M … T13-M).
// Every scenario starts from a fresh copy of this world. Scripted messages and
// calls are NOT here — they live in scenarios.js and arrive after their trigger.
// All people, numbers, places and documents are fictional. The study account is Alex.

import { photo as P, avatar as realAvatar } from "./photos.js";

const A = "/assets/avatars/";
export const ME = "me";

export const contacts = {
  me: { id: "me", name: "Alex Morgan", phone: "+1 555-0100", about: "Hey there! I am using Chat." },
  pat: { id: "pat", name: "Pat Williams", phone: "+1 555-0111", about: "Community lunch organizer", avatar: A + "pat-williams.webp" },
  lee: { id: "lee", name: "Lee Johnson", phone: "+1 555-0112", about: "Oak Street", avatar: A + "lee-johnson.webp" },
  susan: { id: "susan", name: "Susan Clark", phone: "+1 555-0113", about: "Busy cooking", avatar: A + "susan-clark.webp" },
  omar: { id: "omar", name: "Omar Haddad", phone: "+1 555-0114", about: "Repair café coordinator", avatar: A + "omar-haddad.webp" },
  lena: { id: "lena", name: "Lena Fischer", phone: "+1 555-0115", about: "Community center volunteer", avatar: A + "maria-santos.webp" },
  adam: { id: "adam", name: "Adam Reed", phone: "+1 555-0116", about: "Available", avatar: A + "david-morgan.webp" },
  maya: { id: "maya", name: "Maya Patel", phone: "+1 555-0117", about: "Available", avatar: A + "maya-patel.webp" },
  daniel: { id: "daniel", name: "Daniel Brooks", phone: "+1 555-0118", about: "Museum visits", avatar: A + "daniel-brooks.webp" },
  nora: { id: "nora", name: "Nora Kim", phone: "+1 555-0119", about: "Book Club · Sewing workshops", avatar: A + "nora-kim.webp" },
  elena: { id: "elena", name: "Elena Ruiz", phone: "+1 555-0120", about: "Walk organizer", avatar: A + "elena-ruiz.webp" },
  priya: { id: "priya", name: "Priya Shah", phone: "+1 555-0121", about: "Volunteer coordinator", avatar: A + "priya-shah.webp" },
  luis: { id: "luis", name: "Luis Ortega", phone: "+1 555-0122", about: "Available", avatar: A + "luis-ortega.webp" },
  ravi: { id: "ravi", name: "Ravi Kumar", phone: "+1 555-0123", about: "Available" },
  sam: { id: "sam", name: "Sam Rivera", phone: "+1 555-0124", about: "Neighbor · happy to help", avatar: A + "sam-rivera.webp" },
  rosa: { id: "rosa", name: "Rosa Martinez", phone: "+1 555-0125", about: "Garden Club · tool borrowing", avatar: A + "rosa-martinez.webp" },
  ben: { id: "ben", name: "Ben Carter", phone: "+1 555-0126", about: "Seeds!", avatar: A + "ben.webp" },
  anna: { id: "anna", name: "Anna Lopez", phone: "+1 555-0127", about: "Community center coordinator", avatar: A + "anna-morgan.webp" },
  kim: { id: "kim", name: "Kim Nguyen", phone: "+1 555-0128", about: "Available" },
  grace: { id: "grace", name: "Grace Hill", phone: "+1 555-0129", about: "Available", avatar: A + "grace-hill.webp" },
  tom: { id: "tom", name: "Tom Baker", phone: "+1 555-0130", about: "Available", avatar: A + "tom-baker.webp" },
  // Not a saved contact (T08-M)
  deals: { id: "deals", name: "+1 555-0199", profileName: "Daily Deals", phone: "+1 555-0199", about: "", unsaved: true },
};
for (const c of Object.values(contacts)) if (!c.avatar && !c.unsaved) c.avatar = realAvatar(c.id);

// ---------- Documents (device Files and chat attachments) ----------
export const documents = {
  lamp_form: { id: "lamp_form", name: "Lamp repair form.pdf", size: "84 KB", pages: [["Maple Repair Café", "Repair request form", "", "Name: Alex Morgan", "Item: Desk lamp", "Problem: The lamp does not switch on.", "Preferred day: Saturday", "", "Signed: Alex Morgan"]] },
  library_form: { id: "library_form", name: "Library card renewal form.pdf", size: "61 KB", pages: [["Maple Library", "Library card renewal", "", "Name: Alex Morgan", "Card number: 0000 1234", "Renewal period: 2 years"]] },
  vol_draft: { id: "vol_draft", name: "Volunteer schedule DRAFT.pdf", size: "45 KB", pages: [["Community Volunteers — Food drive", "DRAFT", "", "Setup: 9 a.m.", "Collection: 10 a.m.–1 p.m.", "Pack-up: 1 p.m."]] },
  vol_final: { id: "vol_final", name: "Volunteer schedule FINAL.pdf", size: "46 KB", pages: [["Community Volunteers — Food drive", "FINAL", "", "Setup: 10 a.m.", "Collection: 10 a.m.–1 p.m.", "Pack-up: 1 p.m."]] },
  helpers: { id: "helpers", name: "Saturday helpers schedule.pdf", size: "52 KB", pages: [["Saturday Helpers", "Schedule", "", "9:00 a.m. Set up tables — Priya, Luis", "10:00 a.m. Welcome desk — Alex", "11:00 a.m. Refreshments — Ravi (to be confirmed)", "1:00 p.m. Pack up — everyone"]] },
  oct_list: { id: "oct_list", name: "October reading list.pdf", size: "38 KB", pages: [["Book Club", "October reading list", "", "The Quiet Orchard, chapters 5–9"]] },
  nov_list: { id: "nov_list", name: "November reading list.pdf", size: "39 KB", pages: [["Book Club", "November reading list", "", "The Lantern House, chapters 1–4", "", "Guests are welcome."]] },
};
// Files app on the study phone (attach → Document)
export const deviceFiles = ["lamp_form", "library_form", "vol_final", "vol_draft"];

// ---------- Places (attach → Location) ----------
export const places = {
  river_cafe: { id: "river_cafe", name: "River Café", address: "18 River Road", image: P("map-river-cafe") },
  boathouse: { id: "boathouse", name: "Riverside Boathouse", address: "2 Park Lane", image: P("map-riverside-walk") },
  stone_bridge: { id: "stone_bridge", name: "Stone Bridge", address: "River Road", image: P("map-riverside-walk") },
  river_park: { id: "river_park", name: "River Park", address: "Park Avenue", image: P("map-river-park") },
  community_center: { id: "community_center", name: "Community Center", address: "25 Oak Street", image: P("map-river-park") },
  town_hall: { id: "town_hall", name: "Town Hall", address: "1 Main Street", image: P("map-river-park") },
  maple_cafe: { id: "maple_cafe", name: "Maple Café", address: "7 Maple Avenue", image: P("map-river-park") },
};

// ---------- Study phone gallery ----------
export const gallery = [
  { id: "g_kit", title: "Workshop kit.jpg", src: P("workshop-kit") },
  { id: "g_main", title: "Main hall.jpg", src: P("room-main-hall") },
  { id: "g_side", title: "Side room.jpg", src: P("room-side-room") },
  { id: "g_storage", title: "Storage room.jpg", src: P("room-storage") },
  { id: "g_flowers", title: "Garden flowers.jpg", src: P("gallery-garden-flowers") },
  { id: "g_cake", title: "Birthday cake.jpg", src: P("gallery-noah-birthday-cake") },
  { id: "g_receipt", title: "Receipt.jpg", src: P("gallery-shopping-receipt") },
];

// ---------- Status updates (T13-M). They never expire during a session. ----------
export const statuses = [
  { author: "elena", time: "35 minutes ago", items: [
    { id: "es_1", kind: "image", src: P("status-rain"), alt: "Too wet for the park today. We’ll meet indoors instead, same time, 11 a.m." },
    { id: "es_2", kind: "text", text: "River Café, 18 River Road", bg: "#2e7d6b" },
  ] },
  { author: "sam", time: "2 hours ago", items: [{ id: "ss_1", kind: "text", text: "Fresh bread from the Saturday market 🍞", bg: "#8a5a2b" }] },
  { author: "lee", time: "Today, 7:40 AM", items: [{ id: "ls_1", kind: "image", src: P("lee-garden-after-rain"), alt: "Lee’s garden after the rain" }] },
  { author: "grace", time: "Yesterday, 6:15 PM", items: [{ id: "gs_1", kind: "text", text: "Quilt square number two done!", bg: "#7a4f9a" }] },
];

// ---------- Call history ----------
export const calls = [
  { id: "call_1", with: "susan", dir: "out", type: "voice", status: "ended", day: "Yesterday", time: "5:12 PM", duration: 184 },
  { id: "call_2", with: "adam", dir: "in", type: "video", status: "missed", day: "Oct 30", time: "11:03 AM" },
  { id: "call_3", with: "nora", dir: "in", type: "voice", status: "ended", day: "Oct 26", time: "2:40 PM", duration: 95 },
];

// ---------- Chats ----------
let n = 0;
const m = (from, day, time, body) => ({ id: `m${++n}`, from, day, time, ...(typeof body === "string" ? { text: body } : body) });
const img = (name, alt, file) => ({ src: P(name), alt, name: file });

export const conversations = [
  // T01-M
  { id: "g_oak", kind: "group", title: "Oak Street Neighbors", members: ["me", "pat", "lee"], admins: ["pat"], color: "#41658a",
    description: "Oak Street neighbors — local news and activities.", messages: [
      m("pat", "Oct 8", "10:02 AM", { image: img("cleanup-flyer", "Street cleanup flyer: Saturday, October 12, 9 a.m., meet at Oak & 3rd", "Cleanup flyer.jpg"), text: "Street cleanup this Saturday!" }),
      m("lee", "Oct 8", "10:30 AM", "I’ll bring gloves."),
      m("me", "Oct 8", "11:15 AM", "Thanks for organizing, Pat!"),
      m("pat", "Yesterday", "4:10 PM", "Hi all, I’ve made a flyer for our community lunch."),
      m("pat", "Yesterday", "4:11 PM", { id: "oak_lunch", image: img("lunch-flyer", "Community lunch flyer: Saturday, noon, Community Center", "Community lunch.jpg"), text: "Community lunch. Saturday, noon. Community Center." }),
      m("lee", "Yesterday", "5:02 PM", { id: "oak_lee_q", text: "I use a walker. There’s an entrance on Oak Street and another beside the parking lot. Which would be easier?" }),
      m("pat", "Yesterday", "5:20 PM", { id: "oak_pat_a", replyTo: "oak_lee_q", text: "The second one has a ramp and a step-free path to the lunch room. I’d use that one." }),
      m("lee", "Yesterday", "5:25 PM", "Thank you!"),
      m("pat", "Today", "9:02 AM", { id: "oak_count", text: "Who is coming to lunch? Please tell me how many people." }),
    ] },
  // T04-M / T06-M
  { id: "dm_adam", kind: "dm", with: "adam", messages: [
    m("adam", "Oct 14", "6:00 PM", "Are you still up for the harvest festival on October 18?"),
    m("me", "Oct 14", "6:20 PM", { id: "ad_leave", text: "Let’s leave at 4 p.m." }),
    m("adam", "Oct 14", "6:22 PM", "Perfect, I’ll meet you at your place."),
    m("adam", "Yesterday", "7:45 PM", "I’d love to join your walking group on Saturday!"),
    m("me", "Yesterday", "8:01 PM", "Great, I’ll send you the details."),
  ] },
  // T13-M
  { id: "dm_elena", kind: "dm", with: "elena", messages: [
    m("elena", "Oct 26", "10:00 AM", "Thanks for joining the walk last week!"),
    m("me", "Oct 26", "10:12 AM", "My pleasure, it was lovely."),
  ] },
  // T07-M / T11-M
  { id: "dm_priya", kind: "dm", with: "priya", messages: [
    m("priya", "Oct 24", "9:30 AM", "Here is the final schedule for the food drive."),
    m("priya", "Oct 24", "9:30 AM", { id: "pr_final", doc: "vol_final" }),
    m("me", "Oct 24", "9:45 AM", "Thank you!"),
    m("priya", "Oct 30", "1:00 PM", "Could you help me organize the Saturday volunteers?"),
    m("me", "Oct 30", "1:10 PM", "Of course!"),
    m("priya", "Today", "10:05 AM", { id: "pr_request", text: "Please create a group called Saturday Helpers. Add me and Luis first. I am still checking whether Ravi can join." }),
    m("priya", "Today", "10:06 AM", { id: "pr_sched", doc: "helpers" }),
  ] },
  // T05-M
  { id: "g_book", kind: "group", title: "Book Club", members: ["me", "nora", "ben", "grace", "kim"], admins: ["nora"], color: "#7a4f9a",
    description: "Monthly book club. Nora shares reading lists and meeting details here.", messages: [
      m("nora", "Sep 28", "3:00 PM", { id: "bk_oct", doc: "oct_list", text: "October reading list", starred: true }),
      m("grace", "Sep 28", "3:30 PM", "Thanks, Nora!"),
      m("nora", "Oct 29", "11:00 AM", { id: "bk_nov", doc: "nov_list", text: "Here is the November reading list: The Lantern House, chapters 1–4. Guests are welcome!", pinned: true }),
      m("nora", "Oct 29", "11:02 AM", { id: "bk_sched", text: "November meetings: November 6 and November 13, both at 2 p.m." }),
      m("kim", "Oct 29", "12:15 PM", "Can’t wait!"),
      m("nora", "Oct 30", "9:40 AM", { id: "bk_update", replyTo: "bk_sched", text: "The first meeting is still at the library. The second has moved to Maple Café." }),
      m("nora", "Oct 30", "9:42 AM", { id: "bk_poll", poll: { question: "Which November meeting will you attend?", multiple: false, options: [
        { id: "nov6", text: "November 6, 2 p.m.", votes: ["kim"] }, { id: "nov13", text: "November 13, 2 p.m.", votes: ["grace"] },
      ] } }),
      m("ben", "Oct 30", "10:05 AM", "I’ll be at the second one."),
    ] },
  // T06-M
  { id: "g_walk", kind: "group", title: "Walking Group", members: ["me", "elena", "grace", "tom"], admins: ["elena"], color: "#2e8b57",
    description: "Saturday walks around Maple. Elena organizes our routes.", messages: [
      m("elena", "Oct 28", "8:00 PM", "Saturday’s plan: Riverside Walk from the boathouse to the stone bridge, with a café stop at 11 a.m."),
      m("elena", "Oct 28", "8:01 PM", { id: "wk_map", image: img("map-riverside-walk", "Riverside Walk map from the boathouse to the stone bridge", "Riverside Walk map.jpg"), text: "Riverside Walk map", starred: true }),
      m("grace", "Oct 28", "8:30 PM", "Looking forward to it!"),
      m("elena", "Yesterday", "6:30 PM", { id: "wk_update", text: "Rain is expected. We’re canceling the walk, but we’ll still meet at River Café at 11 a.m." }),
      m("tom", "Yesterday", "6:45 PM", "Thanks for letting us know."),
    ] },
  // T01/T04/T05/T10
  { id: "dm_susan", kind: "dm", with: "susan", messages: [
    m("susan", "Oct 10", "9:00 AM", { id: "su_pine", text: "Road closure notice: Pine Street will be closed on October 18 from 9 a.m. to 3 p.m." }),
    m("susan", "Oct 10", "9:01 AM", "Hope it doesn’t affect the bus."),
    m("me", "Oct 10", "9:20 AM", "Thanks for letting me know!"),
    m("susan", "Yesterday", "3:00 PM", "Are you going to the community lunch on Saturday?"),
    m("me", "Yesterday", "3:05 PM", "Yes — let’s go together!"),
    m("susan", "Yesterday", "3:06 PM", "Lovely 😊 I’d also like to try your book club some time."),
  ] },
  // T02-M
  { id: "dm_omar", kind: "dm", with: "omar", messages: [
    m("omar", "Oct 20", "11:00 AM", "Hi Alex, thanks for signing up for the repair café."),
    m("me", "Oct 20", "11:20 AM", "Thanks! My desk lamp stopped working."),
    m("omar", "Oct 20", "11:25 AM", { text: "We can usually fix those. We’re open Saturdays 10–2.", starred: true }),
    m("omar", "Yesterday", "2:00 PM", { id: "om_call", text: "Please call me to arrange your lamp repair. We only need to talk; you do not need to turn on your camera." }),
    m("omar", "Yesterday", "2:01 PM", "Any time after 10 a.m. is fine."),
  ] },
  // T03-M
  { id: "dm_lena", kind: "dm", with: "lena", messages: [
    m("lena", "Oct 28", "4:00 PM", "Hi Alex! Looking forward to helping you get ready for the online workshop."),
    m("me", "Oct 28", "4:10 PM", "Thank you so much!"),
    m("lena", "Yesterday", "10:30 AM", { id: "le_practice", text: "For our practice, I will call you. We will check that we can see and hear each other. Please have the workshop-kit photo ready on your phone." }),
    m("me", "Yesterday", "10:45 AM", "Sounds good!"),
  ] },
  // T04-M
  { id: "dm_maya", kind: "dm", with: "maya", messages: [
    m("maya", "Oct 15", "8:30 AM", { id: "my_notice", text: "Road closure notice: Oak Street will be closed on October 18 from 1 p.m. to 6 p.m. for repaving." }),
    m("maya", "Oct 15", "8:31 AM", "Just so you know, in case you’re driving that day."),
    m("me", "Oct 15", "9:00 AM", "Thanks, Maya!"),
    m("maya", "Oct 16", "7:50 AM", { id: "my_corr", replyTo: "my_notice", text: "Correction: Oak Street will reopen at 5 p.m., an hour earlier than announced." }),
    m("maya", "Oct 16", "7:55 AM", "How is your knee feeling, by the way?"),
    m("me", "Oct 16", "8:20 AM", "Much better, thanks!"),
    m("maya", "Oct 16", "8:22 AM", "Glad to hear it. My sister is visiting next week, so I’ll be busy."),
  ] },
  { id: "dm_daniel", kind: "dm", with: "daniel", messages: [
    m("daniel", "Sep 30", "5:00 PM", { id: "dn_notice", text: "Road closure notice: Oak Street will be closed on October 4 from 8 a.m. to noon for the street fair." }),
    m("daniel", "Sep 30", "5:01 PM", "The museum trip will take the long way round that day."),
    m("me", "Sep 30", "6:10 PM", "Thanks for the heads-up."),
  ] },
  // T11-M
  { id: "g_vol", kind: "group", title: "Community Volunteers", members: ["me", "priya", "luis", "kim", "grace"], admins: ["priya"], color: "#c4553a",
    description: "Volunteers for Maple community events.", messages: [
      m("me", "Oct 23", "6:00 PM", { id: "cv_draft", doc: "vol_draft", text: "Here’s the schedule for the food drive!" }),
      m("luis", "Oct 23", "6:30 PM", "Thanks, Alex!"),
      m("kim", "Oct 23", "7:02 PM", "See you there."),
    ] },
  // T08-M
  { id: "dm_deals", kind: "dm", with: "deals", unsaved: true, messages: [
    m("deals", "Oct 29", "8:00 AM", "Pay a membership fee today to receive our deals."),
    m("deals", "Oct 31", "8:00 AM", "Pay a membership fee today to receive our deals."),
    m("deals", "Today", "8:00 AM", "Pay a membership fee today to receive our deals."),
  ] },
  { id: "dm_sam", kind: "dm", with: "sam", messages: [
    m("me", "Oct 25", "4:00 PM", "I keep getting messages from a shop I never signed up for."),
    m("sam", "Oct 25", "4:20 PM", { id: "sm_screens", text: "If unwanted messages keep coming, send me a screenshot of an example." }),
    m("sam", "Oct 29", "12:00 PM", "Is the Garden Club lending tools this month? I’d like to borrow a rake."),
    m("sam", "Oct 31", "9:15 AM", "Let me know if you hear of any craft workshops!"),
  ] },
  // T09-M
  { id: "g_garden", kind: "group", title: "Garden Club", members: ["me", "rosa", "ben", "lee", "grace"], admins: ["rosa"], color: "#4a8a3a",
    description: "Garden Club for Oak Street gardeners. Rosa organizes tool borrowing — see her pinned message about borrowing tools.", messages: [
      m("rosa", "Oct 20", "9:00 AM", { id: "gd_rules", pinned: true, text: "Tool borrowing: Collect tools from 9–10 a.m. on your chosen day. Return them by 4 p.m. Reserve your collection days in the poll. For borrowing enquiries, contact me:", contact: { personId: "rosa", label: "Tool borrowing enquiries" } }),
      m("rosa", "Oct 20", "9:02 AM", { id: "gd_poll", poll: { question: "Which days will you collect tools?", multiple: true, options: [
        { id: "tue", text: "Tuesday", votes: ["lee"] }, { id: "thu", text: "Thursday", votes: [] }, { id: "sat", text: "Saturday", votes: ["grace"] },
      ] } }),
      m("lee", "Oct 21", "6:00 PM", { id: "gd_bencard", text: "If anyone wants seeds for spring, message Ben:", contact: { personId: "ben", label: "Seed swap" } }),
      m("grace", "Oct 22", "5:30 PM", { image: img("gallery-garden-flowers", "Grace’s flowers", "IMG_3310.jpg"), text: "My flowers are still going strong!" }),
      m("ben", "Oct 23", "8:10 AM", "Beautiful!"),
    ] },
  // T12-M
  { id: "g_setup", kind: "group", title: "Community Setup", members: ["me", "anna", "lee", "kim"], admins: ["anna"], color: "#3b6f8f",
    description: "Volunteers setting up rooms at the community center. Anna coordinates.", messages: [
      m("anna", "Yesterday", "2:00 PM", "Here are the layout options for the meeting. Have a look!"),
      m("anna", "Yesterday", "2:01 PM", { id: "st_l1", image: img("layout-a", "Chair layout photo", "IMG_2041.jpg") }),
      m("anna", "Yesterday", "2:01 PM", { id: "st_l2", image: img("layout-b", "Chair layout photo", "IMG_2042.jpg") }),
      m("anna", "Yesterday", "2:01 PM", { id: "st_l3", image: img("layout-c", "Chair layout photo", "IMG_2043.jpg") }),
      m("anna", "Yesterday", "2:02 PM", { id: "st_l4", image: img("layout-d", "Chair layout photo", "IMG_2044.jpg") }),
      m("anna", "Yesterday", "2:02 PM", { id: "st_l5", image: img("layout-e", "Chair layout photo", "IMG_2045.jpg") }),
      m("anna", "Yesterday", "2:02 PM", { id: "st_l6", image: img("layout-f", "Chair layout photo", "IMG_2046.jpg") }),
      m("kim", "Yesterday", "2:30 PM", "These all look good to me."),
      m("lee", "Yesterday", "3:10 PM", { id: "st_lee_q", replyTo: "st_l4", text: "Is this for the side room or the main hall?" }),
      m("anna", "Yesterday", "3:25 PM", { id: "st_anna_a", replyTo: "st_lee_q", text: "The second one. Please keep that wide aisle clear.", reactions: { me: "😢" } }),
      m("kim", "Yesterday", "3:40 PM", "Got it."),
    ] },
  // T10-M (archived)
  { id: "dm_nora", kind: "dm", with: "nora", archived: true, messages: [
    m("nora", "Oct 25", "10:00 AM", { id: "nr_flyer", image: img("sewing-workshop-flyer", "Sewing workshop flyer: November 22, 10 a.m.–noon, Town Hall, guests welcome", "Sewing workshop.jpg"), text: "Sewing workshop. November 22, 10 a.m.–noon. Town Hall. Guests welcome." }),
    m("nora", "Oct 25", "10:02 AM", { id: "nr_voice", audio: { duration: 9, transcript: "Bring your scissors and a pencil. I’ll provide the fabric and thread, so you don’t need to buy those.", src: "/assets/audio/nora-sewing-supplies.mp3" } }),
    m("nora", "Oct 25", "10:03 AM", { id: "nr_ask", text: "Please let me know what you’re bringing." }),
    m("nora", "Oct 26", "9:00 AM", "By the way, the Town Hall car park is free on Saturdays."),
    m("me", "Oct 26", "9:30 AM", "Good to know, thanks!"),
  ] },
  { id: "g_choir", kind: "group", title: "Choir 2023", members: ["me", "grace", "tom"], admins: ["grace"], color: "#8a5a2b", archived: true,
    description: "", messages: [m("grace", "Dec 18, 2023", "8:00 PM", "Thank you all for a wonderful season!")] },
  { id: "dm_tom", kind: "dm", with: "tom", archived: true, messages: [m("tom", "Aug 2", "1:00 PM", "Thanks for returning the ladder!")] },
];
