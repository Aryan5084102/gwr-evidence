import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

interface Props {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "primary",
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel, onConfirm]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[70] bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ y: 8, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 8, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            onClick={(e) => e.stopPropagation()}
            className="panel max-w-md w-full p-6 shadow-panel"
          >
            <div className="flex items-start gap-3">
              <div
                className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                  tone === "danger" ? "bg-rose-50 text-rose-600" : "bg-royal/10 text-royal"
                }`}
              >
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-soft">{title}</h3>
                {description && (
                  <p className="text-sm text-muted mt-1 leading-relaxed">{description}</p>
                )}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button onClick={onCancel} className="btn-ghost">{cancelLabel}</button>
              <button
                onClick={onConfirm}
                className={
                  tone === "danger"
                    ? "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 transition"
                    : "btn-primary"
                }
              >
                {confirmLabel}
              </button>
            </div>
            <div className="mt-3 text-[10px] text-muted text-right">
              <kbd className="px-1 py-0.5 rounded bg-canvas border border-line">Enter</kbd> confirm ·
              <kbd className="ml-1 px-1 py-0.5 rounded bg-canvas border border-line">Esc</kbd> cancel
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
