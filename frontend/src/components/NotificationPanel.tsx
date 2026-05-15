import { AnimatePresence, motion } from "framer-motion";
import { Bell, X, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector, setNotificationsOpen } from "@/redux/store";
import { notificationsApi } from "@/lib/api/resources";
import { formatDate, formatTime, relativeTime } from "@/lib/utils";

const TONE_ICON: Record<string, { Icon: any; cls: string }> = {
  info: { Icon: Info, cls: "text-royal bg-royal/10" },
  success: { Icon: CheckCircle2, cls: "text-emerald-700 bg-emerald-50" },
  warning: { Icon: AlertTriangle, cls: "text-amber-700 bg-amber-50" },
  danger: { Icon: AlertTriangle, cls: "text-rose-700 bg-rose-50" },
};

export default function NotificationPanel() {
  const open = useAppSelector((s) => s.ui.notificationsOpen);
  const isAuthed = useAppSelector((s) => s.auth.isAuthenticated);
  const dispatch = useAppDispatch();
  const qc = useQueryClient();

  const { data: items = [], isLoading, isError } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.list(),
    enabled: open && isAuthed,
    refetchOnWindowFocus: false,
  });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unreadCount = items.filter((i) => !i.read_at).length;

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
                <span className="chip">{unreadCount} unread</span>
              </div>
              <button onClick={() => dispatch(setNotificationsOpen(false))} className="btn-ghost !p-1.5">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoading && <div className="text-sm text-muted text-center py-10">Loading…</div>}
              {isError && (
                <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3">
                  Couldn't load notifications from the backend.
                </div>
              )}
              {!isLoading && !isError && items.length === 0 && (
                <div className="text-sm text-muted text-center py-10">You&rsquo;re all caught up.</div>
              )}
              {items.map((n) => {
                const tone = (TONE_ICON[n.tone] ?? TONE_ICON.info);
                const unread = !n.read_at;
                return (
                  <button
                    key={n.id}
                    onClick={() => unread && markRead.mutate(n.id)}
                    className={`text-left w-full rounded-xl border border-line p-3.5 transition ${unread ? "bg-white hover:bg-canvas/40" : "bg-canvas"}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${tone.cls}`}>
                        <tone.Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-semibold text-soft truncate">{n.title}</div>
                          {unread && <span className="h-2 w-2 rounded-full bg-royal shrink-0" />}
                        </div>
                        {n.detail && (
                          <p className="text-xs text-muted mt-0.5 leading-relaxed">{n.detail}</p>
                        )}
                        <div className="text-[11px] text-muted mt-1.5">
                          {relativeTime(n.created_at)} · {formatDate(n.created_at)} {formatTime(n.created_at)}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
