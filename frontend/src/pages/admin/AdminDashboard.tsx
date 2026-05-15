import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarCheck, Gavel, Plane, MapPin as PinIcon, ShieldCheck, AlertTriangle,
  ArrowRight, TrendingUp, Clock, Inbox,
} from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/ui";
import StatCard from "@/components/StatCard";
import WorldMap, { type MapPin } from "@/components/WorldMap";
import { useAppSelector } from "@/redux/store";
import {
  adminEventsApi, adminAdjudicatorsApi, adminAssignmentsApi, trackingApi,
} from "@/lib/api/admin";
import { notificationsApi, auditApi } from "@/lib/api/resources";
import { formatDate, computeSla, relativeTime } from "@/lib/utils";

const TRAVEL_TONE: Record<string, "green" | "blue" | "gold" | "amber" | "red" | "default"> = {
  Available: "green", Assigned: "blue", Travelling: "gold",
  "On-site": "green", Completed: "default", "Off-duty": "default",
};

export default function AdminDashboard() {
  const user = useAppSelector((s) => s.auth.user);
  const settings = useAppSelector((s) => s.admin.settings);

  const eventsQ = useQuery({ queryKey: ["admin", "events"], queryFn: () => adminEventsApi.list() });
  const adjQ = useQuery({ queryKey: ["admin", "adjudicators"], queryFn: () => adminAdjudicatorsApi.list() });
  const asnQ = useQuery({ queryKey: ["admin", "assignments"], queryFn: () => adminAssignmentsApi.list() });
  const locQ = useQuery({
    queryKey: ["admin", "locations"],
    queryFn: () => trackingApi.listLocations(),
    refetchInterval: 12000,
  });
  const notifQ = useQuery({ queryKey: ["notifications"], queryFn: () => notificationsApi.list() });
  const auditQ = useQuery({ queryKey: ["audit", 1, 8], queryFn: () => auditApi.list(1, 8) });

  const events = eventsQ.data ?? [];
  const adjudicators = adjQ.data ?? [];
  const assignments = asnQ.data ?? [];
  const locations = locQ.data ?? [];
  const notifications = notifQ.data ?? [];
  const audit = auditQ.data ?? [];

  const liveEvents = events.filter((e) => e.status === "Live").length;
  const scheduled = events.filter((e) => e.status === "Scheduled").length;
  const onTheMove = locations.filter((l) => l.travel_status === "Travelling").length;
  const onSite = locations.filter((l) => l.travel_status === "On-site").length;
  const unread = notifications.filter((n) => !n.read_at).length;

  const now = Date.now();
  const upcoming = [...events]
    .filter((e) => e.start_iso && new Date(e.start_iso).getTime() > now && e.status !== "Cancelled")
    .sort((a, b) => new Date(a.start_iso!).getTime() - new Date(b.start_iso!).getTime())[0];

  const understaffed = events
    .filter((e) => e.status !== "Completed" && e.status !== "Cancelled")
    .map((e) => {
      const assigned = assignments.filter((a) => a.event_id === e.id).length;
      const sla = e.start_iso ? computeSla(e.start_iso, settings.leadAssignmentSlaDays) : null;
      return { event: e, assigned, missing: Math.max(0, e.required_adjudicators - assigned), sla };
    })
    .filter((c) => c.missing > 0)
    .sort((a, b) => (a.sla?.daysUntil ?? 999) - (b.sla?.daysUntil ?? 999));

  const eventPins: MapPin[] = events
    .filter((e) => e.status === "Live" || e.status === "Scheduled")
    .map((e) => ({
      id: `evt-${e.id}`, lat: e.lat, lon: e.lon,
      label: e.city ?? e.id,
      sublabel: e.title.slice(0, 38) + (e.title.length > 38 ? "…" : ""),
      tone: e.status === "Live" ? "red" : "amber",
      pulse: e.status === "Live",
    }));

  const adjPins: MapPin[] = locations.map((l) => {
    const tone = TRAVEL_TONE[l.travel_status];
    const adj = adjudicators.find((a) => a.id === l.adjudicator_id);
    return {
      id: `adj-${l.adjudicator_id}`,
      lat: l.lat, lon: l.lon,
      label: adj?.name ?? l.adjudicator_id,
      sublabel: `${l.travel_status} · ${l.city ?? ""}`,
      tone: tone === "default" ? "muted" : (tone as MapPin["tone"]),
      pulse: l.travel_status === "On-site",
    };
  });

  return (
    <>
      <PageHeader
        eyebrow="GWR · Global Operations"
        title={`Mission control, ${user?.name?.split(" ")[0] ?? "Admin"}.`}
        subtitle="Live overview of record attempts, adjudicator coverage, and field telemetry across every region."
        actions={
          <>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] text-emerald-700">
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500">
                <span className="absolute inset-0 rounded-full bg-emerald-500 opacity-60 animate-ping" />
              </span>
              <span className="font-semibold">LIVE</span>
              <span>{onTheMove + onSite} field staff active</span>
            </div>
            <Link to="/admin/inbox" className="btn-ghost relative">
              <Inbox className="h-4 w-4" /> Inbox
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">{unread}</span>
              )}
            </Link>
            <Link to="/admin/assignments" className="btn-ghost"><Gavel className="h-4 w-4" /> Assignments</Link>
            <Link to="/admin/tracking" className="btn-primary"><PinIcon className="h-4 w-4" /> Live tracking</Link>
          </>
        }
      />

      {upcoming && (
        <div className="mb-6 rounded-xl border border-royal/20 bg-gradient-to-r from-royal/[0.06] to-gold/[0.06] p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-lg bg-royal/10 text-royal flex items-center justify-center"><Clock className="h-5 w-5" /></div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-royal font-bold">
                Next event · {relativeTime(upcoming.start_iso!)}
              </div>
              <div className="font-semibold text-soft truncate">{upcoming.title}</div>
              <div className="text-[11px] text-muted">
                {upcoming.city ?? "—"}, {upcoming.country ?? "—"} · {formatDate(upcoming.start_iso!)} · {Math.max(0, upcoming.required_adjudicators - assignments.filter((a) => a.event_id === upcoming.id).length)} slot(s) open
              </div>
            </div>
          </div>
          <Link to="/admin/assignments" state={{ eventId: upcoming.id }} className="btn-primary shrink-0">
            Open <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/admin/events" className="block hover:-translate-y-0.5 transition-transform">
          <StatCard label="Live events" value={liveEvents} Icon={CalendarCheck} tone="red" />
        </Link>
        <Link to="/admin/events" className="block hover:-translate-y-0.5 transition-transform">
          <StatCard label="Scheduled events" value={scheduled} Icon={CalendarCheck} tone="blue" />
        </Link>
        <Link to="/admin/tracking" className="block hover:-translate-y-0.5 transition-transform">
          <StatCard label="Adjudicators travelling" value={onTheMove} Icon={Plane} tone="gold" />
        </Link>
        <Link to="/admin/tracking" className="block hover:-translate-y-0.5 transition-transform">
          <StatCard label="On-site adjudicators" value={onSite} Icon={ShieldCheck} tone="green" />
        </Link>
      </div>

      <div className="mt-6">
        <Card className="p-0 overflow-hidden">
          <div className="px-5 pt-5 pb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-soft">Global field map</h3>
              <p className="text-xs text-muted">Live adjudicator positions and active event venues across all regions.</p>
            </div>
            <div className="flex gap-2 text-[11px]">
              <Badge tone="red">{liveEvents} live</Badge>
              <Badge tone="amber">{scheduled} scheduled</Badge>
              <Badge tone="green">{onSite} on-site</Badge>
              <Badge tone="gold">{onTheMove} en route</Badge>
            </div>
          </div>
          <WorldMap pins={[...eventPins, ...adjPins]} height={440} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-soft">Coverage gaps</h3>
              <p className="text-xs text-muted">Events with fewer assigned adjudicators than required, sorted by SLA urgency.</p>
            </div>
            <Link to="/admin/assignments" className="text-xs text-royal hover:underline inline-flex items-center gap-1">
              Resolve <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {understaffed.length === 0 ? (
            <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> All upcoming events are fully staffed.
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {understaffed.slice(0, 6).map((c) => (
                <li key={c.event.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link to={`/admin/events/${c.event.id}`} className="text-sm font-semibold text-soft truncate hover:text-royal">{c.event.title}</Link>
                    <div className="text-[11px] text-muted">
                      {c.event.city ?? "—"}, {c.event.country ?? "—"}
                      {c.event.start_iso && <> · {formatDate(c.event.start_iso)}</>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {c.sla && <Badge tone={c.sla.tone}><Clock className="h-3 w-3" /> {c.sla.label}</Badge>}
                    <Badge tone="amber"><AlertTriangle className="h-3 w-3" /> {c.missing} missing</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h3 className="font-semibold text-soft">Roster health</h3>
          <p className="text-xs text-muted mb-4">Adjudicator status snapshot.</p>
          <ul className="space-y-3 text-sm">
            <RosterRow label="Active" value={adjudicators.filter((a) => a.status === "Active").length} max={Math.max(1, adjudicators.length)} tone="green" />
            <RosterRow label="On leave" value={adjudicators.filter((a) => a.status === "On leave").length} max={Math.max(1, adjudicators.length)} tone="amber" />
            <RosterRow label="Suspended" value={adjudicators.filter((a) => a.status === "Suspended").length} max={Math.max(1, adjudicators.length)} tone="red" />
          </ul>
          <div className="mt-5 pt-4 border-t border-line">
            <div className="text-[11px] uppercase tracking-wider text-muted">Avg. rating</div>
            <div className="mt-1 text-2xl font-bold text-soft inline-flex items-center gap-2">
              {adjudicators.length ? (adjudicators.reduce((a, b) => a + b.rating, 0) / adjudicators.length).toFixed(2) : "—"}
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-soft">Recent assignments</h3>
            <Link to="/admin/assignments" className="text-xs text-royal hover:underline">Manage</Link>
          </div>
          {assignments.length === 0 ? (
            <div className="text-sm text-muted">No assignments yet.</div>
          ) : (
            <ul className="divide-y divide-line">
              {assignments.slice(0, 6).map((a) => {
                const adj = adjudicators.find((x) => x.id === a.adjudicator_id);
                const ev = events.find((e) => e.id === a.event_id);
                return (
                  <li key={a.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-soft truncate">
                        {adj?.name ?? a.adjudicator_id} <span className="text-muted font-normal">→</span> {ev?.title ?? a.event_id}
                      </div>
                      <div className="text-[11px] text-muted">
                        {a.role} · {ev?.city ?? "—"} · {relativeTime(a.assigned_at)}
                      </div>
                    </div>
                    <Badge tone={a.status === "On-site" ? "green" : a.status === "Travelling" ? "gold" : "blue"}>{a.status}</Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-soft">Audit feed</h3>
            <Link to="/admin/audit" className="text-xs text-royal hover:underline">Full log</Link>
          </div>
          {audit.length === 0 ? (
            <div className="text-sm text-muted">No audit entries yet.</div>
          ) : (
            <ul className="space-y-3">
              {audit.map((e) => (
                <li key={e.id} className="text-sm flex gap-3">
                  <div className="h-2 w-2 rounded-full mt-2 bg-royal" />
                  <div>
                    <div className="text-soft">
                      <span className="font-semibold">{e.actor_id ? e.actor_id.slice(0, 8) : "system"}</span>{" "}
                      <span className="text-muted">{e.action}</span>{" "}
                      {e.target_type && <span className="font-semibold text-royal">{e.target_type}</span>}
                    </div>
                    <div className="text-[11px] text-muted">{relativeTime(e.ts)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}

function RosterRow({ label, value, max, tone }: { label: string; value: number; max: number; tone: "green" | "amber" | "red" }) {
  const pct = (value / max) * 100;
  const bar = tone === "green" ? "bg-emerald-500" : tone === "amber" ? "bg-amber-500" : "bg-rose-500";
  return (
    <li>
      <div className="flex items-center justify-between text-[12px] mb-1.5">
        <span className="text-soft">{label}</span>
        <span className="text-muted">{value}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-canvas overflow-hidden">
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
      </div>
    </li>
  );
}
