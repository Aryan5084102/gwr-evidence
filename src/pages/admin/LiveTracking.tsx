import { useMemo, useState, useEffect } from "react";
import {
  Activity,
  MapPin as PinIcon,
  Plane,
  Battery,
  Radio,
  ShieldOff,
  ShieldCheck,
  Clock,
  Crosshair,
  RotateCw,
} from "lucide-react";
import { Card, PageHeader, Badge, Button } from "@/components/ui";
import WorldMap, { type MapPin, type MapTrail } from "@/components/WorldMap";
import {
  getAdjudicator,
  getEvent,
  travelStatusTone,
  type TravelStatus,
} from "@/mock-data/admin";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { toggleConsent, updateAdjudicatorLocation } from "@/redux/admin";
import { formatDate, formatTime, relativeTime } from "@/lib/utils";
import { useToast } from "@/components/Toaster";

const TRAVEL_FILTERS: (TravelStatus | "All")[] = [
  "All",
  "Travelling",
  "On-site",
  "Assigned",
  "Available",
  "Off-duty",
];

export default function LiveTracking() {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const locations = useAppSelector((s) => s.admin.locations);
  const assignments = useAppSelector((s) => s.admin.assignments);
  const checkIns = useAppSelector((s) => s.admin.checkIns);
  const events = useAppSelector((s) => s.admin.events);
  const adjudicators = useAppSelector((s) => s.admin.adjudicators);

  const [filter, setFilter] = useState<TravelStatus | "All">("All");
  const [selected, setSelected] = useState<string | null>(locations[0]?.adjudicatorId ?? null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [tick, setTick] = useState(0);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [pulseId, setPulseId] = useState(0); // forces re-render for "X ago" text

  // Auto-refresh ticker — simulates incoming GPS pings
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => {
      setTick((t) => t + 1);
      setLastRefresh(new Date());
    }, 8000);
    return () => clearInterval(id);
  }, [autoRefresh]);

  // Re-render relative timestamps every 30s so "5m ago" stays fresh
  useEffect(() => {
    const id = setInterval(() => setPulseId((x) => x + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  // Every 3 ticks, jitter one travelling adjudicator slightly
  useEffect(() => {
    if (tick === 0) return;
    const travelling = locations.filter((l) => l.travelStatus === "Travelling" && l.consent);
    if (travelling.length === 0) return;
    const target = travelling[tick % travelling.length];
    const dest = (() => {
      const myAssignment = assignments.find(
        (a) => a.adjudicatorId === target.adjudicatorId && a.status === "Travelling"
      );
      if (!myAssignment) return null;
      return getEvent(myAssignment.eventId, events);
    })();
    if (!dest) return;
    // Inch ~10% toward destination
    const nextLat = target.lat + (dest.lat - target.lat) * 0.08;
    const nextLon = target.lon + (dest.lon - target.lon) * 0.08;
    dispatch(
      updateAdjudicatorLocation({
        adjudicatorId: target.adjudicatorId,
        lat: nextLat,
        lon: nextLon,
        city: target.city,
        country: target.country,
        travelStatus: "Travelling",
        accuracyM: 30 + Math.round(Math.random() * 25),
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  const filteredLocations = useMemo(
    () => (filter === "All" ? locations : locations.filter((l) => l.travelStatus === filter)),
    [filter, locations]
  );

  const pins: MapPin[] = filteredLocations.map((l) => {
    const adj = getAdjudicator(l.adjudicatorId, adjudicators);
    const tone = travelStatusTone[l.travelStatus];
    return {
      id: l.adjudicatorId,
      lat: l.lat,
      lon: l.lon,
      label: adj?.name ?? l.adjudicatorId,
      sublabel: `${l.travelStatus} · ${l.city}`,
      tone: tone === "default" ? "muted" : (tone as MapPin["tone"]),
      pulse: l.travelStatus === "On-site" || l.travelStatus === "Travelling",
    };
  });

  // Add destination pins (gold) and travel trails for adjudicators currently travelling
  const eventPins: MapPin[] = [];
  const trails: MapTrail[] = [];
  for (const a of assignments) {
    if (a.status !== "Travelling") continue;
    const loc = locations.find((l) => l.adjudicatorId === a.adjudicatorId);
    const ev = getEvent(a.eventId, events);
    if (!loc || !ev) continue;
    eventPins.push({
      id: `evt-${ev.id}-${a.id}`,
      lat: ev.lat,
      lon: ev.lon,
      label: ev.city,
      sublabel: `Destination · ${ev.title.slice(0, 30)}…`,
      tone: "amber",
    });
    trails.push({
      id: `trail-${a.id}`,
      from: { lat: loc.lat, lon: loc.lon },
      to: { lat: ev.lat, lon: ev.lon },
      tone: "gold",
      dashed: true,
    });
  }

  const sel = locations.find((l) => l.adjudicatorId === selected) ?? null;
  const selAdj = sel ? getAdjudicator(sel.adjudicatorId, adjudicators) : null;
  const selAssignment = sel ? assignments.find((a) => a.adjudicatorId === sel.adjudicatorId && a.status !== "Completed") : null;
  const selEvent = selAssignment ? getEvent(selAssignment.eventId, events) : null;
  const selCheckIns = sel ? checkIns.filter((c) => c.adjudicatorId === sel.adjudicatorId).slice(0, 6) : [];

  function forceCheckIn(status: TravelStatus) {
    if (!sel) return;
    dispatch(
      updateAdjudicatorLocation({
        adjudicatorId: sel.adjudicatorId,
        lat: sel.lat,
        lon: sel.lon,
        city: sel.city,
        country: sel.country,
        travelStatus: status,
        accuracyM: sel.accuracyM,
      })
    );
    toast({
      title: `${selAdj?.name} → ${status}`,
      description: "Manual check-in recorded.",
      tone: status === "On-site" ? "success" : "info",
    });
  }

  function handleToggleConsent() {
    if (!sel || !selAdj) return;
    dispatch(toggleConsent({ adjudicatorId: sel.adjudicatorId }));
    toast({
      title: sel.consent ? "Tracking consent withdrawn" : "Tracking consent granted",
      description: `${selAdj.name}'s GPS pings will ${sel.consent ? "pause" : "resume"} immediately.`,
      tone: sel.consent ? "warning" : "success",
    });
  }

  const counts: Record<TravelStatus, number> = {
    Available: 0, Assigned: 0, Travelling: 0, "On-site": 0, Completed: 0, "Off-duty": 0,
  };
  locations.forEach((l) => { counts[l.travelStatus]++; });

  return (
    <>
      <PageHeader
        eyebrow="Admin · Live Tracking"
        title="Field telemetry"
        subtitle="Real-time GPS pings, travel trails, and on-site check-ins for every active adjudicator. Updates pause when consent is withheld."
        actions={
          <>
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-[11px] text-soft">
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  autoRefresh ? "bg-emerald-500" : "bg-slate-400"
                }`}
              >
                {autoRefresh && (
                  <span className="absolute inset-0 rounded-full bg-emerald-500 opacity-60 animate-ping" />
                )}
              </span>
              <span className="font-semibold">{autoRefresh ? "LIVE" : "PAUSED"}</span>
              <span className="text-muted" key={pulseId}>· refreshed {relativeTime(lastRefresh)}</span>
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
        <Stat label="Pings/hr" value={42 + tick} tone="blue" Icon={Crosshair} />
      </div>

      <Card className="mt-6 p-0 overflow-hidden">
        <div className="px-5 pt-4 pb-3 flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-soft">Global live map</h3>
          <Badge tone="default">{filteredLocations.length} visible</Badge>
          <div className="ml-auto flex items-center gap-1.5 text-[11px] flex-wrap">
            {TRAVEL_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-2.5 py-0.5 border transition ${
                  filter === f ? "border-royal bg-royal text-white" : "border-line text-soft hover:border-royal/50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <WorldMap
          pins={[...pins, ...eventPins]}
          trails={trails}
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
                  const adj = getAdjudicator(l.adjudicatorId, adjudicators);
                  if (!adj) return null;
                  const tone = travelStatusTone[l.travelStatus];
                  return (
                    <tr
                      key={l.adjudicatorId}
                      onClick={() => setSelected(l.adjudicatorId)}
                      className={`cursor-pointer hover:bg-canvas/60 ${selected === l.adjudicatorId ? "bg-royal/[0.04]" : ""}`}
                    >
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-royal/10 text-royal flex items-center justify-center text-[11px] font-bold">
                            {adj.initials}
                          </div>
                          <div>
                            <div className="font-semibold text-soft">{adj.name}</div>
                            <div className="text-[11px] text-muted">{adj.region}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-soft">
                        {l.city}
                        <div className="text-[11px] text-muted">{l.country}</div>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge tone={tone === "default" ? "default" : (tone as any)}>{l.travelStatus}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-[12px] text-muted" key={pulseId + l.lastPingISO}>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {relativeTime(l.lastPingISO)}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-[12px] text-muted">±{l.accuracyM}m</td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[12px] ${
                            l.batteryPct < 25 ? "text-rose-600" : l.batteryPct < 50 ? "text-amber-700" : "text-emerald-700"
                          }`}
                        >
                          <Battery className="h-3.5 w-3.5" /> {l.batteryPct}%
                        </span>
                      </td>
                      <td className="py-3 pr-5">
                        {l.consent ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 text-[12px]">
                            <ShieldCheck className="h-3.5 w-3.5" /> Granted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-700 text-[12px]">
                            <ShieldOff className="h-3.5 w-3.5" /> Withheld
                          </span>
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
                <div className="h-12 w-12 rounded-full bg-royal/10 text-royal flex items-center justify-center text-sm font-bold">
                  {selAdj.initials}
                </div>
                <div>
                  <div className="font-semibold text-soft">{selAdj.name}</div>
                  <div className="text-[11px] text-muted">{selAdj.id}</div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-line bg-canvas/40 p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted">Current ping</div>
                <div className="font-semibold text-soft mt-1">{sel.city}, {sel.country}</div>
                <div className="text-[11px] text-muted mt-1">
                  {sel.lat.toFixed(3)}°, {sel.lon.toFixed(3)}° · ±{sel.accuracyM}m
                </div>
                <div className="text-[11px] text-muted">
                  Last ping {formatDate(sel.lastPingISO)} {formatTime(sel.lastPingISO)}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge tone={(travelStatusTone[sel.travelStatus] === "default" ? "default" : travelStatusTone[sel.travelStatus]) as any}>
                    {sel.travelStatus}
                  </Badge>
                  <Badge tone={sel.batteryPct < 25 ? "red" : sel.batteryPct < 50 ? "amber" : "green"}>
                    <Battery className="h-3 w-3" /> {sel.batteryPct}%
                  </Badge>
                </div>
              </div>

              {selEvent && (
                <div className="mt-4 rounded-xl border border-line p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted">Active assignment</div>
                  <div className="font-semibold text-soft mt-1 leading-tight">{selEvent.title}</div>
                  <div className="text-[11px] text-muted mt-1">
                    {selEvent.city} · {formatDate(selEvent.startISO)}
                  </div>
                </div>
              )}

              <div className="mt-4">
                <div className="text-[10px] uppercase tracking-wider text-muted mb-2">Force status update</div>
                <div className="grid grid-cols-2 gap-2">
                  {(["Travelling", "On-site", "Available", "Off-duty"] as TravelStatus[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => forceCheckIn(s)}
                      className="rounded-lg border border-line px-2 py-1.5 text-[11px] font-semibold text-soft hover:border-royal/50 hover:text-royal transition"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={handleToggleConsent}
                  className={`w-full rounded-lg border px-3 py-2 text-[12px] font-semibold transition ${
                    sel.consent
                      ? "border-rose-200 text-rose-700 hover:bg-rose-50"
                      : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  {sel.consent ? "Withdraw tracking consent" : "Grant tracking consent"}
                </button>
              </div>

              <div className="mt-5 pt-4 border-t border-line">
                <div className="text-[10px] uppercase tracking-wider text-muted mb-2">Recent check-ins</div>
                {selCheckIns.length === 0 ? (
                  <div className="text-[11px] text-muted">No check-ins on file.</div>
                ) : (
                  <ul className="space-y-2.5">
                    {selCheckIns.map((c) => (
                      <li key={c.id} className="text-[12px] flex gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-royal mt-1.5 shrink-0" />
                        <div>
                          <div className="text-soft">
                            <span className="font-semibold">{c.travelStatus}</span> · {c.city}
                          </div>
                          <div className="text-[10px] text-muted">
                            {formatDate(c.ts)} · {formatTime(c.ts)}
                            {c.note && <> — {c.note}</>}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-muted text-sm py-20">
              Select a pin or table row
            </div>
          )}
        </Card>
      </div>

      <div className="mt-4 text-[11px] text-muted">
        Privacy: GPS pings are only stored while consent is granted. Adjudicators may revoke consent at any time
        from their mobile app; admin actions and consent state changes are written to the audit log.
      </div>
    </>
  );
}

function Stat({ label, value, tone, Icon }: { label: string; value: number; tone: "blue"|"green"|"gold"|"red"|"amber"|"muted"; Icon: any }) {
  const cls: Record<string, string> = {
    blue: "bg-royal/10 text-royal",
    green: "bg-emerald-50 text-emerald-700",
    gold: "bg-[#FBF5E5] text-[#8A6F1F]",
    red: "bg-rose-50 text-rose-700",
    amber: "bg-amber-50 text-amber-700",
    muted: "bg-canvas text-soft border border-line",
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
