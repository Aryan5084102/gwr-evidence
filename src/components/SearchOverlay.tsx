import { AnimatePresence, motion } from "framer-motion";
import { Search, Sparkles, X, FileText, Users, ClipboardList } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector, setSearchOpen } from "@/redux/store";
import { attempts, witnesses, evidence } from "@/mock-data/portal";

export default function SearchOverlay() {
  const open = useAppSelector((s) => s.ui.searchOpen);
  const role = useAppSelector((s) => s.auth.user?.role);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dispatch(setSearchOpen(false));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  useEffect(() => { if (!open) setQ(""); }, [open]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return null;
    return {
      attempts: attempts.filter((a) => `${a.title} ${a.id} ${a.organizer}`.toLowerCase().includes(term)).slice(0, 4),
      witnesses: witnesses.filter((w) => `${w.name} ${w.organization}`.toLowerCase().includes(term)).slice(0, 4),
      evidence: evidence.filter((e) => `${e.name} ${e.id}`.toLowerCase().includes(term)).slice(0, 4),
    };
  }, [q]);

  function go(path: string) {
    dispatch(setSearchOpen(false));
    navigate(path);
  }

  const base = role ? `/${role}` : "/witness";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm p-4 md:pt-32"
          onClick={() => dispatch(setSearchOpen(false))}
        >
          <motion.div
            initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="panel max-w-2xl mx-auto p-2 shadow-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-3 py-2">
              <Sparkles className="h-4 w-4 text-royal" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search witnesses, attempts, evidence&hellip;"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted"
              />
              <button onClick={() => dispatch(setSearchOpen(false))} className="btn-ghost !p-1.5">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="border-t border-line mt-1 pt-2 max-h-[60vh] overflow-y-auto">
              {!results && (
                <>
                  <div className="px-3 text-[10px] uppercase tracking-wider text-muted mb-1">Suggestions</div>
                  {[
                    "Witnesses awaiting approval",
                    "Attempts with timeline gaps",
                    "Evidence flagged by AI",
                    "Clarifications open this week",
                    "Approved record attempts",
                  ].map((s) => (
                    <button
                      key={s}
                      onClick={() => setQ(s.split(" ")[0])}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-canvas text-sm text-left text-soft"
                    >
                      <Search className="h-3.5 w-3.5 text-muted" />
                      {s}
                    </button>
                  ))}
                </>
              )}
              {results && (
                <div className="space-y-3">
                  <ResultGroup
                    title="Attempts" Icon={ClipboardList} empty={results.attempts.length === 0}
                    items={results.attempts.map((a) => ({
                      key: a.id, primary: a.title, secondary: `${a.id} · ${a.organizer}`,
                      onClick: () => go(`${base}/attempts`),
                    }))}
                  />
                  <ResultGroup
                    title="Witnesses" Icon={Users} empty={results.witnesses.length === 0}
                    items={results.witnesses.map((w) => ({
                      key: w.id, primary: w.name, secondary: `${w.organization} · ${w.status}`,
                      onClick: () => go(role === "adjudicator" ? `/adjudicator/witnesses` : `${base}/attempts`),
                    }))}
                  />
                  <ResultGroup
                    title="Evidence" Icon={FileText} empty={results.evidence.length === 0}
                    items={results.evidence.map((e) => ({
                      key: e.id, primary: e.name, secondary: `${e.id} · ${e.kind} · ${e.size}`,
                      onClick: () => go(role === "witness" ? "/witness/evidence" : `${base}/evidence`),
                    }))}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ResultGroup({
  title, Icon, items, empty,
}: {
  title: string; Icon: any; empty: boolean;
  items: { key: string; primary: string; secondary: string; onClick: () => void }[];
}) {
  if (empty) return null;
  return (
    <div>
      <div className="px-3 text-[10px] uppercase tracking-wider text-muted mb-1 flex items-center gap-1.5">
        <Icon className="h-3 w-3" /> {title}
      </div>
      {items.map((i) => (
        <button
          key={i.key} onClick={i.onClick}
          className="w-full flex flex-col items-start px-3 py-2 rounded-lg hover:bg-canvas text-left"
        >
          <div className="text-sm text-soft">{i.primary}</div>
          <div className="text-[11px] text-muted">{i.secondary}</div>
        </button>
      ))}
    </div>
  );
}
