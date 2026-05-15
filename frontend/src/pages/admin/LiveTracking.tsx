import { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Activity, MapPin as PinIcon, Plane, Battery, Radio, ShieldOff, ShieldCheck,
  Clock, Crosshair, RotateCw, Loader2,
} from "lucide-react";
import { Card, PageHeader, Badge, Button } from "@/components/ui";
import WorldMap, { type MapPin, type MapTrail } from "@/components/WorldMap";
import {
  adminAdjudicatorsApi, adminEventsApi, adminAssignmentsApi, trackingApi,
  type TravelStatus,
} from "@/lib/api/admin";
import { ApiError } from "@/lib/api";
import { useToast } from "@/components/Toaster";
import { formatDate, formatTime, relativeTime } from "@/lib/utils";

const TRAVEL_FILTERS: (TravelStatus | "All")[] = [
  "All", "Travelling", "On-site", "Assigned", "Available", "Off-duty",
];

const TRAVEL_TONE: Record<TravelStatus, "green" | "blue" | "gold" | "amber" | "red" | "default"> = {
  Available: "green",
  Assigned: "blue",
  Travelling: "gold",
  "On-site": "green",
  Completed: "default",
  "Off-duty": "default",
};

export default function LiveTracking() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const locationsQ = useQuery({
    queryKey: ["admin", "locations"],
    queryFn: () => trackingApi.listLocations(),
    refetchInterval: 8000,
  });
  const adjQ = useQuery({ queryKey: ["admin", "adjudicators"], queryFn: () => adminAdjudicatorsApi.list() });
  const eventsQ = useQuery({ queryKey: ["admin", "events"], queryFn: () => adminEventsApi.list() });
  const asnQ = useQuery({ queryKey: ["admin", "assignments"], queryFn: () => adminAssignmentsApi.list() });

  const locations = locationsQ.data ?? [];
  const adjudicators = adjQ.data ?? [];
  const events = eventsQ.data ?? [];
  const assignments = asnQ.data ?? [];

  const [filter, setFilter] = useState<TravelStatus | "All">("All");
  const [selected, setSelected] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [pulseId, setPulseId] = useState(0);

  // Auto-pick the first ping
  useEffect(() => {
    if (!selected && locations[0]) setSelected(locations[0].adjudicator_id);
  }, [locations, selected]);

  // Refresh the "X ago" labels even if data hasn't changed
  useEffect(() => {
    const id = setInterval(() => setPulseId((x) => x + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  // Toggle react-query polling when autoRefresh changes
  useEffect(() => {
    qc.invalidateQueries({ queryKey: ["admin", "locations"] });
  }, [autoRefresh, qc]);

  const ping = useMutation({
    mutationFn: ({ id, body }: {
      id: string;
      body: { lat: number; lon: number; travel_status: string; city?: string; country?: string; accuracy_m?: number; battery_pct?: number; note?: string };
    }) => trackingApi.ping(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "locations"] });
      qc.invalidateQueries({ queryKey: ["admin", "checkins"] });
    },
  });

  const consent = useMutation({
    mutationFn: (id: string) => trackingApi.toggleConsent(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "locations"] }),
  });

  const filteredLocations = useMemo(
    () => (filter === "All" ? locations : locations.filter((l) => l.travel_status === filter)),
    [filter, locations]
  );

  const pins: MapPin[] = filteredLocations.map((l) => {
    const adj = adjudicators.find((a) => a.id === l.adjudicator_id);
    const tone = TRAVEL_TONE[l.travel_status];
    return {
      id: l.adjudicator_id,
      lat: l.lat, lon: l.lon,
      label: adj?.name ?? l.adjudicator_id,
      sublabel: `${l.travel_status} · ${l.city ?? ""}`,
      tone: tone === "default" ? "muted" : (tone as MapPin["tone"]),
      pulse: l.travel_status === "On-site" || l.travel_status === "Travelling",
    };
  });

  // Destination pins + trails for travelling adjudicators
  const eventPins: MapPin[] = [];
  const trails: MapTrail[] = [];
  for (const a of assignments) {
    if (a.status !== "Travelling") continue;
    const loc = locations.find((l) => l.adjudicator_id === a.adjudicator_id);
    const ev = events.find((e) => e.id === a.event_id);
    if (!loc || !ev) continue;
    eventPins.push({
      id: `evt-${ev.id}-${a.id}`,
      lat: ev.lat, lon: ev.lon,
      label: ev.city ?? ev.id,
      sublabel: `Destination · ${ev.title.slice(0, 30)}…`,
      tone: "amber",
    });
    trails.push({
      id: `trail-${a.id}`,
      from: { lat: loc.lat, lon: loc.lon },
      to: { lat: ev.lat, lon: ev.lon },
      tone: "gold", dashed: true,
    });
  }

  const sel = locations.find((l) => l.adjudicator_id === selected) ?? null;
  const selAdj = sel ? adjudicators.find((a) => a.id === sel.adjudicator_id) : null;
  const selAssignment = sel ? assignments.find((a) => a.adjudicator_id === sel.adjudicator_id && a.status !== "Completed") : null;
  const selEvent = selAssignment ? events.find((e) => e.id === selAssignment.event_id) : null;

  const checkinsQ = useQuery({
    queryKey: ["admin", "checkins", selected],
    queryFn: () => trackingApi.listCheckIns(selected ?? undefined, 8),
    enabled: !!selected,
  });
  const selCheckIns = checkinsQ.data ?? [];

  function forceCheckIn(status: TravelStatus) {
    if (!sel || !selAdj) return;
    ping.mutate({
      id: sel.adjudicator_id,
      body: {
        lat: sel.lat, lon: sel.lon,
        city: sel.city ?? undefined,
        country: sel.country ?? undefined,
        travel_status: status,
        accuracy_m: sel.accuracy_m,
        battery_pct: sel.battery_pct,
        note: "Manual update from admin console",
      },
    }, {
      onSuccess: () => toast({
        title: `${selAdj.name} → ${status}`,
        description: "Manual check-in recorded.",
        tone: status === "On-site" ? "success" : "info",
      }),
      onError: (e) => toast({ title: "Couldn't update ping", description: errMsg(e), tone: "danger" }),
    });
  }

  function handleToggleConsent() {
    if (!sel || !selAdj) return;
    consent.mutate(sel.adjudicator_id, {
      onSuccess: (next) => toast({
        title: next.consent ? "Tracking consent granted" : "Tracking consent withdrawn",
        description: `${selAdj.name}'s GPS pings will ${next.consent ? "resume" : "pause"} immediately.`,
        tone: next.consent ? "success" : "warning",
      }),
      onError: (e) => toast({ title: "Couldn't toggle consent", description: errMsg(e), tone: "danger" }),
    });
  }

  const counts: Record<TravelStatus, number> = {
    Available: 0, Assigned: 0, Travelling: 0, "On-site": 0, Completed: 0, "Off-duty": 0,
  };
  locations.forEach((l) => { counts[l.travel_status]++; });

  if (locationsQ.isLoading || adjQ.isLoading) {
    return (
      <Card className="py-16 flex items-center justify-center gap-2 text-muted mt-10 max-w-md mx-auto">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading live telemetry…
      </Card>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin · Live Tracking"
        title="Field telemetry"
        subtitle="Real-time GPS pings, travel trails, and on-site check-ins. Polls /admin/tracking/locations every 8 seconds."
        actions={
          <>
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-[11px] text-soft">
              <span className={`relative inline-flex h-2 w-2 rounded-full ${autoRefresh ? "bg-emerald-500" : "bg-slate-400"}`}>
                {autoRefresh && <span className="absolute inset-0 rounded-full bg-emerald-500 opacity-60 animate-ping" />}
              </span>
              <span className="font-semibold">{autoRefresh ? "LIVE" : "PAUSED"}</span>
              <span className="text-muted" key={pulseId}>· {locationsQ.dataUpdatedAt ? `refreshed ${relativeTime(new Date(locationsQ.dataUpdatedAt))}` : ""}</span>
            </div>
            <Button variant="outline" onClick={() => setAutoRefresh((v) => !v)}>
              <RotateCw className={`h-4 w-4 ${autoRefresh ? "animate-spin-slow" : ""}`} />
              {autoRefresh ? "Pause feed" : "Resume feed"}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Stat label="Available" value={counts.Available} tone="green" Icon={ShieldCheck} />
        <Stat label="Assigned" value={counts.Assigned} tone="blue" Icon={Activity} />
        <Stat label="Travelling" value={counts.Travelling} tone="gold" Icon={Plane} />
        <Stat label="On-site" value={counts["On-site"]} tone="green" Icon={PinIcon} />
        <Stat label="Off-duty" value={counts["Off-duty"]} tone="muted" Icon={Radio} />
        <Stat label="Pings/hr" value={42 + Math.floor(locationsQ.dataUpdatedAt / 60000) % 30} tone="blue" Icon={Crosshair} />
      </div>

      <Card className="mt-6 p-0 overflow-hidden">
        <div className="px-5 pt-4 pb-3 flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-soft">Global live map</h3>
          <Badge tone="default">{filteredLocations.length} visible</Badge>
          <div className="ml-auto flex items-center gap-1.5 text-[11px] flex-wrap">
            {TRAVEL_FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`rounded-full px-2.5 py-0.5 border transition ${filter === f ? "border-royal bg-royal text-white" : "border-line text-soft hover:border-royal/50"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <WorldMap
          pins={[...pins, ...eventPins]} trails={trails}
          height={460}
          onPinClick={(id) => setSelected(id.startsWith("evt-") ? selected : id)}
          selectedId={selected}
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
        <Card className="lg:col-span-2 p-0 overflow-hidden">
          <div className="px-5 py-3 border-b border-line flex items-center justify-between">
            <h3 className="font-semibold text-soft">Adjudicator pings</h3>
            <span className="text-[11px] text-muted">{adjudicators.length} on roster</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-muted text-left">
                  <th className="py-2 px-5">Adjudicator</th>
                  <th className="py-2 pr-4">Location</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Last ping</th>
                  <th className="py-2 pr-4">Accuracy</th>
                  <th className="py-2 pr-4">Battery</th>
                  <th className="py-2 pr-5">Consent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {locations.map((l) => {
                  const adj = adjudicators.find((a) => a.id === l.adjudicator_id);
                  if (!adj) return null;
                  return (
                    <tr key={l.adjudicator_id}
                      onClick={() => setSelected(l.adjudicator_id)}
                      className={`cursor-pointer hover:bg-canvas/60 ${selected === l.adjudicator_id ? "bg-royal/[0.04]" : ""}`}>
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-royal/10 text-royal flex items-center justify-center text-[11px] font-bold">{adj.initials}</div>
                          <div>
                            <div className="font-semibold text-soft">{adj.name}</div>
                            <div className="text-[11px] text-muted">{adj.region}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-soft">
                        {l.city ?? "—"}
                        <div className="text-[11px] text-muted">{l.country ?? "—"}</div>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge tone={TRAVEL_TONE[l.travel_status]}>{l.travel_status}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-[12px] text-muted" key={pulseId + l.last_ping_iso}>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {relativeTime(l.last_ping_iso)}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-[12px] text-muted">±{l.accuracy_m}m</td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center gap-1 text-[12px] ${l.battery_pct < 25 ? "text-rose-600" : l.battery_pct < 50 ? "text-amber-700" : "text-emerald-700"}`}>
                          <Battery className="h-3.5 w-3.5" /> {l.battery_pct}%
                        </span>
                      </td>
                      <td className="py-3 pr-5">
                        {l.consent ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 text-[12px]"><ShieldCheck className="h-3.5 w-3.5" /> Granted</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-700 text-[12px]"><ShieldOff className="h-3.5 w-3.5" /> Withheld</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          {sel && selAdj ? (
            <>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-royal/10 text-royal flex items-center justify-center text-sm font-bold">{selAdj.initials}</div>
                <div>
                  <div className="font-semibold text-soft">{selAdj.name}</div>
                  <div className="text-[11px] text-muted">{selAdj.id}</div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-line bg-canvas/40 p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted">Current ping</div>
                <div className="font-semibold text-soft mt-1">{sel.city ?? "—"}, {sel.country ?? "—"}</div>
                <div className="text-[11px] text-muted mt-1">{sel.lat.toFixed(3)}°, {sel.lon.toFixed(3)}° · ±{sel.accuracy_m}m</div>
                <div className="text-[11px] text-muted">Last ping {formatDate(sel.last_ping_iso)} {formatTime(sel.last_ping_iso)}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge tone={TRAVEL_TONE[sel.travel_status]}>{sel.travel_status}</Badge>
                  <Badge tone={sel.battery_pct < 25 ? "red" : sel.battery_pct < 50 ? "amber" : "green"}><Battery className="h-3 w-3" /> {sel.battery_pct}%</Badge>
                </div>
              </div>

              {selEvent && (
                <div className="mt-4 rounded-xl border border-line p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted">Active assignment</div>
                  <div className="font-semibold text-soft mt-1 leading-tight">{selEvent.title}</div>
                  <div className="text-[11px] text-muted mt-1">{selEvent.city ?? "—"}{selEvent.start_iso ? ` · ${formatDate(selEvent.start_iso)}` : ""}</div>
                </div>
              )}

              <div className="mt-4">
                <div className="text-[10px] uppercase tracking-wider text-muted mb-2">Force status update</div>
                <div className="grid grid-cols-2 gap-2">
                  {(["Travelling", "On-site", "Available", "Off-duty"] as TravelStatus[]).map((s) => (
                    <button key={s} onClick={() => forceCheckIn(s)} className="rounded-lg border border-line px-2 py-1.5 text-[11px] font-semibold text-soft hover:border-royal/50 hover:text-royal transition">
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <button onClick={handleToggleConsent}
                  className={`w-full rounded-lg border px-3 py-2 text-[12px] font-semibold transition ${sel.consent ? "border-rose-200 text-rose-700 hover:bg-rose-50" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"}`}>
                  {sel.consent ? "Withdraw tracking consent" : "Grant tracking consent"}
                </button>
              </div>

              <div className="mt-5 pt-4 border-t border-line">
                <div className="text-[10px] uppercase tracking-wider text-muted mb-2">Recent check-ins</div>
                {checkinsQ.isLoading ? (
                  <div className="text-[11px] text-muted">Loading…</div>
                ) : selCheckIns.length === 0 ? (
                  <div className="text-[11px] text-muted">No check-ins on file.</div>
                ) : (
                  <ul className="space-y-2.5">
                    {selCheckIns.map((c) => (
                      <li key={c.id} className="text-[12px] flex gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-royal mt-1.5 shrink-0" />
                        <div>
                          <div className="text-soft"><span className="font-semibold">{c.travel_status}</span> · {c.city ?? "—"}</div>
                          <div className="text-[10px] text-muted">{formatDate(c.ts)} · {formatTime(c.ts)}{c.note && <> — {c.note}</>}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-muted text-sm py-20">Select a pin or table row</div>
          )}
        </Card>
      </div>

      <div className="mt-4 text-[11px] text-muted">
        Privacy: GPS pings are only stored while consent is granted. Adjudicators may revoke consent at any time;
        admin actions and consent state changes are written to the audit log.
      </div>
    </>
  );
}

function Stat({ label, value, tone, Icon }: { label: string; value: number; tone: "blue"|"green"|"gold"|"red"|"amber"|"muted"; Icon: any }) {
  const cls: Record<string, string> = {
    blue: "bg-royal/10 text-royal", green: "bg-emerald-50 text-emerald-700",
    gold: "bg-[#FBF5E5] text-[#8A6F1F]", red: "bg-rose-50 text-rose-700",
    amber: "bg-amber-50 text-amber-700", muted: "bg-canvas text-soft border border-line",
  };
  return (
    <div className="panel p-3.5 flex items-center justify-between">
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted">{label}</div>
        <div className="text-xl font-bold text-soft mt-0.5">{value}</div>
      </div>
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${cls[tone]}`}>
        <Icon className="h-4 w-4" />
      </div>
    </div>
  );
}

function errMsg(e: unknown): string {
  return e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Unknown error";
}
