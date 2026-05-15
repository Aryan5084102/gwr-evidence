import { AnimatePresence, motion } from "framer-motion";
import { Bell, X, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { useAppDispatch, useAppSelector, setNotificationsOpen } from "@/redux/store";
import { notifications } from "@/mock-data/portal";
import { formatDate, formatTime } from "@/lib/utils";

const TONE_ICON = {
  info: { Icon: Info, cls: "text-royal bg-royal/10" },
  success: { Icon: CheckCircle2, cls: "text-emerald-700 bg-emerald-50" },
  warning: { Icon: AlertTriangle, cls: "text-amber-700 bg-amber-50" },
};

export default function NotificationPanel() {
  const open = useAppSelector((s) => s.ui.notificationsOpen);
  const role = useAppSelector((s) => s.auth.user?.role);
  const dispatch = useAppDispatch();
  const items = notifications.filter((n) => n.role === "all" || n.role === role);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-slate-900/30"
          onClick={() => dispatch(setNotificationsOpen(false))}
        >
          <motion.aside
            initial={{ x: 380 }} animate={{ x: 0 }} exit={{ x: 380 }} transition={{ type: "tween", duration: 0.22 }}
            className="absolute top-0 right-0 h-full w-full max-w-md bg-white border-l border-line shadow-panel flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-16 flex items-center justify-between px-5 border-b border-line">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-royal" />
                <div className="font-semibold text-soft">Notifications</div>
                <span className="chip">{items.filter((i) => i.unread).length} unread</span>
              </div>
              <button onClick={() => dispatch(setNotificationsOpen(false))} className="btn-ghost !p-1.5">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 && (
                <div className="text-sm text-muted text-center py-10">You&rsquo;re all caught up.</div>
              )}
              {items.map((n) => {
                const t = TONE_ICON[n.tone];
                return (
                  <div key={n.id} className={`rounded-xl border border-line p-3.5 ${n.unread ? "bg-white" : "bg-canvas"}`}>
                    <div className="flex items-start gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${t.cls}`}>
                        <t.Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-semibold text-soft">{n.title}</div>
                          {n.unread && <span className="h-2 w-2 rounded-full bg-royal" />}
                        </div>
                        <p className="text-xs text-muted mt-0.5 leading-relaxed">{n.detail}</p>
                        <div className="text-[11px] text-muted mt-1.5">
                          {formatDate(n.ts)} &middot; {formatTime(n.ts)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
