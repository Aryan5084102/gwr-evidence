import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays, MapPin, Filter, Search, Users, Plus, Pencil, Trash2, ExternalLink, Clock,
} from "lucide-react";
import { Card, PageHeader, Badge, Button } from "@/components/ui";
import WorldMap, { type MapPin as MP } from "@/components/WorldMap";
import EventFormModal from "@/components/EventFormModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/components/Toaster";
import type { AdminEvent } from "@/mock-data/admin";
import { useAppSelector, useAppDispatch } from "@/redux/store";
import { upsertEvent, deleteEvent, pushNotification } from "@/redux/admin";
import { formatDate, computeSla, formatInTz, tzAbbrev } from "@/lib/utils";

const STATUS_TONE: Record<AdminEvent["status"], "blue" | "gold" | "red" | "green" | "default"> = {
  Draft: "default",
  Scheduled: "blue",
  Live: "red",
  Completed: "green",
  Cancelled: "default",
};

const PRIORITY_TONE: Record<AdminEvent["priority"], "default" | "blue" | "gold" | "red"> = {
  Low: "default",
  Standard: "blue",
  High: "gold",
  Flagship: "red",
};

export default function Events() {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const events = useAppSelector((s) => s.admin.events);
  const assignments = useAppSelector((s) => s.admin.assignments);
  const settings = useAppSelector((s) => s.admin.settings);

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminEvent["status"] | "All">("All");
  const [selected, setSelected] = useState<string | null>(null);
  const [modal, setModal] = useState<{ mode: "create" | "edit"; event?: AdminEvent } | null>(null);
  const [confirmDel, setConfirmDel] = useState<AdminEvent | null>(null);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (statusFilter !== "All" && e.status !== statusFilter) return false;
      if (!q.trim()) return true;
      const needle = q.toLowerCase();
      return (
        e.title.toLowerCase().includes(needle) ||
        e.city.toLowerCase().includes(needle) ||
        e.country.toLowerCase().includes(needle) ||
        e.category.toLowerCase().includes(needle)
      );
    });
  }, [q, statusFilter, events]);

  const pins: MP[] = filtered.map((e) => ({
    id: e.id,
    lat: e.lat,
    lon: e.lon,
    label: e.city,
    sublabel: e.title.slice(0, 36) + (e.title.length > 36 ? "…" : ""),
    tone: e.status === "Live" ? "red" : e.status === "Scheduled" ? "amber" : "muted",
    pulse: e.status === "Live",
  }));

  const sel = events.find((e) => e.id === selected) ?? null;

  function handleSubmit(form: AdminEvent) {
    const isEdit = !!modal?.event;
    dispatch(upsertEvent(form));
    setModal(null);
    toast({
      title: isEdit ? "Event updated" : "Event created",
      description: `${form.id} · ${form.title.slice(0, 50)}`,
      tone: "success",
    });
    if (!isEdit) {
      dispatch(pushNotification({
        title: "New event added",
        detail: `${form.title} (${form.city}) needs ${form.requiredAdjudicators} adjudicator(s).`,
        tone: "info",
        kind: "event",
        linkTo: "/admin/assignments",
      }));
    }
  }

  function handleDelete() {
    if (!confirmDel) return;
    dispatch(deleteEvent({ id: confirmDel.id }));
    toast({ title: "Event deleted", description: confirmDel.id, tone: "warning" });
    if (selected === confirmDel.id) setSelected(null);
    setConfirmDel(null);
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin · Events"
        title="Record attempt events"
        subtitle="All globally tracked Guinness World Record attempts across draft, scheduled, live, and completed states."
        actions={
          <Button onClick={() => setModal({ mode: "create" })}>
            <Plus className="h-4 w-4" /> New event
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <Card className="lg:col-span-2 p-0 overflow-hidden">
          <WorldMap
            pins={pins}
            height={360}
            onPinClick={(id) => setSelected(id)}
            selectedId={selected}
          />
        </Card>

        <Card className="lg:sticky lg:top-20">
          {sel ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-royal font-bold">{sel.id}</div>
                  <h3 className="mt-1 font-semibold text-soft leading-tight">{sel.title}</h3>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setModal({ mode: "edit", event: sel })} className="btn-ghost !p-1.5" title="Edit">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => setConfirmDel(sel)} className="btn-ghost !p-1.5" title="Delete">
                    <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone={STATUS_TONE[sel.status]}>{sel.status}</Badge>
                <Badge tone={PRIORITY_TONE[sel.priority]}>{sel.priority}</Badge>
                <Badge tone="default">{sel.category}</Badge>
                {(() => {
                  const sla = computeSla(sel.startISO, settings.leadAssignmentSlaDays);
                  return sla.urgency !== "ok" && sla.urgency !== "past" ? <Badge tone={sla.tone}>{sla.label}</Badge> : null;
                })()}
              </div>
              <dl className="mt-4 text-sm space-y-2">
                <Row k="Venue" v={sel.venue} />
                <Row k="Location" v={`${sel.city}, ${sel.country}`} />
                <Row k="Starts (UTC)" v={formatDate(sel.startISO)} />
                <Row k="Starts (local)" v={`${formatInTz(sel.startISO, sel.timezone)} ${tzAbbrev(sel.startISO, sel.timezone)}`} />
                <Row k="Ends (UTC)" v={formatDate(sel.endISO)} />
                <Row k="Geo-fence" v={`${sel.geofenceRadiusM} m`} />
                <Row k="Participants" v={sel.participantCount.toLocaleString()} />
                <Row k="Required adjudicators" v={`${sel.requiredAdjudicators}`} />
                <Row k="Assigned" v={`${assignments.filter((a) => a.eventId === sel.id).length}`} />
              </dl>
              <p className="mt-4 text-[12px] text-muted leading-relaxed">{sel.description}</p>
              <div className="mt-5 flex flex-col gap-2">
                <Link to={`/admin/events/${sel.id}`} className="btn-ghost w-full justify-center">
                  <ExternalLink className="h-4 w-4" /> Open event detail
                </Link>
                <Link
                  to="/admin/assignments"
                  state={{ eventId: sel.id }}
                  className="btn-primary w-full"
                >
                  <Users className="h-4 w-4" /> Assign adjudicators
                </Link>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted py-12">
              <MapPin className="h-8 w-8 mb-3 text-royal/40" />
              <div className="text-sm font-semibold text-soft">Select an event</div>
              <div className="text-[11px] mt-1">Tap any pin on the map, or pick a row below.</div>
            </div>
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-soft">Event roster</h3>
            <Badge tone="default">{filtered.length}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search title, city, category…"
                className="input pl-8 py-1.5 text-sm w-64"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as AdminEvent["status"] | "All")}
                className="input pl-8 py-1.5 text-sm appearance-none"
              >
                <option>All</option>
                <option>Draft</option>
                <option>Scheduled</option>
                <option>Live</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line p-8 text-center">
            <div className="text-sm font-semibold text-soft">No events match your filters</div>
            <div className="text-[12px] text-muted mt-1">Try clearing the search or switching status to “All”.</div>
            <button onClick={() => { setQ(""); setStatusFilter("All"); }} className="btn-ghost mt-3">Reset filters</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-muted text-left">
                  <th className="py-2 pr-4">Event</th>
                  <th className="py-2 pr-4">Location</th>
                  <th className="py-2 pr-4">When</th>
                  <th className="py-2 pr-4">SLA</th>
                  <th className="py-2 pr-4">Priority</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Staffing</th>
                  <th className="py-2 pr-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((e) => {
                  const assigned = assignments.filter((a) => a.eventId === e.id).length;
                  const ok = assigned >= e.requiredAdjudicators;
                  const sla = computeSla(e.startISO, settings.leadAssignmentSlaDays);
                  return (
                    <tr
                      key={e.id}
                      onClick={() => setSelected(e.id)}
                      className={`cursor-pointer hover:bg-canvas/60 ${selected === e.id ? "bg-royal/[0.04]" : ""}`}
                    >
                      <td className="py-3 pr-4">
                        <div className="font-semibold text-soft">{e.title}</div>
                        <div className="text-[11px] text-muted">{e.id} · {e.category}</div>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="inline-flex items-center gap-1.5 text-soft">
                          <MapPin className="h-3.5 w-3.5 text-royal" />
                          {e.city}
                        </div>
                        <div className="text-[11px] text-muted">{e.country}</div>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="inline-flex items-center gap-1.5 text-soft">
                          <CalendarDays className="h-3.5 w-3.5 text-royal" />
                          {formatDate(e.startISO)}
                        </div>
                        <div className="text-[11px] text-muted">{formatInTz(e.startISO, e.timezone)} {tzAbbrev(e.startISO, e.timezone)}</div>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge tone={sla.tone}>
                          <Clock className="h-3 w-3" /> {sla.label}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4"><Badge tone={PRIORITY_TONE[e.priority]}>{e.priority}</Badge></td>
                      <td className="py-3 pr-4"><Badge tone={STATUS_TONE[e.status]}>{e.status}</Badge></td>
                      <td className="py-3 pr-4">
                        <Badge tone={ok ? "green" : "amber"}>
                          {assigned} / {e.requiredAdjudicators}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-right whitespace-nowrap">
                        <Link
                          to={`/admin/events/${e.id}`}
                          onClick={(ev) => ev.stopPropagation()}
                          className="text-xs text-royal hover:underline mr-3"
                        >
                          Open
                        </Link>
                        <Link
                          to="/admin/assignments"
                          state={{ eventId: e.id }}
                          onClick={(ev) => ev.stopPropagation()}
                          className="text-xs text-royal hover:underline"
                        >
                          Assign →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <EventFormModal
        open={!!modal}
        initial={modal?.event ?? null}
        defaultGeofenceM={settings.defaultGeofenceM}
        onClose={() => setModal(null)}
        onSubmit={handleSubmit}
      />
      <ConfirmDialog
        open={!!confirmDel}
        title={`Delete ${confirmDel?.id}?`}
        description="Removing this event will also remove all its assignments. Adjudicator profiles and tracking history are unaffected."
        confirmLabel="Delete event"
        tone="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDel(null)}
      />
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-[11px] uppercase tracking-wider text-muted">{k}</dt>
      <dd className="text-soft text-right">{v}</dd>
    </div>
  );
}
