import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Inbox as InboxIcon, CheckCheck, Trash2, ExternalLink, BellRing, Filter } from "lucide-react";
import { Card, PageHeader, Badge, Button } from "@/components/ui";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  markNotificationRead,
  markAllNotificationsRead,
  dismissNotification,
} from "@/redux/admin";
import { useToast } from "@/components/Toaster";
import { relativeTime, formatDate, formatTime } from "@/lib/utils";
import type { AdminNotification } from "@/mock-data/admin";

type InboxFilter = "all" | "unread" | AdminNotification["kind"];

const FILTERS: { key: InboxFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "assignment", label: "Assignments" },
  { key: "tracking", label: "Tracking" },
  { key: "event", label: "Events" },
  { key: "system", label: "System" },
];

export default function Inbox() {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const notifications = useAppSelector((s) => s.admin.notifications);
  const [filter, setFilter] = useState<InboxFilter>("all");
  const [selected, setSelected] = useState<string | null>(notifications[0]?.id ?? null);

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (filter === "all") return true;
      if (filter === "unread") return n.unread;
      return n.kind === filter;
    });
  }, [notifications, filter]);

  const sel = notifications.find((n) => n.id === selected) ?? null;
  const unreadCount = notifications.filter((n) => n.unread).length;

  function open(n: AdminNotification) {
    setSelected(n.id);
    if (n.unread) dispatch(markNotificationRead({ id: n.id }));
  }

  function markAll() {
    dispatch(markAllNotificationsRead());
    toast({ title: `Marked ${unreadCount} notifications as read`, tone: "success" });
  }

  function dismiss(id: string) {
    dispatch(dismissNotification({ id }));
    if (selected === id) setSelected(null);
    toast({ title: "Notification dismissed", tone: "info" });
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin · Inbox"
        title="Notifications & alerts"
        subtitle="Declined assignments, overdue check-ins, geo-fence events, and system alerts you need to triage."
        actions={
          <Button variant="ghost" onClick={markAll} disabled={unreadCount === 0}>
            <CheckCheck className="h-4 w-4" /> Mark all read{unreadCount > 0 ? ` (${unreadCount})` : ""}
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px]">
        <Filter className="h-3.5 w-3.5 text-muted" />
        {FILTERS.map((f) => {
          const count =
            f.key === "all" ? notifications.length :
            f.key === "unread" ? unreadCount :
            notifications.filter((n) => n.kind === f.key).length;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-2.5 py-0.5 border transition ${
                filter === f.key ? "border-royal bg-royal text-white" : "border-line text-soft hover:border-royal/40"
              }`}
            >
              {f.label} {count > 0 && <span className="opacity-70">· {count}</span>}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <Card className="lg:col-span-2 p-0 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-10 text-center">
              <InboxIcon className="h-8 w-8 mx-auto text-royal/30" />
              <div className="mt-2 text-sm font-semibold text-soft">Nothing to triage</div>
              <div className="text-[12px] text-muted mt-1">You're all caught up.</div>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {filtered.map((n) => (
                <li
                  key={n.id}
                  onClick={() => open(n)}
                  className={`px-5 py-3 cursor-pointer transition flex items-start gap-3 ${
                    selected === n.id ? "bg-royal/[0.05]" : n.unread ? "bg-canvas/40 hover:bg-canvas/70" : "hover:bg-canvas/40"
                  }`}
                >
                  <span
                    className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                      n.tone === "success" ? "bg-emerald-500" :
                      n.tone === "warning" ? "bg-amber-500" :
                      n.tone === "danger" ? "bg-rose-500" : "bg-royal"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className={`text-sm truncate ${n.unread ? "font-semibold text-soft" : "text-soft/80"}`}>
                        {n.title}
                      </div>
                      <div className="text-[11px] text-muted shrink-0">{relativeTime(n.ts)}</div>
                    </div>
                    <div className="text-[12px] text-muted truncate">{n.detail}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge tone="default">{n.kind}</Badge>
                      {n.unread && <Badge tone="blue">unread</Badge>}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                    className="btn-ghost !p-1.5 shrink-0"
                    title="Dismiss"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="lg:sticky lg:top-20">
          {sel ? (
            <>
              <div className="flex items-start gap-3">
                <BellRing className={`h-5 w-5 mt-0.5 shrink-0 ${
                  sel.tone === "success" ? "text-emerald-600" :
                  sel.tone === "warning" ? "text-amber-600" :
                  sel.tone === "danger" ? "text-rose-600" : "text-royal"
                }`} />
                <div className="min-w-0">
                  <h3 className="font-semibold text-soft">{sel.title}</h3>
                  <div className="text-[11px] text-muted mt-0.5">
                    {formatDate(sel.ts)} · {formatTime(sel.ts)}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone="default">{sel.kind}</Badge>
                <Badge tone={sel.tone === "success" ? "green" : sel.tone === "warning" ? "amber" : sel.tone === "danger" ? "red" : "blue"}>
                  {sel.tone}
                </Badge>
              </div>

              <p className="mt-4 text-sm text-soft leading-relaxed">{sel.detail}</p>

              <div className="mt-5 pt-4 border-t border-line flex flex-col gap-2">
                {sel.linkTo && (
                  <Link to={sel.linkTo} className="btn-primary w-full justify-center">
                    <ExternalLink className="h-4 w-4" /> Take action
                  </Link>
                )}
                <button
                  onClick={() => dismiss(sel.id)}
                  className="btn-ghost w-full justify-center text-rose-700"
                >
                  <Trash2 className="h-4 w-4" /> Dismiss
                </button>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-muted text-sm py-20">
              Pick a notification
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
