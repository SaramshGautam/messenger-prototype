# Messenger Prototype

A standalone messaging app (WhatsApp / Facebook Messenger style) for the **Messenger App** tasks in the
task bank (T01-M … T13-M, 52 steps). Built for the LSU CHIVE Lab study *From Intent to Outcome:
Understanding and Supporting Older Adults’ Digital Communication*. All people, chats, numbers and files are fictional.

## Run it

Requires Node.js 22+.

```bash
npm install
npm run dev        # open the URL shown (use the Network URL on the study phone)
npm run build      # production build in dist/ (deploy to Vercel/Netlify like the social media prototype)
```

## How tasks run

- Open the researcher menu: **Settings → Study tasks**, or double-tap the step dots in the instruction banner.
- **Start task N** resets the app to that scenario's start state (TASK START). Or open `/?s=T05-M` directly.
- Move to the next step with the small arrows in the banner. The participant's screen and changes are kept (CONTINUE). `/?s=T05-M&step=3` also works.
- **Scripted events** fire on their own after their trigger. If one does not happen, the researcher menu shows a button to fire it:

| Task | Trigger | What happens |
| --- | --- | --- |
| T02-M | Participant calls Omar | Omar answers and asks for the repair form (spoken + caption) |
| T03-M | Researcher moves to step 3 | Lena’s incoming video call; waits for camera off/on and mute/unmute |
| T07-M | Group “Saturday Helpers” with Priya is created | Priya posts “Ravi has confirmed…” in the group |
| T13-M | Participant replies to Elena’s status | Elena sends the River Café location |

- Every interaction is logged with the task, step and intent. Download it from the researcher menu (**Log**). Voice recordings stay on the phone; only their length is logged.

## Tasks

| Task | Step 1 goal | Link |
| --- | --- | --- |
| T01-M | Find Pat’s community-lunch flyer in Oak Street Neighbors. | `/?s=T01-M` |
| T02-M | Find Omar’s message about arranging the lamp repair. | `/?s=T02-M` |
| T03-M | Find Lena’s instructions for the practice call. | `/?s=T03-M` |
| T04-M | Find the road-closure notice for Oak Street on October 18. | `/?s=T04-M` |
| T05-M | Find Book Club’s November reading list. | `/?s=T05-M` |
| T06-M | Find the Riverside Walk map you saved earlier. | `/?s=T06-M` |
| T07-M | Find Priya’s request about the volunteer group. | `/?s=T07-M` |
| T08-M | Find the conversation with the repeated advertising messages. | `/?s=T08-M` |
| T09-M | Find Garden Club’s instructions for borrowing tools. | `/?s=T09-M` |
| T10-M | Find Nora’s workshop invitation in your archived messages. | `/?s=T10-M` |
| T11-M | Find the schedule you sent to Community Volunteers. | `/?s=T11-M` |
| T12-M | Find Anna’s photo showing blue chairs in rows with a wide aisle down the middle. | `/?s=T12-M` |
| T13-M | Find Elena’s new status about today’s walk. | `/?s=T13-M` |

## Project structure

```text
src/
  App.jsx                    Task/step state, event log
  components/
    TaskStrip.jsx            Instruction banner with researcher step arrows
    TaskPanel.jsx            Researcher menu (start task, steps, scripted events, log)
    Avatar.jsx, InstallPrompt.jsx
  data/scenarios.json        Generated from the task bank (do not edit by hand)
  messenger/
    world.js                 Shared baseline data: contacts, chats, files, gallery, statuses, calls
    scenarios.js             Start screens, scripted triggers, call scripts
    store.js                 State updates (send, react, star, pin, delete, edit, vote, groups, block…)
    MessengerApp.jsx         Shell: tabs (Chats, Updates, Calls, Settings), navigation, trigger engine
    components/              Lists, ChatView, Bubble, Pickers (attach/forward), Info, Calls, Status
    photos.js                Picks a real photo from src/assets/photos/ if present, else the SVG placeholder
    messenger.css            App styles
public/assets/
  avatars/                   Profile photos
  images/                    Placeholder images (flyers, chair layouts, rooms, maps…)
task-bank/
  TaskBank.xlsx, messenger.csv
scripts/convertTaskBank.mjs  task-bank/messenger.csv → src/data/scenarios.json
```

## Updating tasks

Edit the **Messenger App** sheet in `task-bank/TaskBank.xlsx`, export it as `task-bank/messenger.csv`, then run
`npm run convert:tasks`. Content the tasks rely on (messages, files, photos) lives in `src/messenger/world.js`;
scripted events and call lines live in `src/messenger/scenarios.js`.

## Replacing images

Put a photo with the same base name in `src/assets/photos/` (e.g. `lunch-flyer.webp` replaces
`public/assets/images/lunch-flyer.svg`). Restart `npm run dev`.
