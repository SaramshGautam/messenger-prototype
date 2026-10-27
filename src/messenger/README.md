# Messenger app (WhatsApp-style, T01-M … T13-M)

| File | What it holds |
| --- | --- |
| `world.js` | Shared baseline: contacts (incl. the unsaved "Daily Deals" number), chats, documents/Files, places, gallery, statuses, call history |
| `scenarios.js` | Scripted triggers and call scripts (see below) |
| `store.js` | State updates (send, react, star, pin, delete, edit, vote, create group, add members, block, archive, call log…) |
| `MessengerApp.jsx` | Shell: tabs (Chats, Updates, Calls, Settings), navigation, trigger engine, overlays |
| `components/` | `Lists.jsx` (chats, search, archived, starred, new chat/group, settings), `ChatView.jsx`, `Bubble.jsx`, `Pickers.jsx` (attach: Document, Gallery, Location, Contact; Forward), `Info.jsx`, `Calls.jsx`, `Status.jsx` |

## Scripted events

| Task | Trigger | What happens |
| --- | --- | --- |
| T02-M | Participant calls Omar (voice or video) | Omar answers and says the scripted line (text-to-speech + caption) |
| T03-M | Researcher moves to step 3 (Reply) | Lena's incoming video call; her script waits for camera off/on and mute/unmute |
| T07-M | A group named "Saturday Helpers" with Priya is created | Priya posts “Ravi has confirmed…” in that group |
| T13-M | Participant replies to Elena's status | Elena sends the River Café location and asks to pass it on |

Each can also be fired from the researcher menu if it did not happen.

## Controls used by the tasks

* **Select a message**: press and hold. Then Reply, Star, Delete (for me / for everyone), Copy, Forward, ⋮ (Pin, Edit). Tap more messages to select several. An emoji row appears for reactions (tap another emoji to change it).
* **Search**: the search box on Chats searches all chats, including archived ones.
* **Starred messages / Archived**: ⋮ on Chats, or Settings.
* **Attach** (paperclip): Document (the phone's Files), Gallery (study photos + "All photos on this phone" for real screenshots), Location (search places), Contact.
* **Calls**: phone/video buttons in a chat. Calls are simulated; nothing leaves the phone.
* **Voice messages**: tap the mic, then stop, then send. The recording stays on the phone; only its length is logged.
* **Status**: Updates tab. Reply box at the bottom sends a private message.
