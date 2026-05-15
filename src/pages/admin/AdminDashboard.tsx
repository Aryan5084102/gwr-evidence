import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  CalendarCheck,
  Gavel,
  Plane,
  MapPin as PinIcon,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/ui";
import StatCard from "@/components/StatCard";
import WorldMap, { type MapPin } from "@/components/WorldMap";
import {
  adminAuditLog,
  getAdjudicator,
  getEvent,
  travelStatusTone,
} from "@/mock-data/admin";
import { useAppSelector } from "@/redux/store";
import { formatDate, formatTime, relativeTime, computeSla } from "@/lib/utils";
import { Inbox } from "lucide-react";

export default function AdminDashboard() {
  const user = useAppSelector((s) => s.auth.user);
  const assignments = useAppSelector((s) => s.admin.assignments);
  const locations = useAppSelector((s) => s.admin.locations);
  const adminEvents = useAppSelector((s) => s.admin.events);
  const adminAdjudicators = useAppSelector((s) => s.admin.adjudicators);
  const notifications = useAppSelector((s) => s.admin.notifications);
  const settings = useAppSelector((s) => s.admin.settings);
  const unread = notifications.filter((n) => n.unread).length;
  const [, forceTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => forceTick((x) => x + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const liveEvents = adminEvents.filter((e) => e.status === "Live").length;
  const scheduled = adminEvents.filter((e) => e.status === "Scheduled").length;
  const onTheMove = locations.filter((l) => l.travelStatus === "Travelling").length;
  const onSite = locations.filter((l) => l.travelStatus === "On-site").length;

  // Next upcoming event (within the future)
  const now = Date.now();
  const upcoming = [...adminEvents]
    .filter((e) => new Date(e.startISO).getTime() > now && e.status !== "Cancelled")
    .sort((a, b) => new Date(a.startISO).getTime() - new Date(b.startISO).getTime())[0];

  const assignmentCoverage = adminEvents
    .filter((e) => e.status !== "Completed" && e.status !== "Cancelled")
    .map((e) => {
      const assigned = assignments.filter((a) => a.eventId === e.id).length;
      const sla = computeSla(e.startISO, settings.leadAssignmentSlaDays);
      return { event: e, assigned, missing: Math.max(0, e.requiredAdjudicators - assigned), sla };
    });

  const understaffed = assignmentCoverage
    .filter((c) => c.missing > 0)
    .sort((a, b) => a.sla.daysUntil - b.sla.daysUntil);

  // Map pins: events (gold) + adjudicators (status-tinted)
  const eventPins: MapPin[] = adminEvents
    .filter((e) => e.status === "Live" || e.status === "Scheduled")
    .map((e) => ({
      id: `evt-${e.id}`,
      lat: e.lat,
      lon: e.lon,
      label: e.city,
      sublabel: e.title.slice(0, 38) + (e.title.length > 38 ? "…" : ""),
      tone: e.status === "Live" ? "red" : "amber",
      pulse: e.status === "Live",
    }));

  const adjPins: MapPin[] = locations.map((l) => {
    const tone = travelStatusTone[l.travelStatus];
    const adj = getAdjudicator(l.adjudicatorId);
    return {
      id: `adj-${l.adjudicatorId}`,
      lat: l.lat,
      lon: l.lon,
      label: adj?.name ?? l.adjudicatorId,
      sublabel: `${l.travelStatus} · ${l.city}`,
      tone: tone === "default" ? "muted" : (tone as MapPin["tone"]),
      pulse: l.travelStatus === "On-site",
    };
  });

  return (
    <>
      <PageHeader
        eyebrow="GWR · Global Operations"
        title={`Mission control, ${user?.name?.split(" ")[0]}.`}
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
                <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unread}
                </span>
              )}
            </Link>
            <Link to="/admin/assignments" className="btn-ghost">
              <Gavel className="h-4 w-4" /> Assignments
            </Link>
            <Link to="/admin/tracking" className="btn-primary">
              <PinIcon className="h-4 w-4" /> Live tracking
            </Link>
          </>
        }
      />

      {upcoming && (
        <div className="mb-6 rounded-xl border border-royal/20 bg-gradient-to-r from-royal/[0.06] to-gold/[0.06] p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-lg bg-royal/10 text-royal flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-royal font-bold">
                Next event · {relativeTime(upcoming.startISO)}
              </div>
              <div className="font-semibold text-soft truncate">{upcoming.title}</div>
              <div className="text-[11px] text-muted">
                {upcoming.city}, {upcoming.country} · {formatDate(upcoming.startISO)} · {upcoming.requiredAdjudicators - assignments.filter((a) => a.eventId === upcoming.id).length} slot(s) open
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
          <StatCard label="Live events" value={liveEvents} Icon={CalendarCheck} tone="red" delta="1 flagship in progress" />
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
              <p className="text-xs text-muted">
                Live adjudicator positions and active event venues across all regions.
              </p>
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
              <p className="text-xs text-muted">Events with fewer assigned adjudicators than required.</p>
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
                      {c.event.city}, {c.event.country} · {formatDate(c.event.startISO)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge tone={c.sla.tone}>
                      <Clock className="h-3 w-3" /> {c.sla.label}
                    </Badge>
                    <Badge tone="amber">
                      <AlertTriangle className="h-3 w-3" /> {c.missing} missing
                    </Badge>
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
            <RosterRow label="Active" value={adminAdjudicators.filter((a) => a.status === "Active").length} max={adminAdjudicators.length} tone="green" />
            <RosterRow label="On leave" value={adminAdjudicators.filter((a) => a.status === "On leave").length} max={adminAdjudicators.length} tone="amber" />
            <RosterRow label="Suspended" value={adminAdjudicators.filter((a) => a.status === "Suspended").length} max={adminAdjudicators.length} tone="red" />
          </ul>
          <div className="mt-5 pt-4 border-t border-line">
            <div className="text-[11px] uppercase tracking-wider text-muted">Avg. rating</div>
            <div className="mt-1 text-2xl font-bold text-soft inline-flex items-center gap-2">
              {(adminAdjudicators.reduce((a, b) => a + b.rating, 0) / adminAdjudicators.length).toFixed(2)}
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
          <ul className="divide-y divide-line">
            {assignments.slice(0, 6).map((a) => {
              const adj = getAdjudicator(a.adjudicatorId);
              const ev = getEvent(a.eventId);
              return (
                <li key={a.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-soft truncate">
                      {adj?.name} <span className="text-muted font-normal">→</span> {ev?.title}
                    </div>
                    <div className="text-[11px] text-muted">
                      {a.role} · {ev?.city} · {formatDate(a.assignedAt)}
                    </div>
                  </div>
                  <Badge tone={a.status === "On-site" ? "green" : a.status === "Travelling" ? "gold" : "blue"}>
                    {a.status}
                  </Badge>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-soft">Audit feed</h3>
            <Link to="/admin/audit" className="text-xs text-royal hover:underline">Full log</Link>
          </div>
          <ul className="space-y-3">
            {adminAuditLog.slice(0, 7).map((e) => (
              <li key={e.id} className="text-sm flex gap-3">
                <div
                  className={`h-2 w-2 rounded-full mt-2 ${
                    e.tone === "success" ? "bg-emerald-500" : e.tone === "warning" ? "bg-amber-500" : e.tone === "danger" ? "bg-rose-500" : "bg-royal"
                  }`}
                />
                <div>
                  <div className="text-soft">
                    <span className="font-semibold">{e.actor}</span>{" "}
                    <span className="text-muted">{e.action}</span>{" "}
                    <span className="font-semibold text-royal">{e.target}</span>
                  </div>
                  <div className="text-[11px] text-muted">
                    {formatDate(e.ts)} · {formatTime(e.ts)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
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
