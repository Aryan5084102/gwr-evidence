import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Inbox as InboxIcon, CheckCheck, BellRing, ExternalLink, Filter, Loader2, AlertTriangle } from "lucide-react";
import { Card, PageHeader, Badge, Button } from "@/components/ui";
import { useToast } from "@/components/Toaster";
import { notificationsApi } from "@/lib/api/resources";
import { ApiError } from "@/lib/api";
import { relativeTime, formatDate, formatTime } from "@/lib/utils";

type InboxFilter = "all" | "unread";

const FILTERS: { key: InboxFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
];

export default function Inbox() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const notifQ = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.list(),
    refetchInterval: 20_000,
  });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllReadMut = useMutation({
    mutationFn: async () => {
      const unreadIds = (notifQ.data ?? []).filter((n) => !n.read_at).map((n) => n.id);
      await Promise.all(unreadIds.map((id) => notificationsApi.markRead(id)));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const [filter, setFilter] = useState<InboxFilter>("all");
  const [selected, setSelected] = useState<string | null>(null);

  const notifications = notifQ.data ?? [];

  // Auto-select first item when data loads
  if (!selected && notifications[0]) setSelected(notifications[0].id);

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (filter === "unread") return !n.read_at;
      return true;
    });
  }, [notifications, filter]);

  const sel = notifications.find((n) => n.id === selected) ?? null;
  const unreadCount = notifications.filter((n) => !n.read_at).length;

  function open(id: string, unread: boolean) {
    setSelected(id);
    if (unread) markRead.mutate(id);
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin · Inbox"
        title="Notifications & alerts"
        subtitle="Live from /notifications. Auto-refreshes every 20 seconds."
        actions={
          <Button variant="ghost" onClick={() => markAllReadMut.mutate()} disabled={unreadCount === 0 || markAllReadMut.isPending}>
            <CheckCheck className="h-4 w-4" /> Mark all read{unreadCount > 0 ? ` (${unreadCount})` : ""}
          </Button>
        }
      />

      {notifQ.isError && (
        <Card className="mb-5">
          <div className="rounded-lg bg-rose-50 border border-rose-200 text-rose-700 p-3 text-sm inline-flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {notifQ.error instanceof ApiError ? notifQ.error.message : "Couldn't reach /notifications"}
          </div>
        </Card>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px]">
        <Filter className="h-3.5 w-3.5 text-muted" />
        {FILTERS.map((f) => {
          const count = f.key === "all" ? notifications.length : unreadCount;
          return (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`rounded-full px-2.5 py-0.5 border transition ${filter === f.key ? "border-royal bg-royal text-white" : "border-line text-soft hover:border-royal/40"}`}>
              {f.label} {count > 0 && <span className="opacity-70">· {count}</span>}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <Card className="lg:col-span-2 p-0 overflow-hidden">
          {notifQ.isLoading && (
            <div className="py-12 flex items-center justify-center gap-2 text-muted">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          )}
          {!notifQ.isLoading && filtered.length === 0 && (
            <div className="p-10 text-center">
              <InboxIcon className="h-8 w-8 mx-auto text-royal/30" />
              <div className="mt-2 text-sm font-semibold text-soft">Nothing to triage</div>
              <div className="text-[12px] text-muted mt-1">
                {notifications.length === 0 ? "Your inbox is empty." : "All caught up — no unread notifications."}
              </div>
            </div>
          )}
          {!notifQ.isLoading && filtered.length > 0 && (
            <ul className="divide-y divide-line">
              {filtered.map((n) => {
                const unread = !n.read_at;
                return (
                  <li key={n.id} onClick={() => open(n.id, unread)}
                    className={`px-5 py-3 cursor-pointer transition flex items-start gap-3 ${selected === n.id ? "bg-royal/[0.05]" : unread ? "bg-canvas/40 hover:bg-canvas/70" : "hover:bg-canvas/40"}`}>
                    <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                      n.tone === "success" ? "bg-emerald-500" :
                      n.tone === "warning" ? "bg-amber-500" :
                      n.tone === "danger" || n.tone === "error" ? "bg-rose-500" : "bg-royal"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className={`text-sm truncate ${unread ? "font-semibold text-soft" : "text-soft/80"}`}>{n.title}</div>
                        <div className="text-[11px] text-muted shrink-0">{relativeTime(n.created_at)}</div>
                      </div>
                      {n.detail && <div className="text-[12px] text-muted truncate">{n.detail}</div>}
                      {unread && <div className="mt-1"><Badge tone="blue">unread</Badge></div>}
                    </div>
                  </li>
                );
              })}
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
                  sel.tone === "danger" || sel.tone === "error" ? "text-rose-600" : "text-royal"
                }`} />
                <div className="min-w-0">
                  <h3 className="font-semibold text-soft">{sel.title}</h3>
                  <div className="text-[11px] text-muted mt-0.5">{formatDate(sel.created_at)} · {formatTime(sel.created_at)}</div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone={sel.tone === "success" ? "green" : sel.tone === "warning" ? "amber" : sel.tone === "danger" || sel.tone === "error" ? "red" : "blue"}>
                  {sel.tone}
                </Badge>
                {!sel.read_at && <Badge tone="blue">unread</Badge>}
              </div>

              {sel.detail && <p className="mt-4 text-sm text-soft leading-relaxed">{sel.detail}</p>}

              {sel.link && (
                <div className="mt-5 pt-4 border-t border-line">
                  <Link to={sel.link} className="btn-primary w-full justify-center">
                    <ExternalLink className="h-4 w-4" /> Take action
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-muted text-sm py-20">Pick a notification</div>
          )}
        </Card>
      </div>
    </>
  );
}
