// Shared baseline dataset for the messenger app (task bank v3, T01-M … T04-M).
// Every scenario starts from a fresh copy of this world (scenarios.js adds
// scenario-specific state such as your own status). All people, numbers,
// places and documents are fictional. The study account is "You".

import { photo as P, avatar as realAvatar } from "./photos.js";

const A = "/assets/avatars/";
export const ME = "me";

export const contacts = {
  me: { id: "me", name: "Jordan Morgan", phone: "+1 555-0100", about: "Hey there! I am using Chat." },
  // T01-M
  alex: { id: "alex", name: "Alex Turner", phone: "+1 202-555-0147", about: "Maintenance technician · Turner Home Repairs", avatar: A + "alex-turner.webp" },
  david: { id: "david", name: "David Miller", phone: "+1 555-0131", about: "Neighbor", avatar: A + "david-miller.webp" },
  nora: { id: "nora", name: "Nora Kim", phone: "+1 555-0119", about: "Neighbor", avatar: A + "nora-kim.webp" },
  // T02-M
  maya: { id: "maya", name: "Maya Patel", phone: "+1 555-0117", about: "Property manager, Oak Court", avatar: A + "maya-patel.webp" },
  ben: { id: "ben", name: "Ben Carter", phone: "+1 555-0126", about: "Oak Court, apartment 4B", avatar: A + "ben.webp" },
  helen: { id: "helen", name: "Helen Williams", phone: "+1 555-0141", about: "Oak Court, apartment 2C", avatar: A + "maria-santos.webp" },
  lucy: { id: "lucy", name: "Lucy Chen", phone: "+1 555-0142", about: "Oak Court", avatar: A + "priya-shah.webp" },
  raj: { id: "raj", name: "Raj Mehta", phone: "+1 555-0143", about: "Available" },
  peter: { id: "peter", name: "Peter Wong", phone: "+1 555-0144", about: "Oak Court" }, // photo: src/assets/photos/avatars/peter.webp (initials until then)
  sofia: { id: "sofia", name: "Sofia Rossi", phone: "+1 555-0145", about: "Available" },
  helena: { id: "helena", name: "Helena Ward", phone: "+1 555-0146", about: "Oak Court, apartment 6A" },
  // T03-M
  emma: { id: "emma", name: "Emma Davis", phone: "+1 555-0151", about: "Maple Gardening organizer", avatar: A + "emma-davis.webp" },
  oliver: { id: "oliver", name: "Oliver Grant", phone: "+1 555-0152", about: "Available", avatar: A + "oliver-grant.webp" },
  jacqueline: { id: "jacqueline", name: "Jacqueline Moore", phone: "+1 555-0153", about: "Gardening and good books", avatar: A + "jacqueline-moore.webp" },
  jackie: { id: "jackie", name: "Jack Moore", phone: "+1 555-0154", about: "Available" },
  rosa: { id: "rosa", name: "Rosa Martinez", phone: "+1 555-0125", about: "Garden Club", avatar: A + "rosa-martinez.webp" },
  // T04-M
  grace: { id: "grace", name: "Grace Hill", phone: "+1 555-0129", about: "Available", avatar: A + "grace-hill.webp" },
  hannah: { id: "hannah", name: "Hannah Brooks", phone: "+1 555-0161", about: "Brookside Community Market organizer" }, // photo: src/assets/photos/avatars/hannah.webp (initials until then)
  mark: { id: "mark", name: "Mark Ellis", phone: "+1 555-0162", about: "Bread stall" },
  // Everyday contacts
  susan: { id: "susan", name: "Susan Clark", phone: "+1 555-0113", about: "Busy cooking", avatar: A + "susan-clark.webp" },
  lee: { id: "lee", name: "Lee Johnson", phone: "+1 555-0112", about: "Available", avatar: A + "lee-johnson.webp" },
  sam: { id: "sam", name: "Sam Rivera", phone: "+1 555-0124", about: "Neighbor · happy to help", avatar: A + "sam-rivera.webp" },
  tom: { id: "tom", name: "Tom Baker", phone: "+1 555-0130", about: "Available", avatar: A + "tom-baker.webp" },
  kim: { id: "kim", name: "Kim Nguyen", phone: "+1 555-0128", about: "Available" },
  // Not a saved contact (T04-M)
  promo: { id: "promo", name: "+123456789", profileName: "Best Deals", phone: "+123456789", about: "", unsaved: true },
};
for (const c of Object.values(contacts)) if (!c.avatar && !c.unsaved) c.avatar = realAvatar(c.id);

// ---------- Documents (device Files and chat attachments) ----------
export const documents = {
  lease: { id: "lease", name: "Oak Court house rules.pdf", size: "92 KB", pages: [["Oak Court", "House rules", "", "Quiet hours: 10 p.m.–7 a.m.", "Bins: Tuesday and Friday mornings", "Courtyard: see notices group"]] },
  recipe: { id: "recipe", name: "Lentil soup recipe.pdf", size: "40 KB", pages: [["Lentil soup", "", "1 cup red lentils", "1 onion, 2 carrots", "Simmer 25 minutes"]] },
};
export const deviceFiles = ["lease", "recipe"];

// ---------- Places (attach → Location) ----------
export const places = {
  market: { id: "market", name: "Brookside Community Market", address: "Brookside Park, 12 Brook Lane", image: P("map-river-park") },
  brook_cafe: { id: "brook_cafe", name: "Brookside Café", address: "3 Brook Lane", image: P("map-river-cafe") },
  library: { id: "library", name: "Maple Library", address: "40 Main Street", image: P("map-river-park") },
  maple_gardens: { id: "maple_gardens", name: "Maple Gardens", address: "Maple Avenue", image: P("map-river-park") },
};
export const CURRENT_PLACE = "market"; // simulated current location (T04-M)

// ---------- Study phone gallery ----------
export const gallery = [
  { id: "g_card", title: "IMG_4021.jpg", src: P("business-card") },
  { id: "g_card2", title: "IMG_4022.jpg", src: P("business-card-2") },
  { id: "g_picnic", title: "Picnic poster.jpg", src: P("picnic-poster-new") },
  { id: "g_market", title: "Market poster.jpg", src: P("market-poster") },
  { id: "g_flowers", title: "Garden flowers.jpg", src: P("gallery-garden-flowers") },
  { id: "g_cake", title: "Birthday cake.jpg", src: P("gallery-noah-birthday-cake") },
  { id: "g_receipt", title: "Receipt.jpg", src: P("gallery-shopping-receipt") },
  { id: "g_lee_garden", title: "Garden after rain.jpg", src: P("lee-garden-after-rain") },
];

// ---------- Status updates. They never expire during a session. ----------
// Your own status lives in `myStatus` (scenarios.js preloads it where needed).
export const statuses = [
  { author: "oliver", time: "1 hour ago", items: [
    { id: "ol_1", kind: "image", src: P("picnic-poster-old"), alt: "Maple Gardening community picnic poster: Saturday, November 7, 12–2 p.m., Blue Gazebo, Maple Park" },
  ] },
  { author: "sam", time: "2 hours ago", items: [{ id: "ss_1", kind: "text", text: "Fresh bread from the Saturday market 🍞", bg: "#8a5a2b" }] },
  { author: "lee", time: "Today, 7:40 AM", items: [{ id: "ls_1", kind: "image", src: P("lee-garden-after-rain"), alt: "Lee’s garden after the rain" }] },
  { author: "grace", time: "Yesterday, 6:15 PM", items: [{ id: "gs_1", kind: "text", text: "Quilt square number two done!", bg: "#7a4f9a" }] },
];
export const myStatus = [];
export const statusViewers = ["grace", "sam", "lee", "susan"];

// ---------- Call history ----------
export const calls = [
  { id: "call_1", with: "susan", dir: "out", type: "voice", status: "ended", day: "Yesterday", time: "5:12 PM", duration: 184 },
  { id: "call_2", with: "grace", dir: "in", type: "video", status: "missed", day: "Oct 30", time: "11:03 AM" },
  { id: "call_3", with: "nora", dir: "in", type: "voice", status: "ended", day: "Oct 26", time: "2:40 PM", duration: 95 },
];

// ---------- Chats ----------
// Your messages can carry status: "sent" | "delivered" | "read" (default "read").
// Group messages can carry receipts: { read: [[personId, time]], delivered: [[personId, time]] }.
let n = 0;
const m = (from, day, time, body) => ({ id: `m${++n}`, from, day, time, ...(typeof body === "string" ? { text: body } : body) });
const img = (name, alt, file) => ({ src: name.startsWith("/") ? name : P(name), alt, name: file });

const NOTICES = ["me", "maya", "lucy", "raj", "peter", "sofia", "helen", "tom", "kim", "grace"];

export const conversations = [
  // ----- T01-M -----
  { id: "dm_david", kind: "dm", with: "david", messages: [
    m("david", "Oct 28", "6:10 PM", "Do you know anyone who fixes leaking pipes? My kitchen sink is dripping."),
    m("me", "Yesterday", "5:40 PM", { text: "Here is Alex Turner’s number. He fixed my faucet last week.", status: "read" }),
    m("me", "Yesterday", "5:40 PM", { contact: { personId: "alex", label: "Maintenance technician" }, status: "read" }),
    m("david", "Yesterday", "6:02 PM", "Thank you! I’ll call him."),
    m("me", "Today", "7:30 AM", { id: "dv_remind", text: "Just a reminder! If you want to request a visit from Alex today, you need to contact him before 10 a.m.", status: "read", readAt: "Today, 7:52 AM", deliveredAt: "Today, 7:30 AM" }),
  ] },
  { id: "dm_nora", kind: "dm", with: "nora", messages: [
    m("nora", "Oct 25", "10:00 AM", "Thanks for the soup recipe!"),
    m("me", "Oct 25", "10:20 AM", "You’re welcome 😊"),
    m("nora", "Today", "9:12 AM", { id: "nr_ask", text: "Hi! Do you know a maintenance technician you would recommend?" }),
  ] },
  // ----- T02-M -----
  { id: "g_notices", kind: "group", title: "Oak Court Notices", members: NOTICES, admins: ["maya"], color: "#41658a", photo: "/assets/groups/oak-court-notices.webp",
    description: "Building rules and announcements from the Oak Court property manager.", messages: [
      m("maya", "Oct 1", "9:00 AM", "Welcome to Oak Court Notices. I will share building rules and announcements here."),
      m("maya", "Oct 1", "9:02 AM", "Reminder: Oak Court Social is for events, and Oak Court Exchange is for offering or requesting items."),
      m("lucy", "Oct 14", "6:30 PM", "Is the laundry room open on Sundays?"),
      m("maya", "Oct 14", "7:05 PM", "Yes, 8 a.m. to 8 p.m. every day."),
      m("peter", "Oct 22", "8:15 AM", "The front door is sticking again."),
      m("maya", "Oct 22", "9:40 AM", "Thanks, Peter. A repair is booked for Friday."),
      m("raj", "Oct 30", "5:10 PM", "Has anyone seen a gray cat near the bins? She’s ours."),
      m("sofia", "Oct 30", "5:42 PM", "I saw her by the garden gate!"),
      m("maya", "Today", "8:00 AM", { id: "nt_rules", text: "Updated courtyard rules: Please leave the courtyard by 9 p.m. and take all personal belongings with you." }),
      m("tom", "Today", "8:20 AM", "Thanks, Maya."),
      m("lucy", "Today", "9:10 AM", { id: "nt_lunch", image: img("/assets/feed/community-lunch-flyer.webp", "Community lunch poster", "Community lunch.jpg"), text: "Community lunch this Sunday in the courtyard. Everyone is welcome!" }),
      m("kim", "Today", "9:25 AM", "Sounds lovely 😊"),
    ] },
  { id: "g_social", kind: "group", title: "Oak Court Social", members: ["me", "lucy", "sofia", "tom", "kim", "ben"], admins: ["lucy"], color: "#d9822b", photo: "/assets/groups/oak-court-social.webp",
    description: "Events and get-togethers for Oak Court neighbors.", messages: [
      m("lucy", "Oct 18", "4:00 PM", "Board games night on Friday at 7 p.m. in the lounge!"),
      m("sofia", "Oct 18", "4:30 PM", "I’ll bring snacks."),
      m("ben", "Yesterday", "8:00 PM", "Who’s up for a walk on Saturday morning?"),
    ] },
  { id: "dm_ben", kind: "dm", with: "ben", messages: [
    m("ben", "Oct 20", "1:00 PM", "Thanks for taking in my parcel!"),
    m("me", "Oct 20", "1:15 PM", "No problem. It’s by my door."),
    m("ben", "Oct 29", "7:30 PM", "Do you know if there are new rules for the courtyard? I’m not in the notices group."),
  ] },
  // Unrelated groups
  { id: "g_book", kind: "group", title: "Book Club", members: ["me", "nora", "grace", "kim", "susan"], admins: ["nora"], color: "#7a4f9a",
    description: "Monthly book club.", messages: [
      m("nora", "Oct 29", "11:00 AM", "November book: The Lantern House, chapters 1–4."),
      m("grace", "Oct 29", "12:15 PM", "Can’t wait!"),
    ] },
  { id: "g_walk", kind: "group", title: "Walking Group", members: ["me", "grace", "tom", "sam"], admins: ["grace"], color: "#2e8b57",
    description: "Saturday morning walks.", messages: [
      m("grace", "Oct 31", "8:00 PM", "Saturday’s walk starts at 9 a.m. at the park gate."),
      m("tom", "Oct 31", "8:10 PM", "See you there!"),
    ] },
  // ----- T03-M -----
  { id: "g_garden", kind: "group", title: "Maple Gardening", members: ["me", "emma", "oliver", "jacqueline", "rosa", "lee", "susan", "kim"], admins: ["emma"], color: "#4a8a3a", photo: "/assets/groups/maple-gardening.webp",
    description: "Neighbors who garden together. Emma organizes our activities.", messages: [
      m("emma", "Sep 14", "10:00 AM", "Thanks for coming to the summer picnic, everyone!"),
      m("emma", "Sep 14", "10:02 AM", { id: "gd_gazebo", image: img("picnic-gazebo", "A blue gazebo by a pond", "IMG_1802.jpg"), text: "Our picnic area by the blue gazebo." }),
      m("rosa", "Sep 14", "11:30 AM", "What a lovely spot!"),
      m("rosa", "Sep 16", "4:10 PM", { image: img("picnic-other-2", "Picnic tables by a creek", "IMG_1840.jpg"), text: "Found these tables by the creek. Nice for a picnic one day?" }),
      m("lee", "Sep 20", "9:15 AM", { image: img("lee-garden-after-rain", "Lee’s garden after rain", "IMG_2201.jpg"), text: "My garden after the rain." }),
      m("rosa", "Sep 21", "2:00 PM", { image: img("picnic-gazebo-white", "A white gazebo on a lawn", "IMG_2210.jpg"), text: "The new gazebo at the community garden is finally finished!" }),
      m("susan", "Sep 27", "4:00 PM", "Does anyone have spare tomato cages?"),
      m("rosa", "Sep 27", "4:20 PM", "I have two. I’ll leave them by my door."),
      m("kim", "Sep 27", "6:15 PM", { image: img("picnic-other-1", "A picnic shelter in the woods", "IMG_2290.jpg"), text: "The picnic shelter at Pine Woods is open again." }),
      m("oliver", "Oct 2", "11:00 AM", { image: img("picnic-other-3", "Picnic tables in a grassy park", "IMG_2988.jpg"), text: "Lots of picnic tables at Hill Park." }),
      m("kim", "Oct 4", "10:10 AM", { image: img("gallery-garden-flowers", "Kim’s flowers", "IMG_3310.jpg"), text: "Last flowers of the season!" }),
      m("emma", "Oct 11", "9:00 AM", "Seed swap next month. Start saving your seeds!"),
      m("oliver", "Oct 11", "9:30 AM", "Great idea."),
      m("lee", "Oct 12", "3:40 PM", { image: img("picnic-other-4", "A grassy hill with trees", "IMG_3601.jpg"), text: "Beautiful afternoon for a walk." }),
      m("susan", "Oct 14", "1:15 PM", { image: img("picnic-other-5", "Picnic food on a table outdoors", "IMG_3720.jpg"), text: "Lunch at my cousin’s garden party 😋" }),
      m("rosa", "Oct 18", "3:00 PM", { image: img("balcony-plants", "Basil and mint on a balcony", "IMG_4402.jpg"), text: "My balcony herbs are still going." }),
      m("lee", "Oct 25", "12:00 PM", { image: img("finished-flower-bed", "A replanted flower bed", "IMG_4510.jpg"), text: "The new flower bed at the corner." }),
      m("susan", "Oct 25", "12:30 PM", "Beautiful work, Lee!"),
      m("rosa", "Oct 26", "5:30 PM", { image: img("picnic-other-7", "Neighbors sharing food under a tent", "IMG_4560.jpg"), text: "Potluck at the church yesterday!" }),
      m("emma", "Oct 30", "5:00 PM", { id: "gd_poster_old", image: img("picnic-poster-old", "Community picnic poster: Saturday, November 7, 12–2 p.m., Blue Gazebo, Maple Park", "Picnic poster.jpg"), text: "Here is the poster for our community picnic on November 7!" }),
      m("oliver", "Oct 30", "5:20 PM", "I’ll share it on my status 👍"),
      m("kim", "Yesterday", "6:00 PM", "Count me in!"),
      m("emma", "Today", "8:05 AM", { id: "gd_poster_new", image: img("picnic-poster-new", "Updated community picnic poster: Saturday, November 7, 1–3 p.m. (updated time), Blue Gazebo, Maple Park", "Picnic poster updated.jpg"), text: "Updated poster: the picnic now starts at 1 p.m. and ends at 3. Same date and place." }),
      m("rosa", "Today", "8:30 AM", "Thanks for the update, Emma!"),
    ] },
  // ----- T04-M -----
  { id: "g_market", kind: "group", title: "Brookside Community Market", members: ["me", "hannah", "mark", "grace", "lucy", "tom", "kim", "promo"], admins: ["hannah"], color: "#c25a10",
    description: "Announcements about the monthly Brookside Community Market.", messages: [
      m("hannah", "Oct 25", "10:00 AM", { image: img("market-poster", "Brookside Community Market poster", "Market poster.jpg"), text: "Next market: Saturday, November 8!" }),
      m("mark", "Oct 25", "11:00 AM", "The bread stall will be back 🍞"),
      m("me", "Yesterday", "6:30 PM", { id: "mk_park", text: "Is there parking near the market?", status: "delivered",
        receipts: { read: [["mark", "6:41 PM"], ["lucy", "7:02 PM"], ["tom", "7:30 PM"]], delivered: [["hannah", "6:30 PM"], ["grace", "6:30 PM"], ["kim", "6:31 PM"], ["promo", "6:30 PM"]] } }),
      m("me", "Today", "7:15 AM", { id: "mk_q", text: "Does anyone know what time the market opens?", status: "delivered",
        receipts: { read: [["hannah", "7:20 AM"], ["mark", "7:42 AM"], ["kim", "8:05 AM"]], delivered: [["grace", "7:15 AM"], ["lucy", "7:16 AM"], ["tom", "7:15 AM"], ["promo", "7:15 AM"]] } }),
      m("promo", "Today", "7:30 AM", "🔥 Best deals today! Message me for discounts."),
      m("tom", "Today", "8:10 AM", "Will the plant stall be there this time?"),
      m("mark", "Today", "8:12 AM", "I think so!"),
      m("lucy", "Today", "8:40 AM", "Remember to bring your own bags, everyone."),
    ] },
  { id: "dm_grace", kind: "dm", with: "grace", messages: [
    m("grace", "Oct 30", "2:00 PM", "Are you going to the market this week?"),
    m("me", "Oct 30", "2:30 PM", { text: "Yes, I’ll be there in the morning.", status: "read" }),
    m("grace", "Today", "9:05 AM", { id: "gr_ask", text: "I’d like to see you today at the market. Can you send me the location?" }),
  ] },
  { id: "dm_promo", kind: "dm", with: "promo", unsaved: true, messages: [
    m("promo", "Oct 29", "8:00 AM", "🔥 Huge discounts today only! Reply YES to get our offers."),
    m("promo", "Oct 31", "8:00 AM", "Last chance! Pay a small fee to unlock member prices."),
    m("promo", "Today", "7:45 AM", "Special offer for Brookside Market shoppers! Message me now."),
  ] },
  // ----- Everyday chats -----
  { id: "dm_susan", kind: "dm", with: "susan", messages: [
    m("susan", "Yesterday", "3:00 PM", "Are you going to the community lunch on Sunday?"),
    m("me", "Yesterday", "3:05 PM", { text: "Yes, let’s go together!", status: "read" }),
  ] },
  { id: "dm_sam", kind: "dm", with: "sam", messages: [
    m("sam", "Oct 31", "9:15 AM", "Let me know if you hear of any craft workshops!"),
    m("me", "Yesterday", "4:10 PM", { text: "There’s one at the library next week.", status: "delivered" }),
  ] },
  { id: "dm_lee", kind: "dm", with: "lee", messages: [
    m("lee", "Oct 27", "9:00 AM", "Thanks for the seeds!"),
    m("me", "Oct 27", "9:30 AM", { text: "Happy planting!", status: "read" }),
  ] },
  { id: "g_choir", kind: "group", title: "Choir 2023", members: ["me", "grace", "tom"], admins: ["grace"], color: "#8a5a2b", archived: true,
    description: "", messages: [m("grace", "Dec 18, 2023", "8:00 PM", "Thank you all for a wonderful season!")] },
];
