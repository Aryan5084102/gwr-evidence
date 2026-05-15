import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

interface Props {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export default function Modal({ open, title, subtitle, onClose, children, footer, size = "md" }: Props) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const maxW = size === "sm" ? "max-w-md" : size === "lg" ? "max-w-3xl" : "max-w-xl";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[65] bg-slate-900/45 backdrop-blur-sm overflow-y-auto"
          onClick={onClose}
        >
          <div className="min-h-full flex items-center justify-center p-4 sm:p-8">
            <motion.div
              initial={{ y: 12, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 12, opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
              className={`panel w-full ${maxW} shadow-panel my-auto`}
            >
            <div className="flex items-start justify-between p-5 border-b border-line">
              <div className="min-w-0">
                <h3 className="font-semibold text-soft truncate">{title}</h3>
                {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
              </div>
              <button onClick={onClose} className="btn-ghost !p-1.5" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5">{children}</div>
            {footer && (
              <div className="px-5 py-4 border-t border-line bg-canvas/40 flex justify-end gap-2 rounded-b-2xl">
                {footer}
              </div>
            )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
