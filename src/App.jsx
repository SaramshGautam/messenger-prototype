import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MessengerApp from "./messenger/MessengerApp.jsx";
import TaskPanel from "./components/TaskPanel.jsx";
import TaskStrip from "./components/TaskStrip.jsx";
import InstallPrompt from "./components/InstallPrompt.jsx";
import data from "./data/scenarios.json";

// URL: ?s=T01-M&step=2  (no ?s = free exploration)
const fromUrl = () => {
  try {
    const q = new URLSearchParams(window.location.search);
    return { s: q.get("s"), step: Number(q.get("step")) || 1 };
  } catch {
    return {};
  }
};

export default function App() {
  const scenarios = data.scenarios ?? [];
  const init = fromUrl();
  const [scenarioId, setScenarioId] = useState(() => (scenarios.some((s) => s.id === init.s) ? init.s : null));
  const [stepIndex, setStepIndex] = useState(() => Math.min(3, Math.max(0, (init.step ?? 1) - 1)));
  const [session, setSession] = useState(0);
  const [showTasks, setShowTasks] = useState(false);
  const [eventLog, setEventLog] = useState([]);
  const [fire, setFire] = useState(null); // researcher-fired scripted event { id, n }

  const scenario = useMemo(() => scenarios.find((s) => s.id === scenarioId) ?? null, [scenarioId, scenarios]);
  const step = scenario?.steps[stepIndex] ?? null;
  const ctxRef = useRef({});
  ctxRef.current = { scenarioId, step: step?.n ?? null, intent: step?.intent ?? null };

  const logEvent = useCallback((type, properties = {}) => {
    const c = ctxRef.current;
    setEventLog((current) => [
      ...current,
      {
        id: crypto.randomUUID?.() ?? String(Date.now() + Math.random()),
        timestamp: new Date().toISOString(),
        scenarioId: c.scenarioId, step: c.step, intent: c.intent,
        type, ...properties,
      },
    ]);
  }, []);

  const syncUrl = (id, idx) => {
    try {
      const url = new URL(window.location.href);
      if (id) { url.searchParams.set("s", id); url.searchParams.set("step", String(idx + 1)); }
      else { url.searchParams.delete("s"); url.searchParams.delete("step"); }
      window.history.replaceState(null, "", url);
    } catch { /* ignore */ }
  };

  // TASK START: fresh data for the scenario.
  const startScenario = (id, idx = 0) => {
    ctxRef.current = { scenarioId: id, step: idx + 1, intent: scenarios.find((s) => s.id === id)?.steps[idx]?.intent };
    setScenarioId(id);
    setStepIndex(idx);
    setSession((n) => n + 1);
    setShowTasks(false);
    logEvent("scenario_started", { selectedScenarioId: id, startStep: idx + 1 });
    syncUrl(id, idx);
  };

  // CONTINUE: keep the participant's screen and changes; only the instruction changes.
  const goToStep = (idx) => {
    if (!scenario || idx < 0 || idx > scenario.steps.length - 1 || idx === stepIndex) return;
    const from = stepIndex + 1;
    ctxRef.current = { scenarioId, step: idx + 1, intent: scenario.steps[idx].intent };
    setStepIndex(idx);
    logEvent("step_changed", { fromStep: from, toStep: idx + 1 });
    syncUrl(scenarioId, idx);
  };

  const freeExplore = () => {
    ctxRef.current = { scenarioId: null, step: null, intent: null };
    setScenarioId(null);
    setSession((n) => n + 1);
    setShowTasks(false);
    logEvent("free_explore_started");
    syncUrl(null, 0);
  };

  // Exposed for automated checks and for recovering a log if the download fails.
  useEffect(() => { window.__sandboxLog = eventLog; }, [eventLog]);

  return (
    <div className="app-shell">
      {scenario && <TaskStrip scenario={scenario} stepIndex={stepIndex} onStep={goToStep} onOpenTasks={() => setShowTasks(true)} />}
      <div className="app-body">
        <MessengerApp
          key={`${scenarioId ?? "free"}-${session}`}
          scenario={scenario}
          step={step?.n ?? 0}
          logEvent={logEvent}
          openTasks={() => setShowTasks(true)}
          fire={fire}
        />
        {showTasks && (
          <TaskPanel
            scenarios={scenarios}
            scenario={scenario}
            stepIndex={stepIndex}
            onStart={startScenario}
            onStep={goToStep}
            onFree={freeExplore}
            onFire={(id) => { setFire((f) => ({ id, n: (f?.n ?? 0) + 1 })); setShowTasks(false); logEvent("trigger_fired_by_researcher", { triggerId: id }); }}
            eventLog={eventLog}
            onClose={() => setShowTasks(false)}
          />
        )}
      </div>
      <InstallPrompt />
    </div>
  );
}
