import { createContext, useContext, useEffect, useRef } from "react";
import { Users, X } from "lucide-react";
import Avatar from "../components/Avatar.jsx";
import { contact } from "./store.js";


export const MContext = createContext(null);
export const useM = () => useContext(MContext);

export function PersonAvatar({ id, size }) {
  const { world } = useM();
  const c = contact(world, id);
  if (c.unsaved) return <span className={`avatar wa-unknown ${size ? `avatar-${size}` : ""}`} aria-label={c.name}><Users size={size === "xl" ? 40 : 20} /></span>;
  return <Avatar src={c.avatar} name={c.name} size={size} />;
}

export function ConvAvatar({ conv, size }) {
  if (conv.kind === "dm") return <PersonAvatar id={conv.with} size={size} />;
  const initials = conv.title.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return <span className={`avatar wa-group-avatar ${size ? `avatar-${size}` : ""}`} style={{ background: conv.color ?? "#2e7d6b" }} aria-hidden>{initials}</span>;
}

export function fmtDuration(sec = 0) {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// ---------- shared helpers (sheets, long-press, copy) ----------
export async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export function Sheet({ title, onClose, children, className = "" }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className={`sheet ${className}`} role="dialog" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grip" />
        {title && (
          <div className="sheet-head">
            <strong>{title}</strong>
            <button className="icon-button" onClick={onClose} aria-label="Close"><X size={20} /></button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function SheetItem({ icon: Icon, label, sub, onClick, danger }) {
  return (
    <button className={danger ? "sheet-item danger" : "sheet-item"} onClick={onClick}>
      {Icon && <span className="sheet-item-icon"><Icon size={20} /></span>}
      <span><strong>{label}</strong>{sub && <small>{sub}</small>}</span>
    </button>
  );
}

export function useLongPress(onLong, onClick, ms = 450) {
  const timer = useRef(null);
  const fired = useRef(false);
  const start = useRef(null);
  const clear = () => { clearTimeout(timer.current); timer.current = null; };
  return {
    onPointerDown: (e) => {
      fired.current = false;
      start.current = { x: e.clientX, y: e.clientY };
      clear();
      timer.current = setTimeout(() => { fired.current = true; onLong(e); }, ms);
    },
    onPointerMove: (e) => {
      if (start.current && Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y) > 10) clear();
    },
    onPointerUp: clear,
    onPointerLeave: clear,
    onPointerCancel: clear,
    onContextMenu: (e) => { e.preventDefault(); if (!fired.current) { fired.current = true; clear(); onLong(e); } },
    // Capture phase so a long-press never also "clicks" a child (e.g. a shared post card).
    onClickCapture: (e) => { if (fired.current) { e.preventDefault(); e.stopPropagation(); fired.current = false; } },
    onClick: (e) => onClick?.(e),
  };
}
