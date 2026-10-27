import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";

// Instruction banner shown above both apps. The researcher moves between the
// four steps of a scenario with the small arrows (the app state is kept).
export default function TaskStrip({ scenario, stepIndex, onStep, onOpenTasks }) {
  const [open, setOpen] = useState(true);
  const [bg, setBg] = useState(stepIndex === 0);
  const step = scenario.steps[stepIndex];
  useEffect(() => { setOpen(true); setBg(stepIndex === 0); }, [stepIndex, scenario.id]);
  const last = scenario.steps.length - 1;
  return (
    <div className={open ? "task-strip" : "task-strip collapsed"}>
      <div className="task-strip-row">
        <button className="task-strip-toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          <strong>Task {scenario.number} · Step {stepIndex + 1} of {scenario.steps.length}</strong>
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <span className="task-strip-nav" aria-label="Researcher step controls">
          <button onClick={() => onStep(stepIndex - 1)} disabled={stepIndex === 0} aria-label="Previous step"><ChevronLeft size={16} /></button>
          <button onDoubleClick={onOpenTasks} title="Double-tap for study menu" aria-label="Study menu" className="task-strip-dots">
            {scenario.steps.map((s, i) => <i key={i} className={i === stepIndex ? "on" : i < stepIndex ? "done" : ""} />)}
          </button>
          <button onClick={() => onStep(stepIndex + 1)} disabled={stepIndex === last} aria-label="Next step"><ChevronRight size={16} /></button>
        </span>
      </div>
      {open && (
        <>
          {bg && <p className="task-strip-bg">{scenario.background}</p>}
          <p className="task-strip-goal">{step.goal}</p>
          {stepIndex > 0 && (
            <button className="task-strip-more" onClick={() => setBg((v) => !v)}>{bg ? "Hide background" : "Show background"}</button>
          )}
        </>
      )}
    </div>
  );
}
