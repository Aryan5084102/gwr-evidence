import { useMemo, useState } from "react";
import {
  CheckCircle2, X, MessageSquareWarning, FileText, Filter, Search, ShieldAlert, ShieldCheck, AlertTriangle, BookOpen,
  Mail, ChevronDown, ChevronUp, FileDown,
} from "lucide-react";
import { Badge, Card, PageHeader, Button, Progress } from "@/components/ui";
import { witnesses, attempts, aiInsights } from "@/mock-data/portal";
import { formatDate, formatTime } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { setStatus, type Invitation } from "@/redux/invitations";
import { downloadFilledWitnessStatement } from "@/lib/witnessStatementPdf";

const STATUS_FILTERS = ["All", "Pending Approval", "Profile Submitted", "Clarification Requested", "Approved"];

const STATUS_ICON: Record<string, any> = {
  pass: { Icon: ShieldCheck, cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  warn: { Icon: AlertTriangle, cls: "text-amber-700 bg-amber-50 border-amber-200" },
  fail: { Icon: ShieldAlert, cls: "text-rose-700 bg-rose-50 border-rose-200" },
};

export default function WitnessReviews() {
  const dispatch = useAppDispatch();
  const invitations = useAppSelector((s) => s.invitations.items);
  const submittedInvitations = useMemo(
    () => invitations.filter((i) => i.status === "Submitted" || i.status === "Approved" || i.status === "Rejected" || i.status === "Clarification Requested")
      .sort((a, b) => (b.submittedAt ?? b.sentAt).localeCompare(a.submittedAt ?? a.sentAt)),
    [invitations]
  );
  const pendingInvitations = submittedInvitations.filter((i) => i.status === "Submitted");

  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState(witnesses[0].id);
  const [decisions, setDecisions] = useState<Record<string, "approved" | "rejected" | "clarify" | undefined>>({});
  const [note, setNote] = useState("");

  const list = witnesses.filter((w) => {
    const m1 = filter === "All" || w.status === filter;
    const m2 = `${w.name} ${w.organization}`.toLowerCase().includes(q.toLowerCase());
    return m1 && m2;
  });
  const witness = witnesses.find((w) => w.id === selectedId) ?? witnesses[0];
  const attempt = attempts.find((a) => a.id === witness.attemptId);
  const decision = decisions[witness.id];

  return (
    <>
      <PageHeader
        eyebrow="Adjudicator · Review queue"
        title="Witness reviews"
        subtitle="Approve, reject or request clarification on each witness statement with AI-assisted insights."
        actions={
          pendingInvitations.length > 0 ? (
            <Badge tone="amber"><Mail className="h-3 w-3" /> {pendingInvitations.length} new submission{pendingInvitations.length > 1 ? "s" : ""}</Badge>
          ) : undefined
        }
      />

      {submittedInvitations.length > 0 && (
        <Card className="mb-6 !border-royal/30">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-royal font-bold">Live submissions</div>
              <h3 className="text-base font-bold text-soft mt-0.5">Statements submitted via invitation links</h3>
              <p className="text-xs text-muted mt-0.5">Submitted directly from witnesses through their email invitation. Approve, reject or request clarification below.</p>
            </div>
          </div>
          <ul className="divide-y divide-line">
            {submittedInvitations.map((inv) => (
              <InvitationReviewRow
                key={inv.id} invitation={inv}
                onApprove={(noteText) => dispatch(setStatus({ id: inv.id, status: "Approved", note: noteText }))}
                onReject={(noteText) => dispatch(setStatus({ id: inv.id, status: "Rejected", note: noteText }))}
                onClarify={(noteText) => dispatch(setStatus({ id: inv.id, status: "Clarification Requested", note: noteText }))}
              />
            ))}
          </ul>
        </Card>
      )}

      <div className="grid grid-cols-12 gap-5">
        {/* LEFT PANEL: list & filters */}
        <Card className="col-span-12 lg:col-span-3 !p-3">
          <div className="px-2 pt-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input className="input pl-9" placeholder="Search witnesses&hellip;" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s} onClick={() => setFilter(s)}
                  className={`text-[11px] rounded-full border px-2.5 py-1 ${filter === s ? "bg-royal text-white border-royal" : "bg-canvas text-soft border-line hover:border-royal/40"}`}
                >
                  {s === "All" ? "All" : s}
                </button>
              ))}
            </div>
          </div>
          <ul className="mt-3 max-h-[70vh] overflow-y-auto divide-y divide-line">
            {list.map((w) => {
              const active = w.id === witness.id;
              return (
                <li key={w.id}>
                  <button
                    onClick={() => setSelectedId(w.id)}
                    className={`w-full text-left px-3 py-3 transition ${active ? "bg-royal/[0.06]" : "hover:bg-canvas"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-royal/10 text-royal font-semibold flex items-center justify-center text-sm shrink-0">{w.initials}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-soft truncate">{w.name}</div>
                        <div className="text-[11px] text-muted truncate">{w.organization}</div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge tone={w.status === "Approved" ? "green" : w.status === "Clarification Requested" ? "amber" : "blue"} className="!text-[10px]">{w.status}</Badge>
                      {w.riskScore > 30 && <Badge tone="red" className="!text-[10px]">Risk {w.riskScore}</Badge>}
                    </div>
                  </button>
                </li>
              );
            })}
            {list.length === 0 && <li className="px-3 py-8 text-center text-sm text-muted">No witnesses match.</li>}
          </ul>
        </Card>

        {/* CENTER PANEL: statement details */}
        <div className="col-span-12 lg:col-span-6 space-y-5">
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-royal/10 text-royal font-bold flex items-center justify-center text-base">{witness.initials}</div>
                <div>
                  <h3 className="text-lg font-bold text-soft">{witness.name}</h3>
                  <div className="text-xs text-muted">{witness.organization} &middot; {witness.country}</div>
                </div>
              </div>
              <Badge tone={witness.status === "Approved" ? "green" : "gold"}>{witness.status}</Badge>
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <KV label="Expertise">{witness.expertise}</KV>
              <KV label="Attempt">{witness.attemptId}</KV>
              <KV label="Invited">{formatDate(witness.invitedAt)}</KV>
              <KV label="Submitted">{witness.submittedAt ? formatDate(witness.submittedAt) : "—"}</KV>
              <KV label="Coverage">{witness.duration.coveredHours}/{witness.duration.requiredHours}h</KV>
              <KV label="Risk score">{witness.riskScore}/100</KV>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-soft flex items-center gap-2"><FileText className="h-4 w-4 text-royal" /> Submitted statement</h3>
            <div className="mt-3 rounded-xl border border-line bg-canvas p-4 text-sm text-soft leading-relaxed">
              <p>
                I, <span className="font-semibold">{witness.name}</span> ({witness.organization}), hereby declare that I personally
                observed the entire attempt &ldquo;{attempt?.title ?? witness.attemptId}&rdquo; at {attempt?.venue ?? "the venue"} between{" "}
                {attempt ? `${formatDate(attempt.startISO)} and ${formatDate(attempt.endISO)}` : "the scheduled period"}.
              </p>
              <p className="mt-3">
                All Guinness World Records guidelines were followed. I confirm that measurements were taken using approved equipment,
                continuous coverage was maintained, and the final result represents an accurate record of the attempt.
              </p>
              <p className="mt-3 italic text-muted">Signed digitally on {formatDate(witness.submittedAt ?? witness.invitedAt)}.</p>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-soft flex items-center gap-2"><BookOpen className="h-4 w-4 text-royal" /> Evidence attachments</h3>
            <ul className="mt-3 divide-y divide-line">
              {["Witness_Statement_Signed.pdf", "ID_Verification.png", "Calibration_Cert.pdf", "Coverage_Log.csv"].map((n, i) => (
                <li key={n} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-royal/10 text-royal text-[10px] font-semibold flex items-center justify-center">{n.split(".")[1]?.toUpperCase()}</div>
                    <div className="text-sm text-soft">{n}</div>
                  </div>
                  <div className="text-[11px] text-muted">{[412, 1280, 96, 22][i]} KB</div>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-1.5"><span className="text-soft">Timeline coverage</span><span className="text-muted">{witness.duration.coveredHours}/{witness.duration.requiredHours}h</span></div>
              <Progress value={(witness.duration.coveredHours / witness.duration.requiredHours) * 100} tone="blue" />
            </div>
          </Card>
        </div>

        {/* RIGHT PANEL: AI insights + actions */}
        <div className="col-span-12 lg:col-span-3 space-y-5">
          <Card>
            <h3 className="font-semibold text-soft flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-royal" /> AI insights</h3>
            <div className="mt-3 space-y-2.5">
              {aiInsights.map((i) => {
                const t = STATUS_ICON[i.status];
                return (
                  <div key={i.id} className={`rounded-lg border p-3 ${t.cls}`}>
                    <div className="flex items-start gap-2.5">
                      <t.Icon className="h-4 w-4 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-semibold">{i.label}</div>
                        <div className="text-[11px] opacity-80 mt-0.5">{i.detail}</div>
                        <div className="text-[10px] mt-1 opacity-80">Confidence {(i.confidence * 100).toFixed(0)}%</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-soft">Decision</h3>
            <p className="text-[11px] text-muted mt-1">Take action and record an internal note.</p>
            <div className="mt-3 space-y-2">
              <Button className="w-full" onClick={() => setDecisions({ ...decisions, [witness.id]: "approved" })}>
                <CheckCircle2 className="h-4 w-4" /> Approve witness
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setDecisions({ ...decisions, [witness.id]: "clarify" })}>
                <MessageSquareWarning className="h-4 w-4" /> Request clarification
              </Button>
              <button
                onClick={() => setDecisions({ ...decisions, [witness.id]: "rejected" })}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 transition"
              >
                <X className="h-4 w-4" /> Reject witness
              </button>
            </div>
            <textarea
              className="input mt-3 min-h-[80px]" placeholder="Internal note (visible only to GWR adjudicators)&hellip;"
              value={note} onChange={(e) => setNote(e.target.value)}
            />
            {decision && (
              <div className={`mt-3 text-[11px] rounded-lg px-3 py-2 border ${decision === "approved" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : decision === "rejected" ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-amber-50 border-amber-200 text-amber-700"}`}>
                Decision recorded: <span className="font-semibold capitalize">{decision}</span>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

function KV({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted">{label}</div>
      <div className="text-sm text-soft">{children}</div>
    </div>
  );
}

function InvitationReviewRow({
  invitation, onApprove, onReject, onClarify,
}: {
  invitation: Invitation;
  onApprove: (note: string) => void;
  onReject: (note: string) => void;
  onClarify: (note: string) => void;
}) {
  const [open, setOpen] = useState(invitation.status === "Submitted");
  const [note, setLocalNote] = useState("");
  const attempt = attempts.find((a) => a.id === invitation.attemptId);
  const decided = invitation.status !== "Submitted";

  async function redownload() {
    if (!invitation.statement) return;
    const s = invitation.statement;
    await downloadFilledWitnessStatement(
      { ...s, declarationName: `${s.firstName} ${s.lastName}`.trim() },
      `GWR_Witness_Statement_${invitation.witnessName.replace(/[^A-Za-z0-9_-]+/g, "_")}.pdf`,
    );
  }

  return (
    <li className="py-3">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-royal/10 text-royal font-semibold flex items-center justify-center text-sm shrink-0">
          {invitation.witnessName.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-soft truncate">{invitation.witnessName}</div>
          <div className="text-[11px] text-muted truncate">
            {invitation.witnessEmail} &middot; {attempt?.title ?? invitation.attemptId}
          </div>
        </div>
        <Badge tone={
          invitation.status === "Approved" ? "green" :
          invitation.status === "Rejected" ? "red" :
          invitation.status === "Clarification Requested" ? "amber" : "blue"
        }>{invitation.status}</Badge>
        <button onClick={() => setOpen((v) => !v)} className="btn-ghost !p-1.5">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {open && invitation.statement && (
        <div className="mt-3 rounded-xl border border-line bg-canvas p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <KV label="Submitted">{invitation.submittedAt ? `${formatDate(invitation.submittedAt)} · ${formatTime(invitation.submittedAt)}` : "—"}</KV>
            <KV label="Final measurement">{invitation.statement.finalMeasurement || "—"}</KV>
            <KV label="Organisation">{invitation.statement.organisation || "—"}</KV>
            <KV label="Venue">{invitation.statement.venue}</KV>
            <KV label="Dates present">{invitation.statement.presentDates || "—"}</KV>
            <KV label="Expertise">{invitation.statement.expertise || "—"}</KV>
          </div>
          <div className="mt-3">
            <div className="text-[11px] uppercase tracking-wider text-muted">Observations</div>
            <p className="text-sm text-soft mt-1 whitespace-pre-line">{invitation.statement.witnessDetails}</p>
          </div>
          {invitation.statement.signatureDataUrl && (
            <div className="mt-3">
              <div className="text-[11px] uppercase tracking-wider text-muted">Digital signature</div>
              <img src={invitation.statement.signatureDataUrl} alt="signature" className="mt-1 h-16 bg-white rounded border border-line" />
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={redownload} className="btn-ghost border border-line"><FileDown className="h-4 w-4" /> Download filled PDF</button>
          </div>

          {!decided ? (
            <>
              <textarea
                className="input mt-4 min-h-[70px]"
                placeholder="Optional internal note / clarification message&hellip;"
                value={note} onChange={(e) => setLocalNote(e.target.value)}
              />
              <div className="mt-3 flex flex-wrap gap-2 justify-end">
                <button onClick={() => onClarify(note)} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100">
                  <MessageSquareWarning className="h-4 w-4" /> Request clarification
                </button>
                <button onClick={() => onReject(note)} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100">
                  <X className="h-4 w-4" /> Reject
                </button>
                <Button onClick={() => onApprove(note)}>
                  <CheckCircle2 className="h-4 w-4" /> Approve
                </Button>
              </div>
            </>
          ) : (
            invitation.reviewNote && (
              <p className="mt-3 text-sm text-soft italic">Reviewer note: &ldquo;{invitation.reviewNote}&rdquo;</p>
            )
          )}
        </div>
      )}
    </li>
  );
}
