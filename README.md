# Messenger Prototype

A standalone messaging app (WhatsApp / Facebook Messenger style) for the **Messenger App** tasks in the
task bank v3 (T01-M … T04-M, 16 steps). Built for the LSU CHIVE Lab study *From Intent to Outcome:
Understanding and Supporting Older Adults’ Digital Communication*. All people, chats, numbers and files are fictional.

## Run it

Requires Node.js 22+.

```bash
npm install
npm run dev        # open the URL shown (use the Network URL on the study phone)
npm run build      # production build in dist/ (deploy to Vercel/Netlify like the social media prototype)
``## How tasks run

- Open the researcher menu: **Settings → Study tasks**, or double-tap the step dots in the instruction banner.
- **Start task N** resets the app to that scenario's start state (TASK START). Or open `/?s=T03-M` directly.
- Move to the next step with the small arrows in the banner. The participant's screen and changes are kept (CONTINUE). `/?s=T03-M&step=3` also works.
- There are no scripted (delayed) events in this task bank.
- Every interaction is logged with the task, step and intent. Download it from the researcher menu (**Log**).

## Tasks

| Task | Start | Steps (Find · Understand · Respond/Share) | Link |
| --- | --- | --- | --- |
| T01-M | Chat list | Find Alex Turner · Has David read your message? · 👍 Nora’s message · Send Alex’s business card to Nora | `/?s=T01-M` |
| T02-M | Oak Court Notices | Find Helen Williams in the member list · Which Oak Court groups are you in? · Reply to Maya’s rules · Forward them to Ben | `/?s=T02-M` |
| T03-M | Maple Gardening | Find the blue-gazebo photo in shared media · Is Jacqueline a member? · Post the picnic poster to your status · Reply to Oliver’s status | `/?s=T03-M` |
| T04-M | Chat list | Find Delete on your blurry status · Who read your market question? · Send Grace your current location · Block +123456789 | `/?s=T04-M` |

|

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
    scenarios.js             Start screens and per-scenario state (T04-M: your blurry status)
    store.js                 State updates (send, react, star, pin, delete, edit, vote, groups, block…)
    MessengerApp.jsx         Shell: tabs (Chats, Updates, Calls, Settings), navigation, trigger engine
    components/              Lists, ChatView, Bubble, Pickers (attach/forward), Info, Calls, Status
    photos.js                Picks a real photo from src/assets/photos/ if present, else the SVG placeholder
    messenger.css            App styles
public/assets/
  avatars/                   Profile photos
  images/                    Placeholder images (flyers, chair layouts, rooms, maps…)
task-bank/
  messenger.csv              Task bank v3 (TaskBank.xlsx is the older v2 workbook)
scripts/convertTaskBank.mjs  task-bank/messenger.csv → src/data/scenarios.json
```

## Updating tasks

Edit `task-bank/messenger.csv` (task bank v3), then run
`npm run convert:tasks`. Content the tasks rely on (messages, files, photos) lives in `src/messenger/world.js`;
scripted events and call lines live in `src/messenger/scenarios.js`.

## Replacing images

Put a photo with the same base name in `src/assets/photos/` (e.g. `lunch-flyer.webp` replaces
`public/assets/images/lunch-flyer.svg`). Restart `npm run dev`.

## Remote logging (who is using the app, and what they do)

Before anything else, the app asks the researcher for a **participant ID** (e.g. `P07`, never a name).
Every interaction is then tagged with that ID and a session ID.
With Firebase set up, the log is saved to Firestore. Without it, the app works as before and the log stays on the device (researcher menu → Download log).

"Practice without saving" runs the app without sending anything.

### Data model

```
sessions/{sessionId}                   app ("messenger-prototype"), participantId, researcher, device, appVersion, startedAt, endedAt, eventCount
sessions/{sessionId}/events/{eventId}  one document per logged event (type, scenarioId, step, intent, timestamp, details)
```

The app can only **add** data. It cannot read, change or delete logs (see `firestore.rules`).
Logs are read with the export script below, using an admin key.

### Setup (once)

1. Create a project at https://console.firebase.google.com.
2. Build → Firestore Database → Create database.
3. Build → Authentication → Sign-in method → turn on **Anonymous**.
4. Project settings → Your apps → add a Web app. Copy its config.
5. Copy `.env.example` to `.env.local` and paste the values.
6. Add the same `VITE_FIREBASE_*` values in Vercel → Settings → Environment Variables, then redeploy.
7. Deploy the security rules:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase deploy --only firestore:rules --project <your-project-id>
   ```

### Ending a session

Researcher menu (the task strip → Tasks, or Settings → Study tasks) shows the participant, the session and whether logs are saving.
Tap **End session** before the next participant. A page reload keeps the same session.

### Exporting logs

1. Firebase console → Project settings → Service accounts → Generate new private key.
   Keep this file **outside** the repo. Never commit it.
2. Run:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
   export FIREBASE_PROJECT_ID=<your-project-id>
   npm run logs:export                    # everyone
   npm run logs:export -- --participant P07
   ```
3. Files land in `logs-export/<date>/`: `sessions.csv`, `events.csv`, `events.jsonl`.

This app uses the same Firebase project as the sandbox (`capability-aligned`). Every session and event from this app has `app: "messenger-prototype"`, so the two apps can be told apart in the export.

