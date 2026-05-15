import { AnimatePresence, motion } from "framer-motion";
import { Command, X, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector, setPaletteOpen } from "@/redux/store";

type Cmd = { id: string; label: string; group: string; path?: string; role?: ("witness"|"adjudicator"|"organizer"|"admin")[] };

const CMDS: Cmd[] = [
  { id: "go-w-portal", label: "Open Witness Statement", group: "Navigation", path: "/witness", role: ["witness"] },

  { id: "go-a-dash", label: "Go to Dashboard", group: "Navigation", path: "/adjudicator/dashboard", role: ["adjudicator"] },
  { id: "go-a-rev", label: "Open Witness Reviews", group: "Navigation", path: "/adjudicator/witnesses", role: ["adjudicator"] },
  { id: "go-a-att", label: "Open Attempt Reviews", group: "Navigation", path: "/adjudicator/attempts", role: ["adjudicator"] },
  { id: "go-a-ai", label: "Open AI Validation", group: "Navigation", path: "/adjudicator/ai-validation", role: ["adjudicator"] },
  { id: "go-a-clar", label: "Open Clarifications", group: "Navigation", path: "/adjudicator/clarifications", role: ["adjudicator"] },
  { id: "go-a-audit", label: "Open Audit Logs", group: "Navigation", path: "/adjudicator/audit", role: ["adjudicator"] },

  { id: "go-o-dash", label: "Go to Dashboard", group: "Navigation", path: "/organizer/dashboard", role: ["organizer"] },
  { id: "go-o-sub", label: "Open Submissions", group: "Navigation", path: "/organizer/submissions", role: ["organizer"] },
  { id: "go-o-inv", label: "Invite Witnesses", group: "Actions", path: "/organizer/invite", role: ["organizer"] },
  { id: "go-o-up", label: "Upload Evidence", group: "Actions", path: "/organizer/evidence", role: ["organizer"] },
  { id: "go-o-rep", label: "View Reports", group: "Navigation", path: "/organizer/reports", role: ["organizer"] },

  { id: "go-adm-dash", label: "Open Mission Control", group: "Navigation", path: "/admin/dashboard", role: ["admin"] },
  { id: "go-adm-track", label: "Open Live Tracking", group: "Navigation", path: "/admin/tracking", role: ["admin"] },
  { id: "go-adm-events", label: "Open Events", group: "Navigation", path: "/admin/events", role: ["admin"] },
  { id: "go-adm-adj", label: "Open Adjudicator Roster", group: "Navigation", path: "/admin/adjudicators", role: ["admin"] },
  { id: "go-adm-asn", label: "Manage Assignments", group: "Actions", path: "/admin/assignments", role: ["admin"] },
  { id: "go-adm-cal", label: "Open Availability Calendar", group: "Navigation", path: "/admin/calendar", role: ["admin"] },
  { id: "go-adm-anl", label: "Open Analytics", group: "Navigation", path: "/admin/analytics", role: ["admin"] },
  { id: "go-adm-inb", label: "Open Inbox", group: "Navigation", path: "/admin/inbox", role: ["admin"] },
  { id: "go-adm-audit", label: "Open Audit Log", group: "Navigation", path: "/admin/audit", role: ["admin"] },

  { id: "settings", label: "Open Settings", group: "Account" },
  { id: "notifications", label: "Open Notifications", group: "Account" },
];

export default function CommandPalette() {
  const open = useAppSelector((s) => s.ui.paletteOpen);
  const role = useAppSelector((s) => s.auth.user?.role);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  useEffect(() => { if (!open) setQ(""); }, [open]);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") dispatch(setPaletteOpen(false));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  if (!role) return null;
  const filtered = CMDS
    .filter((c) => !c.role || c.role.includes(role))
    .filter((c) => c.label.toLowerCase().includes(q.toLowerCase()));

  const grouped = filtered.reduce<Record<string, Cmd[]>>((acc, c) => {
    (acc[c.group] ||= []).push(c);
    return acc;
  }, {});

  function run(c: Cmd) {
    dispatch(setPaletteOpen(false));
    if (c.path) navigate(c.path);
    else if (c.id === "settings") navigate(`/${role}/settings`);
    else if (c.id === "notifications") navigate(role === "witness" ? "/witness" : `/${role}/dashboard`);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm p-4 md:pt-28"
          onClick={() => dispatch(setPaletteOpen(false))}
        >
          <motion.div
            initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="panel max-w-xl mx-auto p-2 shadow-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-3 py-2">
              <Command className="h-4 w-4 text-royal" />
              <input
                autoFocus value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Type a command&hellip;"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted"
              />
              <button onClick={() => dispatch(setPaletteOpen(false))} className="btn-ghost !p-1.5">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="border-t border-line mt-1 pt-2 max-h-[60vh] overflow-y-auto">
              {Object.entries(grouped).map(([g, items]) => (
                <div key={g} className="mb-2">
                  <div className="px-3 text-[10px] uppercase tracking-wider text-muted mb-1">{g}</div>
                  {items.map((c) => (
                    <button
                      key={c.id} onClick={() => run(c)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-canvas text-sm text-left text-soft"
                    >
                      <span>{c.label}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted" />
                    </button>
                  ))}
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="px-3 py-6 text-center text-sm text-muted">No matching commands.</div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
