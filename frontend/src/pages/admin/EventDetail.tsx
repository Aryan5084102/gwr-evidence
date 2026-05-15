import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Pencil, Trash2, Users, Plane, MapPin as PinIcon, CalendarDays, Globe,
  Shield, ClipboardSignature, Clock, Building2, Activity, Loader2,
} from "lucide-react";
import { Card, PageHeader, Badge, Button } from "@/components/ui";
import WorldMap, { type MapPin } from "@/components/WorldMap";
import EventFormModal from "@/components/EventFormModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/components/Toaster";
import { useAppSelector } from "@/redux/store";
import {
  adminEventsApi, adminAdjudicatorsApi, adminAssignmentsApi, trackingApi,
  type AdminEvent,
} from "@/lib/api/admin";
import { auditApi } from "@/lib/api/resources";
import { ApiError } from "@/lib/api";
import { formatDate, formatInTz, tzAbbrev, computeSla, relativeTime } from "@/lib/utils";

const STATUS_TONE: Record<AdminEvent["status"], "blue" | "gold" | "red" | "green" | "default"> = {
  Draft: "default", Scheduled: "blue", Live: "red", Completed: "green", Cancelled: "default",
};

const TRAVEL_TONE: Record<string, "green" | "blue" | "gold" | "amber" | "red" | "default"> = {
  Available: "green", Assigned: "blue", Travelling: "gold",
  "On-site": "green", Completed: "default", "Off-duty": "default",
};

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { toast } = useToast();
  const settings = useAppSelector((s) => s.admin.settings);

  const eventQ = useQuery({
    queryKey: ["admin", "event", id],
    queryFn: () => adminEventsApi.get(id!),
    enabled: !!id,
  });
  const adjQ = useQuery({ queryKey: ["admin", "adjudicators"], queryFn: () => adminAdjudicatorsApi.list() });
  const asnQ = useQuery({
    queryKey: ["admin", "assignments", { event_id: id }],
    queryFn: () => adminAssignmentsApi.list({ event_id: id }),
    enabled: !!id,
  });
  const locQ = useQuery({ queryKey: ["admin", "locations"], queryFn: () => trackingApi.listLocations() });
  const auditQ = useQuery({ queryKey: ["audit", 1, 4], queryFn: () => auditApi.list(1, 4) });

  const event = eventQ.data;
  const adjudicators = adjQ.data ?? [];
  const eventAssignments = asnQ.data ?? [];
  const locations = locQ.data ?? [];
  const auditFeed = auditQ.data ?? [];

  const [editing, setEditing] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [fenceDraft, setFenceDraft] = useState<number | null>(null);

  const update = useMutation({
    mutationFn: (body: Partial<AdminEvent>) => adminEventsApi.update(id!, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "event", id] });
      qc.invalidateQueries({ queryKey: ["admin", "events"] });
    },
  });
  const del = useMutation({
    mutationFn: () => adminEventsApi.delete(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "events"] });
      qc.invalidateQueries({ queryKey: ["admin", "assignments"] });
      toast({ title: "Event deleted", description: id, tone: "warning" });
      navigate("/admin/events");
    },
    onError: (e) => toast({ title: "Couldn't delete event", description: e instanceof ApiError ? e.message : "Unknown error", tone: "danger" }),
  });

  if (eventQ.isLoading) {
    return <Card className="py-16 flex items-center justify-center gap-2 text-muted mt-10 max-w-md mx-auto"><Loader2 className="h-4 w-4 animate-spin" /> Loading event…</Card>;
  }
  if (!event) {
    return (
      <Card className="max-w-md mx-auto text-center py-12 mt-10">
        <div className="font-semibold text-soft">Event not found</div>
        <p className="text-sm text-muted mt-1">It may have been removed.</p>
        <Link to="/admin/events" className="btn-primary mt-4 inline-flex">
          <ArrowLeft className="h-4 w-4" /> Back to Events
        </Link>
      </Card>
    );
  }

  const sla = event.start_iso ? computeSla(event.start_iso, settings.leadAssignmentSlaDays) : null;
  const understaffed = eventAssignments.length < event.required_adjudicators;
  const missing = Math.max(0, event.required_adjudicators - eventAssignments.length);
  const fence = fenceDraft ?? event.geofence_radius_m;

  const pins: MapPin[] = [
    {
      id: `evt-${event.id}`,
      lat: event.lat, lon: event.lon,
      label: event.city ?? event.id,
      sublabel: event.venue ?? "",
      tone: event.status === "Live" ? "red" : "amber",
      pulse: event.status === "Live",
    },
    ...eventAssignments.flatMap((a) => {
      const loc = locations.find((l) => l.adjudicator_id === a.adjudicator_id);
      const adj = adjudicators.find((x) => x.id === a.adjudicator_id);
      if (!loc || !adj) return [];
      const tone = TRAVEL_TONE[loc.travel_status];
      return [{
        id: `adj-${a.adjudicator_id}`,
        lat: loc.lat, lon: loc.lon,
        label: adj.name,
        sublabel: `${loc.travel_status} · ${loc.city ?? ""}`,
        tone: tone === "default" ? "muted" : (tone as MapPin["tone"]),
      }];
    }),
  ];

  function saveFence() {
    if (fenceDraft != null && fenceDraft !== event!.geofence_radius_m) {
      update.mutate({ geofence_radius_m: fenceDraft }, {
        onSuccess: () => toast({ title: "Geo-fence updated", description: `${fenceDraft}m around ${event!.venue ?? event!.city}`, tone: "success" }),
        onError: (e) => toast({ title: "Couldn't update geo-fence", description: e instanceof ApiError ? e.message : "Unknown error", tone: "danger" }),
      });
    }
    setFenceDraft(null);
  }

  return (
    <>
      <Link to="/admin/events" className="inline-flex items-center gap-1.5 text-[12px] text-royal hover:underline mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to events
      </Link>

      <PageHeader
        eyebrow={`Admin · Event · ${event.id}`}
        title={event.title}
        subtitle={`${event.venue ?? "—"} · ${event.city ?? "—"}, ${event.country ?? "—"}`}
        actions={
          <>
            <Button variant="outline" onClick={() => setEditing(true)}><Pencil className="h-4 w-4" /> Edit</Button>
            <Button variant="outline" onClick={() => setConfirmDel(true)}><Trash2 className="h-4 w-4 text-rose-600" /> Delete</Button>
            <Link to="/admin/assignments" state={{ eventId: event.id }} className="btn-primary">
              <Users className="h-4 w-4" /> Assign adjudicators
            </Link>
          </>
        }
      />

      <div className="flex flex-wrap gap-2 mb-6">
        <Badge tone={STATUS_TONE[event.status]}>{event.status}</Badge>
        <Badge tone="default">{event.category}</Badge>
        <Badge tone={event.priority === "Flagship" ? "red" : event.priority === "High" ? "gold" : "blue"}>{event.priority} priority</Badge>
        {sla && <Badge tone={sla.tone}><Clock className="h-3 w-3" /> {sla.label}</Badge>}
        <Badge tone={understaffed ? "amber" : "green"}>{eventAssignments.length} / {event.required_adjudicators} adjudicators</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Card className="p-0 overflow-hidden">
            <WorldMap pins={pins} height={320} />
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-soft inline-flex items-center gap-2"><Users className="h-4 w-4 text-royal" /> Adjudicator team</h3>
              <Badge tone={understaffed ? "amber" : "green"}>{missing > 0 ? `${missing} slot${missing > 1 ? "s" : ""} open` : "Fully staffed"}</Badge>
            </div>
            {eventAssignments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-line p-8 text-center">
                <div className="text-sm font-semibold text-soft">No adjudicators yet</div>
                <div className="text-[12px] text-muted mt-1">Use the "Assign adjudicators" button to staff this event.</div>
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {eventAssignments.map((a) => {
                  const adj = adjudicators.find((x) => x.id === a.adjudicator_id);
                  const loc = locations.find((l) => l.adjudicator_id === a.adjudicator_id);
                  if (!adj) return null;
                  return (
                    <li key={a.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-full bg-royal/10 text-royal flex items-center justify-center text-[11px] font-bold">{adj.initials}</div>
                        <div className="min-w-0">
                          <div className="font-semibold text-soft truncate">{adj.name}</div>
                          <div className="text-[11px] text-muted">
                            {a.role} · assigned {relativeTime(a.assigned_at)}
                            {loc && <> · last ping {relativeTime(loc.last_ping_iso)}</>}
                          </div>
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
            <h3 className="font-semibold text-soft inline-flex items-center gap-2 mb-3">
              <ClipboardSignature className="h-4 w-4 text-royal" /> Description
            </h3>
            <p className="text-sm text-soft leading-relaxed">{event.description || "No description provided."}</p>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <h3 className="font-semibold text-soft mb-3 inline-flex items-center gap-2"><Building2 className="h-4 w-4 text-royal" /> Venue</h3>
            <dl className="text-sm space-y-2">
              <DRow icon={<PinIcon className="h-3 w-3" />} k="Venue" v={event.venue ?? "—"} />
              <DRow icon={<Globe className="h-3 w-3" />} k="Location" v={`${event.city ?? "—"}, ${event.country ?? "—"}`} />
              {event.start_iso && <DRow icon={<CalendarDays className="h-3 w-3" />} k="Starts (UTC)" v={formatDate(event.start_iso)} />}
              {event.start_iso && <DRow icon={<Clock className="h-3 w-3" />} k="Local time" v={`${formatInTz(event.start_iso, event.timezone)} ${tzAbbrev(event.start_iso, event.timezone)}`} />}
              {event.end_iso && <DRow icon={<CalendarDays className="h-3 w-3" />} k="Ends (UTC)" v={formatDate(event.end_iso)} />}
              {event.organizer && <DRow icon={<Plane className="h-3 w-3" />} k="Organizer" v={event.organizer} />}
              <DRow icon={<Activity className="h-3 w-3" />} k="Participants" v={event.participant_count.toLocaleString()} />
            </dl>
          </Card>

          <Card>
            <h3 className="font-semibold text-soft mb-3 inline-flex items-center gap-2"><Shield className="h-4 w-4 text-royal" /> Geo-fence</h3>
            <p className="text-[12px] text-muted">Radius around the venue that auto-triggers "On-site" check-ins when an adjudicator's GPS enters.</p>
            <div className="mt-3 flex items-center gap-3">
              <input type="range" min={50} max={3000} step={50} value={fence} onChange={(e) => setFenceDraft(Number(e.target.value))} className="flex-1 accent-royal" />
              <div className="text-sm font-semibold text-soft w-20 text-right">{fence} m</div>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              {fenceDraft != null && fenceDraft !== event.geofence_radius_m && (
                <button onClick={() => setFenceDraft(null)} className="btn-ghost text-xs">Reset</button>
              )}
              <Button onClick={saveFence} disabled={fenceDraft == null || fenceDraft === event.geofence_radius_m || update.isPending}>
                {update.isPending ? "Saving…" : "Save radius"}
              </Button>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-soft mb-3">Recent audit</h3>
            {auditFeed.length === 0 ? (
              <div className="text-[12px] text-muted">No audit entries yet.</div>
            ) : (
              <ul className="space-y-3">
                {auditFeed.map((n) => (
                  <li key={n.id} className="text-[12px] flex gap-2">
                    <div className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 bg-royal" />
                    <div>
                      <div className="text-soft">{n.action}</div>
                      <div className="text-[10px] text-muted">{relativeTime(n.ts)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <EventFormModal
        open={editing}
        initial={event}
        defaultGeofenceM={settings.defaultGeofenceM}
        onClose={() => setEditing(false)}
        submitting={update.isPending}
        onSubmit={(form) => update.mutate(form, {
          onSuccess: () => { setEditing(false); toast({ title: "Event updated", description: event.id, tone: "success" }); },
          onError: (e) => toast({ title: "Couldn't update event", description: e instanceof ApiError ? e.message : "Unknown error", tone: "danger" }),
        })}
      />
      <ConfirmDialog
        open={confirmDel}
        title={`Delete ${event.id}?`}
        description="Removing this event will also remove all its assignments. This cannot be undone."
        confirmLabel="Delete event"
        tone="danger"
        onConfirm={() => del.mutate()}
        onCancel={() => setConfirmDel(false)}
      />
    </>
  );
}

function DRow({ icon, k, v }: { icon: React.ReactNode; k: string; v: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-[11px] uppercase tracking-wider text-muted inline-flex items-center gap-1">{icon} {k}</dt>
      <dd className="text-soft text-right text-[12px]">{v}</dd>
    </div>
  );
}
