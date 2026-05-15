import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Pencil, Trash2, Users, Plane, MapPin as PinIcon, CalendarDays, Globe,
  Shield, ClipboardSignature, Clock, Building2, Activity,
} from "lucide-react";
import { Card, PageHeader, Badge, Button } from "@/components/ui";
import WorldMap, { type MapPin } from "@/components/WorldMap";
import EventFormModal from "@/components/EventFormModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/components/Toaster";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { upsertEvent, deleteEvent, setEventGeofence } from "@/redux/admin";
import { getAdjudicator, travelStatusTone, type AdminEvent } from "@/mock-data/admin";
import { formatDate, formatInTz, tzAbbrev, computeSla, relativeTime } from "@/lib/utils";

const STATUS_TONE: Record<AdminEvent["status"], "blue" | "gold" | "red" | "green" | "default"> = {
  Draft: "default",
  Scheduled: "blue",
  Live: "red",
  Completed: "green",
  Cancelled: "default",
};

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const events = useAppSelector((s) => s.admin.events);
  const adjudicators = useAppSelector((s) => s.admin.adjudicators);
  const assignments = useAppSelector((s) => s.admin.assignments);
  const locations = useAppSelector((s) => s.admin.locations);
  const auditFeed = useAppSelector((s) => s.admin.notifications);
  const settings = useAppSelector((s) => s.admin.settings);

  const event = events.find((e) => e.id === id);
  const [editing, setEditing] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [fenceDraft, setFenceDraft] = useState<number | null>(null);

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

  const eventAssignments = assignments.filter((a) => a.eventId === event.id);
  const sla = computeSla(event.startISO, settings.leadAssignmentSlaDays);
  const understaffed = eventAssignments.length < event.requiredAdjudicators;
  const missing = Math.max(0, event.requiredAdjudicators - eventAssignments.length);
  const fence = fenceDraft ?? event.geofenceRadiusM;

  // Map pins: event venue (gold/red) + assigned adjudicators current locations
  const pins: MapPin[] = [
    {
      id: `evt-${event.id}`,
      lat: event.lat,
      lon: event.lon,
      label: event.city,
      sublabel: event.venue,
      tone: event.status === "Live" ? "red" : "amber",
      pulse: event.status === "Live",
    },
    ...eventAssignments.flatMap((a) => {
      const loc = locations.find((l) => l.adjudicatorId === a.adjudicatorId);
      const adj = getAdjudicator(a.adjudicatorId, adjudicators);
      if (!loc || !adj) return [];
      const tone = travelStatusTone[loc.travelStatus];
      return [{
        id: `adj-${a.adjudicatorId}`,
        lat: loc.lat,
        lon: loc.lon,
        label: adj.name,
        sublabel: `${loc.travelStatus} · ${loc.city}`,
        tone: tone === "default" ? "muted" : (tone as MapPin["tone"]),
      }];
    }),
  ];

  const ev = event;
  function handleSaveEdit(form: AdminEvent) {
    dispatch(upsertEvent(form));
    setEditing(false);
    toast({ title: "Event updated", description: form.id, tone: "success" });
  }

  function handleDelete() {
    dispatch(deleteEvent({ id: ev.id }));
    toast({ title: "Event deleted", description: ev.id, tone: "warning" });
    navigate("/admin/events");
  }

  function saveFence() {
    if (fenceDraft != null && fenceDraft !== ev.geofenceRadiusM) {
      dispatch(setEventGeofence({ id: ev.id, radiusM: fenceDraft }));
      toast({ title: "Geo-fence updated", description: `${fenceDraft}m around ${ev.venue}`, tone: "success" });
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
        subtitle={`${event.venue} · ${event.city}, ${event.country}`}
        actions={
          <>
            <Button variant="outline" onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4" /> Edit
            </Button>
            <Button variant="outline" onClick={() => setConfirmDel(true)}>
              <Trash2 className="h-4 w-4 text-rose-600" /> Delete
            </Button>
            <Link
              to="/admin/assignments"
              state={{ eventId: event.id }}
              className="btn-primary"
            >
              <Users className="h-4 w-4" /> Assign adjudicators
            </Link>
          </>
        }
      />

      <div className="flex flex-wrap gap-2 mb-6">
        <Badge tone={STATUS_TONE[event.status]}>{event.status}</Badge>
        <Badge tone="default">{event.category}</Badge>
        <Badge tone={event.priority === "Flagship" ? "red" : event.priority === "High" ? "gold" : "blue"}>
          {event.priority} priority
        </Badge>
        <Badge tone={sla.tone}><Clock className="h-3 w-3" /> {sla.label}</Badge>
        <Badge tone={understaffed ? "amber" : "green"}>
          {eventAssignments.length} / {event.requiredAdjudicators} adjudicators
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Card className="p-0 overflow-hidden">
            <WorldMap pins={pins} height={320} />
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-soft inline-flex items-center gap-2">
                <Users className="h-4 w-4 text-royal" /> Adjudicator team
              </h3>
              <Badge tone={understaffed ? "amber" : "green"}>
                {missing > 0 ? `${missing} slot${missing > 1 ? "s" : ""} open` : "Fully staffed"}
              </Badge>
            </div>
            {eventAssignments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-line p-8 text-center">
                <div className="text-sm font-semibold text-soft">No adjudicators yet</div>
                <div className="text-[12px] text-muted mt-1">
                  Use the “Assign adjudicators” button to staff this event.
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {eventAssignments.map((a) => {
                  const adj = getAdjudicator(a.adjudicatorId, adjudicators);
                  const loc = locations.find((l) => l.adjudicatorId === a.adjudicatorId);
                  if (!adj) return null;
                  return (
                    <li key={a.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-full bg-royal/10 text-royal flex items-center justify-center text-[11px] font-bold">
                          {adj.initials}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-soft truncate">{adj.name}</div>
                          <div className="text-[11px] text-muted">
                            {a.role} · assigned {relativeTime(a.assignedAt)}
                            {loc && <> · last ping {relativeTime(loc.lastPingISO)}</>}
                          </div>
                        </div>
                      </div>
                      <Badge tone={a.status === "On-site" ? "green" : a.status === "Travelling" ? "gold" : "blue"}>
                        {a.status}
                      </Badge>
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
            <h3 className="font-semibold text-soft mb-3 inline-flex items-center gap-2">
              <Building2 className="h-4 w-4 text-royal" /> Venue
            </h3>
            <dl className="text-sm space-y-2">
              <DRow icon={<PinIcon className="h-3 w-3" />} k="Venue" v={event.venue} />
              <DRow icon={<Globe className="h-3 w-3" />} k="Location" v={`${event.city}, ${event.country}`} />
              <DRow icon={<CalendarDays className="h-3 w-3" />} k="Starts (UTC)" v={formatDate(event.startISO)} />
              <DRow icon={<Clock className="h-3 w-3" />} k="Local time" v={`${formatInTz(event.startISO, event.timezone)} ${tzAbbrev(event.startISO, event.timezone)}`} />
              <DRow icon={<CalendarDays className="h-3 w-3" />} k="Ends (UTC)" v={formatDate(event.endISO)} />
              <DRow icon={<Plane className="h-3 w-3" />} k="Organizer" v={event.organizer} />
              <DRow icon={<Activity className="h-3 w-3" />} k="Participants" v={event.participantCount.toLocaleString()} />
            </dl>
          </Card>

          <Card>
            <h3 className="font-semibold text-soft mb-3 inline-flex items-center gap-2">
              <Shield className="h-4 w-4 text-royal" /> Geo-fence
            </h3>
            <p className="text-[12px] text-muted">
              Radius around the venue that auto-triggers “On-site” check-ins when an adjudicator’s GPS enters.
            </p>
            <div className="mt-3 flex items-center gap-3">
              <input
                type="range"
                min={50}
                max={3000}
                step={50}
                value={fence}
                onChange={(e) => setFenceDraft(Number(e.target.value))}
                className="flex-1 accent-royal"
              />
              <div className="text-sm font-semibold text-soft w-20 text-right">{fence} m</div>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              {fenceDraft != null && fenceDraft !== event.geofenceRadiusM && (
                <button onClick={() => setFenceDraft(null)} className="btn-ghost text-xs">Reset</button>
              )}
              <Button
                onClick={saveFence}
                disabled={fenceDraft == null || fenceDraft === event.geofenceRadiusM}
              >
                Save radius
              </Button>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-soft mb-3">Recent audit</h3>
            <ul className="space-y-3">
              {auditFeed.slice(0, 4).map((n) => (
                <li key={n.id} className="text-[12px] flex gap-2">
                  <div className={`h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 ${
                    n.tone === "success" ? "bg-emerald-500" :
                    n.tone === "warning" ? "bg-amber-500" :
                    n.tone === "danger" ? "bg-rose-500" : "bg-royal"
                  }`} />
                  <div>
                    <div className="text-soft">{n.title}</div>
                    <div className="text-[10px] text-muted">{relativeTime(n.ts)}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <EventFormModal
        open={editing}
        initial={event}
        defaultGeofenceM={settings.defaultGeofenceM}
        onClose={() => setEditing(false)}
        onSubmit={handleSaveEdit}
      />
      <ConfirmDialog
        open={confirmDel}
        title={`Delete ${event.id}?`}
        description="Removing this event will also remove all its assignments. This cannot be undone."
        confirmLabel="Delete event"
        tone="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDel(false)}
      />
    </>
  );
}

function DRow({ icon, k, v }: { icon: React.ReactNode; k: string; v: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-[11px] uppercase tracking-wider text-muted inline-flex items-center gap-1">
        {icon} {k}
      </dt>
      <dd className="text-soft text-right text-[12px]">{v}</dd>
    </div>
  );
}
