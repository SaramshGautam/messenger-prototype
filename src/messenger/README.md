# Messenger app (WhatsApp-style, T01-M … T04-M)

| File | What it holds |
| --- | --- |
| `world.js` | Shared baseline: contacts (incl. the unsaved +123456789 number), chats and groups, read receipts, gallery, places (current location = Brookside Community Market), statuses |
| `scenarios.js` | Start screen per scenario and extra state (T04-M: your blurry status is already posted) |
| `store.js` | State updates (send, react, star, pin, delete, edit, vote, block, archive, add/delete your status…) |
| `MessengerApp.jsx` | Shell: tabs (Chats, Updates, Calls, Settings), navigation, overlays |
| `components/` | `Lists.jsx` (chats, filters, search), `ChatView.jsx`, `Bubble.jsx`, `Pickers.jsx` (attach: Document, Gallery, Location incl. live location, Contact; Forward), `Info.jsx` (contact/group info, shared media, message info), `Calls.jsx`, `Status.jsx` |

## Scenarios

| Task | Start | Main features |
| --- | --- | --- |
| T01-M | Chat list | Search contacts (Alex Turner has no chat yet), read ticks + message Info (David), reaction (Nora), send a gallery photo (business card) |
| T02-M | Oak Court Notices | Group member list (Helen Williams vs Helena Ward), Groups filter, reply to a message, forward to Ben |
| T03-M | Maple Gardening | Shared media (blue gazebo photo), member list (Jacqueline), post a status from the gallery, reply to Oliver's status |
| T04-M | Chat list | Your status ⋮ → Delete, message Info with Read by / Delivered to, send current location, block +123456789 |

No scripted (delayed) events in this task bank.

## Controls

* **Select a message**: press and hold. Then Reply, Star, Delete, Copy, Forward, ⋮ (Pin, Edit, Info for your own messages). An emoji row appears for reactions.
* **Ticks**: grey ✓✓ delivered, blue ✓✓ read. ⋮ → Info shows times (private chat) or Read by / Delivered to (group).
* **Group info**: tap the chat name. Media, links and docs opens all shared photos.
* **Status**: Updates tab. Camera icon next to My status adds a photo status. Open My status → ⋮ → Delete; the eye button shows who viewed it.
