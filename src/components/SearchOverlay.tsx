import { AnimatePresence, motion } from "framer-motion";
import { Search, Sparkles, X } from "lucide-react";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector, setSearchOpen } from "@/redux/store";

const SUGGESTIONS = [
  "Show all crowd images after midnight",
  "Find videos lacking timestamps",
  "Witness statements mentioning the timekeeper",
  "Duplicate aerial footage in submission 0411",
  "Evidence flagged with confidence < 70%",
];

export default function SearchOverlay() {
  const open = useAppSelector((s) => s.ui.searchOpen);
  const dispatch = useAppDispatch();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        dispatch(setSearchOpen(!open));
      }
      if (e.key === "Escape") dispatch(setSearchOpen(false));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dispatch]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm p-4 md:pt-32"
          onClick={() => dispatch(setSearchOpen(false))}
        >
          <motion.div
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="panel max-w-2xl mx-auto p-2 shadow-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-3 py-2">
              <Sparkles className="h-4 w-4 text-royal" />
              <input
                autoFocus
                placeholder="Ask the AI anything about your evidence…"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted"
              />
              <button onClick={() => dispatch(setSearchOpen(false))} className="btn-ghost !p-1.5">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="border-t border-line mt-1 pt-2">
              <div className="px-3 text-[10px] uppercase tracking-wider text-muted mb-1">AI Suggestions</div>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-canvas text-sm text-left text-soft"
                >
                  <Search className="h-3.5 w-3.5 text-muted" />
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
