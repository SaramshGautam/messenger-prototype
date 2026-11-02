import { useState } from "react";
import { Cloud, CloudOff, UserRound } from "lucide-react";
import { remoteEnabled } from "../lib/remoteLog.js";

// Shown before anything else: the researcher enters the participant ID so every
// logged interaction is tied to that person (by ID only, never by name).
export default function SessionGate({ onStart }) {
  const [pid, setPid] = useState("");
  const [researcher, setResearcher] = useState("");
  const valid = /^[A-Za-z0-9_-]{2,20}$/.test(pid.trim());
  const start = (practice) => onStart({ participantId: practice ? "PRACTICE" : pid.trim().toUpperCase(), researcher: researcher.trim(), practice });
  return (
    <div className="session-gate" role="dialog" aria-label="Start a study session">
      <form className="session-card" onSubmit={(e) => { e.preventDefault(); if (valid) start(false); }}>
        <span className="session-icon"><UserRound size={30} /></span>
        <h2>Start a study session</h2>
        <p>For the researcher. Enter the participant’s ID (not their name) before handing over the phone.</p>
        <label>Participant ID
          <input value={pid} onChange={(e) => setPid(e.target.value)} placeholder="e.g. P07" autoFocus autoCapitalize="characters" aria-label="Participant ID" />
        </label>
        <label>Researcher initials (optional)
          <input value={researcher} onChange={(e) => setResearcher(e.target.value)} placeholder="e.g. SG" aria-label="Researcher initials" />
        </label>
        <button type="submit" className="primary-button big" disabled={!valid}>Start session</button>
        <button type="button" className="link" onClick={() => start(true)}>Practice without saving</button>
        <small className={remoteEnabled ? "status ok" : "status off"}>
          {remoteEnabled ? <><Cloud size={14} /> Interactions will be saved to the study database.</> : <><CloudOff size={14} /> Cloud logging is not set up; logs stay on this device (download them from the researcher menu).</>}
        </small>
      </form>
    </div>
  );
}
