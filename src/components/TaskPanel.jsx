import { useState } from "react";
import { CheckCircle2, Circle, Download, X, RotateCcw, Zap, ChevronLeft, ChevronRight, Compass } from "lucide-react";
import { researcherTriggers } from "../messenger/scenarios.js";

// Researcher menu. Starting a scenario resets that app to the scenario's
// TASK START state. Moving between steps keeps the participant's state.
export default function TaskPanel({ scenarios, scenario, stepIndex, onStart, onStep, onFree, onFire, eventLog, onClose }) {
  const [open, setOpen] = useState(scenario?.id ?? null);
  const shown = scenarios;
  const triggers = scenario ? researcherTriggers(scenario.id) : [];

  const downloadLog = () => {
    const blob = new Blob([JSON.stringify(eventLog, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `messenger-events-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="task-overlay" role="dialog" aria-label="Study tasks">
      <div className="task-overlay-head">
        <div>
          <h2>Study tasks</h2>
          <span>Starting a task resets the app. Steps 2–4 continue from where the participant is.</span>
        </div>
        <button className="icon-button" onClick={onClose} aria-label="Close"><X size={22} /></button>
      </div>

      {scenario && (
        <div className="task-current">
          <strong>Now: Task {scenario.number} ({scenario.id}) · Step {stepIndex + 1} · {scenario.steps[stepIndex].intent}</strong>
          <div className="task-tools">
            <button className="secondary-button" disabled={stepIndex === 0} onClick={() => onStep(stepIndex - 1)}><ChevronLeft size={16} />Previous step</button>
            <button className="secondary-button" disabled={stepIndex === scenario.steps.length - 1} onClick={() => onStep(stepIndex + 1)}>Next step<ChevronRight size={16} /></button>
            <button className="secondary-button" onClick={() => onStart(scenario.id)}><RotateCcw size={16} />Restart task</button>
          </div>
          {triggers.length > 0 && (
            <div className="task-triggers">
              <small>Scripted events (fire manually only if one did not happen):</small>
              {triggers.map((t) => (
                <button key={t.id} className="secondary-button" onClick={() => onFire(t.id)}><Zap size={15} />{t.label}</button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="task-tools">
        <button className="secondary-button" onClick={downloadLog}><Download size={16} />Log ({eventLog.length})</button>
        <button className="secondary-button" onClick={onFree}><Compass size={16} />Free explore</button>
      </div>

      <div className="task-list">
        {shown.map((s) => {
          const active = scenario?.id === s.id;
          return (
            <div key={s.id} className={active ? "task-card selected" : "task-card"}>
              <button className="task-card-main" onClick={() => setOpen(open === s.id ? null : s.id)}>
                {active ? <CheckCircle2 /> : <Circle />}
                <span>
                  <em>Task {s.number} · {s.id}</em>
                  <strong>{s.steps[0].goal}</strong>
                </span>
              </button>
              {open === s.id && (
                <div className="task-card-body">
                  <p className="task-bg">{s.background}</p>
                  <ol>
                    {s.steps.map((st, i) => (
                      <li key={i}>
                        <b>{st.intent}:</b> {st.goal}
                        <small>Correct outcome: {st.outcome}</small>
                      </li>
                    ))}
                  </ol>
                  <div className="task-tools">
                    <button className="primary-button" onClick={() => onStart(s.id)}>Start task {s.number}</button>
                    {[1, 2, 3].map((i) => (
                      <button key={i} className="secondary-button" onClick={() => onStart(s.id, i)} title="Starts fresh at this step (for piloting)">Pilot from step {i + 1}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
