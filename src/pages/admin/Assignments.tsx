import { useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Users, Sparkles, AlertTriangle, CheckCircle2, Trash2, ChevronRight, Star,
  Wand2, Mail, Download, CheckSquare, Square,
} from "lucide-react";
import { Card, PageHeader, Badge, Button } from "@/components/ui";
import { getAdjudicator, getEvent, type AdminAssignment } from "@/mock-data/admin";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  assignAdjudicator, unassignAdjudicator, setAssignmentStatus, pushNotification,
} from "@/redux/admin";
import { formatDate, relativeTime } from "@/lib/utils";
import { useToast } from "@/components/Toaster";
import ConfirmDialog from "@/components/ConfirmDialog";

const STATUS_OPTIONS: AdminAssignment["status"][] = [
  "Assigned", "Travelling", "On-site", "Completed", "Cancelled",
];

function downloadCSV(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((r) =>
      r.map((cell) => {
        const s = String(cell ?? "");
        if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
        return s;
      }).join(",")
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function Assignments() {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const events = useAppSelector((s) => s.admin.events);
  const adjudicators = useAppSelector((s) => s.admin.adjudicators);
  const assignments = useAppSelector((s) => s.admin.assignments);
  const settings = useAppSelector((s) => s.admin.settings);
  const routerLocation = useLocation();

  const initial = (routerLocation.state as { eventId?: string } | null)?.eventId ?? events[0]?.id ?? "";
  const [eventId, setEventId] = useState<string>(initial);
  const [role, setRole] = useState<AdminAssignment["role"]>("Adjudicator");
  const [confirmUnassign, setConfirmUnassign] = useState<{ id: string; name: string } | null>(null);
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fromState = (routerLocation.state as { eventId?: string } | null)?.eventId;
    if (fromState) setEventId(fromState);
  }, [routerLocation.state]);

  // Clear bulk selection when event changes
  useEffect(() => { setBulkSelected(new Set()); }, [eventId]);

  const event = getEvent(eventId, events);
  if (!event) {
    return (
      <Card className="max-w-md mx-auto text-center py-12 mt-10">
        <div className="font-semibold text-soft">Pick an event to begin</div>
      </Card>
    );
  }
  const eventAssignments = assignments.filter((a) => a.eventId === eventId);
  const assignedIds = new Set(eventAssignments.map((a) => a.adjudicatorId));

  const suggestions = useMemo(() => {
    return adjudicators
      .filter((a) => !assignedIds.has(a.id) && a.status === "Active")
      .map((a) => {
        const specialtyMatch = a.specialties.includes(event.category);
        const matchScore = (specialtyMatch ? 3 : 0) + a.rating;
        const conflicting = assignments.find((x) => {
          if (x.adjudicatorId !== a.id) return false;
          const other = getEvent(x.eventId, events);
          if (!other) return false;
          return (
            new Date(other.startISO) <= new Date(event.endISO) &&
            new Date(other.endISO) >= new Date(event.startISO)
          );
        });
        return { adj: a, matchScore, specialtyMatch, conflict: !!conflicting, conflictWith: conflicting?.eventId };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, assignments, adjudicators, events]);

  const understaffed = eventAssignments.length < event.requiredAdjudicators;
  const missingCount = Math.max(0, event.requiredAdjudicators - eventAssignments.length);

  function notifyAssigned(adjName: string, asRole: AdminAssignment["role"]) {
    if (settings.emailOnAssign) {
      dispatch(pushNotification({
        title: "Briefing emailed",
        detail: `${adjName} has been notified of their ${asRole} assignment for ${event!.id}.`,
        tone: "info",
        kind: "assignment",
        linkTo: "/admin/assignments",
      }));
    }
  }

  function doAssign(adjudicatorId: string, asRole: AdminAssignment["role"], silent = false) {
    const adj = getAdjudicator(adjudicatorId, adjudicators);
    dispatch(assignAdjudicator({ eventId, adjudicatorId, role: asRole }));
    if (adj) notifyAssigned(adj.name, asRole);
    if (!silent && adj) {
      toast({
        title: `Assigned ${adj.name}`,
        description: `${asRole} on ${event!.title.slice(0, 40)}${event!.title.length > 40 ? "…" : ""}`,
        tone: "success",
      });
    }
  }

  function autoAssign() {
    const need = Math.max(0, event!.requiredAdjudicators - eventAssignments.length);
    if (need === 0) {
      toast({ title: "Already fully staffed", tone: "info" });
      return;
    }
    const picks = suggestions.filter((s) => !s.conflict).slice(0, need);
    if (picks.length === 0) {
      toast({
        title: "No conflict-free candidates",
        description: "All remaining adjudicators have a scheduling overlap. Review suggestions manually.",
        tone: "warning",
      });
      return;
    }
    picks.forEach((p, i) => {
      const asRole: AdminAssignment["role"] =
        eventAssignments.length === 0 && i === 0 ? "Lead Adjudicator" : "Adjudicator";
      doAssign(p.adj.id, asRole, true);
    });
    toast({
      title: `Auto-assigned ${picks.length} adjudicator${picks.length > 1 ? "s" : ""}`,
      description: picks.map((p) => p.adj.name).join(" · "),
      tone: "success",
    });
  }

  function assignSelected() {
    if (bulkSelected.size === 0) return;
    const ids = Array.from(bulkSelected);
    ids.forEach((id, i) => {
      const isFirst = eventAssignments.length === 0 && i === 0;
      doAssign(id, isFirst ? "Lead Adjudicator" : role, true);
    });
    toast({
      title: `Assigned ${ids.length} adjudicator${ids.length > 1 ? "s" : ""}`,
      description: ids.map((id) => getAdjudicator(id, adjudicators)?.name).filter(Boolean).join(" · "),
      tone: "success",
    });
    setBulkSelected(new Set());
  }

  function toggleBulk(id: string) {
    setBulkSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleConfirmUnassign() {
    if (!confirmUnassign) return;
    dispatch(unassignAdjudicator({ assignmentId: confirmUnassign.id }));
    toast({
      title: `Removed ${confirmUnassign.name}`,
      description: "Assignment cleared from event.",
      tone: "info",
    });
    setConfirmUnassign(null);
  }

  function exportEventCsv() {
    const rows: (string | number)[][] = [
      ["Assignment ID", "Adjudicator", "Email", "Role", "Status", "Assigned at"],
      ...eventAssignments.map((a) => {
        const adj = getAdjudicator(a.adjudicatorId, adjudicators);
        return [a.id, adj?.name ?? a.adjudicatorId, adj?.email ?? "", a.role, a.status, a.assignedAt];
      }),
    ];
    downloadCSV(`assignments_${event!.id}.csv`, rows);
    toast({ title: "CSV exported", description: `${eventAssignments.length} rows`, tone: "success" });
  }

  function exportAllCsv() {
    const rows: (string | number)[][] = [
      ["Assignment ID", "Event ID", "Event Title", "Adjudicator", "Role", "Status", "Assigned at"],
      ...assignments.map((a) => {
        const adj = getAdjudicator(a.adjudicatorId, adjudicators);
        const ev = getEvent(a.eventId, events);
        return [a.id, a.eventId, ev?.title ?? "", adj?.name ?? a.adjudicatorId, a.role, a.status, a.assignedAt];
      }),
    ];
    downloadCSV("assignments_all.csv", rows);
    toast({ title: "Global CSV exported", description: `${assignments.length} rows`, tone: "success" });
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin · Assignments"
        title="Assign adjudicators to events"
        subtitle="Match specialty and availability, avoid scheduling conflicts, and confirm coverage for every record attempt."
        actions={
          <>
            <Button variant="outline" onClick={exportAllCsv}>
              <Download className="h-4 w-4" /> Export all
            </Button>
            <Button variant="gold" onClick={autoAssign} disabled={!understaffed}>
              <Wand2 className="h-4 w-4" />
              {understaffed ? `Auto-assign best fit (${missingCount})` : "Fully staffed"}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card>
          <div className="text-[10px] uppercase tracking-wider text-muted mb-2">Event</div>
          <select
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className="input text-sm w-full"
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.id} · {e.title.slice(0, 38)}
              </option>
            ))}
          </select>

          <div className="mt-4 rounded-xl border border-line p-4 bg-canvas/40">
            <div className="text-[10px] uppercase tracking-wider text-royal font-bold">{event.id}</div>
            <div className="font-semibold text-soft mt-1 leading-tight">{event.title}</div>
            <div className="text-[11px] text-muted mt-1">
              {event.city}, {event.country} · {formatDate(event.startISO)} → {formatDate(event.endISO)}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="default">{event.category}</Badge>
              <Badge tone="blue">{event.requiredAdjudicators} required</Badge>
              <Badge tone={understaffed ? "amber" : "green"}>
                {eventAssignments.length} assigned
              </Badge>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-[10px] uppercase tracking-wider text-muted mb-2">Assign as</div>
            <div className="grid grid-cols-3 gap-2">
              {(["Lead Adjudicator", "Adjudicator", "Observer"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`rounded-lg border px-2.5 py-2 text-[11px] font-semibold transition ${
                    role === r ? "border-royal bg-royal/[0.06] text-royal" : "border-line text-soft hover:border-royal/40"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {understaffed ? (
            <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[12px] px-3 py-2 inline-flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Coverage gap — {missingCount} more needed.
            </div>
          ) : (
            <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[12px] px-3 py-2 inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Event is fully staffed.
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
            <div>
              <h3 className="font-semibold text-soft inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gold" /> Suggested adjudicators
              </h3>
              <p className="text-xs text-muted">Ranked by specialty match and rating. Scheduling conflicts are flagged.</p>
            </div>
            <div className="flex items-center gap-2">
              {bulkSelected.size > 0 && (
                <Button onClick={assignSelected}>
                  <CheckSquare className="h-4 w-4" /> Assign selected ({bulkSelected.size})
                </Button>
              )}
              <Badge tone="default">{suggestions.length} candidates</Badge>
            </div>
          </div>

          {suggestions.length === 0 ? (
            <EmptyState
              title="Everyone is already assigned"
              detail="Every active adjudicator on this event has been added. Unassign someone to free up slots."
            />
          ) : (
            <ul className="divide-y divide-line">
              {suggestions.slice(0, 10).map(({ adj, matchScore, specialtyMatch, conflict, conflictWith }) => {
                const isSelected = bulkSelected.has(adj.id);
                return (
                  <li key={adj.id} className="py-3 flex items-center justify-between gap-3 group">
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => toggleBulk(adj.id)}
                        className="shrink-0 text-muted hover:text-royal"
                        aria-label={isSelected ? "Unselect" : "Select for bulk assign"}
                      >
                        {isSelected ? <CheckSquare className="h-4 w-4 text-royal" /> : <Square className="h-4 w-4" />}
                      </button>
                      <div className="h-10 w-10 rounded-full bg-royal/10 text-royal flex items-center justify-center text-[11px] font-bold shrink-0 group-hover:bg-royal/15 transition">
                        {adj.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-soft truncate">{adj.name}</div>
                        <div className="text-[11px] text-muted">
                          {adj.region} · {adj.specialties.slice(0, 2).join(", ")}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {specialtyMatch && <Badge tone="green">Specialty match</Badge>}
                          <Badge tone="gold">
                            <Star className="h-3 w-3 fill-current" /> {adj.rating}
                          </Badge>
                          {conflict && (
                            <Badge tone="red">
                              <AlertTriangle className="h-3 w-3" /> Conflicts with {conflictWith}
                            </Badge>
                          )}
                          <span className="text-[10px] text-muted">score {matchScore.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant={conflict ? "outline" : "primary"}
                      onClick={() => doAssign(adj.id, role)}
                      title={conflict ? "Will create a scheduling overlap" : "Assign to event"}
                    >
                      Assign <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="font-semibold text-soft inline-flex items-center gap-2">
            <Users className="h-4 w-4 text-royal" /> Current assignments — {event.id}
          </h3>
          <div className="flex items-center gap-2">
            {eventAssignments.length > 0 && (
              <Button variant="outline" onClick={exportEventCsv}>
                <Download className="h-3.5 w-3.5" /> Export
              </Button>
            )}
            <Badge tone={understaffed ? "amber" : "green"}>
              {eventAssignments.length} / {event.requiredAdjudicators}
            </Badge>
          </div>
        </div>

        {eventAssignments.length === 0 ? (
          <EmptyState
            title="No adjudicators assigned yet"
            detail={`Click “Auto-assign best fit” to fill all ${event.requiredAdjudicators} required slot${event.requiredAdjudicators > 1 ? "s" : ""}, or pick from the suggestions above.`}
          />
        ) : (
          <ul className="divide-y divide-line">
            <AnimatePresence initial={false}>
              {eventAssignments.map((a) => {
                const adj = getAdjudicator(a.adjudicatorId, adjudicators);
                if (!adj) return null;
                return (
                  <motion.li
                    key={a.id}
                    layout
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ duration: 0.18 }}
                    className="py-3 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-royal/10 text-royal flex items-center justify-center text-[11px] font-bold">
                        {adj.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-soft truncate">{adj.name}</div>
                        <div className="text-[11px] text-muted">
                          {a.role} · assigned {relativeTime(a.assignedAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          dispatch(pushNotification({
                            title: `Email queued to ${adj.name}`,
                            detail: `Re-sent briefing for ${event.id}.`,
                            tone: "info",
                            kind: "assignment",
                          }));
                          toast({
                            title: `Email drafted to ${adj.name}`,
                            description: `Briefing pack for ${event.id} queued.`,
                            tone: "success",
                          });
                        }}
                        className="btn-ghost !px-2"
                        title="Send briefing email"
                      >
                        <Mail className="h-3.5 w-3.5" />
                      </button>
                      <select
                        value={a.status}
                        onChange={(e) => {
                          const next = e.target.value as AdminAssignment["status"];
                          dispatch(setAssignmentStatus({ assignmentId: a.id, status: next }));
                          toast({
                            title: `${adj.name} → ${next}`,
                            tone: next === "Cancelled" ? "warning" : "info",
                          });
                        }}
                        className="input py-1 text-xs"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => setConfirmUnassign({ id: a.id, name: adj.name })}
                        className="btn-ghost !px-2"
                        title="Unassign"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                      </button>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </Card>

      <ConfirmDialog
        open={!!confirmUnassign}
        title={`Unassign ${confirmUnassign?.name}?`}
        description="They will be removed from this event's roster. You can re-assign them later from the suggestions list."
        confirmLabel="Unassign"
        tone="danger"
        onConfirm={handleConfirmUnassign}
        onCancel={() => setConfirmUnassign(null)}
      />
    </>
  );
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-xl border border-dashed border-line p-8 text-center">
      <div className="text-sm font-semibold text-soft">{title}</div>
      <div className="text-[12px] text-muted mt-1 max-w-md mx-auto">{detail}</div>
    </div>
  );
}
