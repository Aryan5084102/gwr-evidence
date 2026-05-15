import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, AlertTriangle, X, XCircle } from "lucide-react";

export type ToastTone = "success" | "info" | "warning" | "danger";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  tone?: ToastTone;
  durationMs?: number;
  action?: { label: string; onClick: () => void };
}

interface Ctx {
  toast: (t: Omit<Toast, "id">) => string;
  dismiss: (id: string) => void;
}

const ToastCtx = createContext<Ctx | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside <ToasterProvider>");
  return ctx;
}

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((xs) => xs.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const next: Toast = { tone: "info", durationMs: 3600, ...t, id };
      setItems((xs) => [...xs, next]);
      return id;
    },
    []
  );

  return (
    <ToastCtx.Provider value={{ toast, dismiss }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[80] flex flex-col gap-2 max-w-sm w-[calc(100vw-2.5rem)]">
        <AnimatePresence>
          {items.map((t) => (
            <ToastItem key={t.id} t={t} onDone={() => dismiss(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

function ToastItem({ t, onDone }: { t: Toast; onDone: () => void }) {
  useEffect(() => {
    const id = setTimeout(onDone, t.durationMs ?? 3600);
    return () => clearTimeout(id);
  }, [t.durationMs, onDone]);

  const Icon =
    t.tone === "success" ? CheckCircle2 :
    t.tone === "warning" ? AlertTriangle :
    t.tone === "danger" ? XCircle : Info;

  const accent =
    t.tone === "success" ? "bg-emerald-500" :
    t.tone === "warning" ? "bg-amber-500" :
    t.tone === "danger" ? "bg-rose-500" : "bg-royal";

  const iconColor =
    t.tone === "success" ? "text-emerald-600" :
    t.tone === "warning" ? "text-amber-600" :
    t.tone === "danger" ? "text-rose-600" : "text-royal";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 360, damping: 26 }}
      className="relative overflow-hidden rounded-xl bg-white border border-line shadow-panel pl-3 pr-3 py-3 flex items-start gap-3"
    >
      <span className={`absolute left-0 top-0 bottom-0 w-1 ${accent}`} />
      <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${iconColor}`} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-soft truncate">{t.title}</div>
        {t.description && (
          <div className="text-[12px] text-muted mt-0.5 leading-snug">{t.description}</div>
        )}
        {t.action && (
          <button
            onClick={() => {
              t.action!.onClick();
              onDone();
            }}
            className="mt-1.5 text-[12px] font-semibold text-royal hover:underline"
          >
            {t.action.label}
          </button>
        )}
      </div>
      <button
        onClick={onDone}
        className="text-muted hover:text-soft transition shrink-0"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}
