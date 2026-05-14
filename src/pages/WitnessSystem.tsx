import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Link2,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserPlus,
  Eye,
  Copy,
  Printer,
  Filter,
  Users,
  ShieldCheck,
  Timer,
} from "lucide-react";
import { Badge, Button, Card, CardHeader, Input, PageHeader, Progress } from "@/components/ui";
import { witnesses as seed, attemptMeta } from "@/mock-data";
import type { Witness, WitnessRole, WitnessStatus } from "@/types";
import { formatDate, formatTime } from "@/lib/utils";

const ROLE_LABEL: Record<WitnessRole, string> = {
  specialist: "Specialist Witness",
  independent: "Independent Witness",
  timekeeper: "Timekeeper",
};

const STATUS_TONE: Record<WitnessStatus, "green" | "amber" | "blue" | "red"> = {
  completed: "green",
  "in-progress": "blue",
  pending: "amber",
  rejected: "red",
};

const STATUS_ICON: Record<WitnessStatus, React.ComponentType<{ className?: string }>> = {
  completed: CheckCircle2,
  "in-progress": Clock,
  pending: Mail,
  rejected: AlertTriangle,
};

function rolePill(role: WitnessRole) {
  const map: Record<WitnessRole, { tone: "blue" | "gold" | "default"; Icon: React.ComponentType<{ className?: string }> }> = {
    specialist: { tone: "blue", Icon: ShieldCheck },
    independent: { tone: "default", Icon: Users },
    timekeeper: { tone: "gold", Icon: Timer },
  };
  const { tone, Icon } = map[role];
  return (
    <Badge tone={tone}>
      <Icon className="h-3 w-3" /> {ROLE_LABEL[role]}
    </Badge>
  );
}

export default function WitnessSystem() {
  const [list, setList] = useState<Witness[]>(seed);
  const [filter, setFilter] = useState<"all" | WitnessStatus>("all");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Partial<Witness>>({
    firstName: "",
    lastName: "",
    email: "",
    organisation: "",
    expertise: "",
    role: "independent",
  });
  const [linkCopied, setLinkCopied] = useState<string | null>(null);
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const by = (s: WitnessStatus) => list.filter((w) => w.status === s).length;
    return {
      total: list.length,
      completed: by("completed"),
      pending: by("pending"),
      inProgress: by("in-progress"),
      specialists: list.filter((w) => w.role === "specialist" && w.status === "completed").length,
      timekeepers: list.filter((w) => w.role === "timekeeper" && w.status === "completed").length,
    };
  }, [list]);

  const filtered = filter === "all" ? list : list.filter((w) => w.status === filter);

  const sendInvite = (id: string) => {
    setList((arr) =>
      arr.map((w) =>
        w.id === id
          ? { ...w, status: "in-progress" as WitnessStatus, inviteSentAt: new Date().toISOString() }
          : w,
      ),
    );
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/witness/sign/${token}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    setLinkCopied(token);
    setTimeout(() => setLinkCopied(null), 1600);
  };

  const addWitness = () => {
    if (!draft.firstName || !draft.lastName || !draft.email) return;
    const id = `W-${String(list.length + 1).padStart(3, "0")}`;
    const token = "wt_" + Math.random().toString(16).slice(2, 8);
    setList([
      ...list,
      {
        id,
        firstName: draft.firstName!,
        lastName: draft.lastName!,
        email: draft.email!,
        organisation: draft.organisation || "",
        expertise: draft.expertise || "",
        role: (draft.role as WitnessRole) || "independent",
        status: "pending",
        token,
      },
    ]);
    setDraft({ firstName: "", lastName: "", email: "", organisation: "", expertise: "", role: "independent" });
    setAdding(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Digital Witness System"
        subtitle="Invite, track and sign witness statements for the Guinness World Records attempt — entirely online, with auto-generated PDFs."
        actions={
          <>
            <Button variant="outline">
              <Send className="h-4 w-4" /> Send batch reminders
            </Button>
            <Button variant="gold" onClick={() => setAdding(true)}>
              <UserPlus className="h-4 w-4" /> Add witness
            </Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="!p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted font-semibold">Total Witnesses</div>
          <div className="text-3xl font-bold mt-1">{stats.total}</div>
          <div className="text-[11px] text-muted mt-1">{stats.completed} signed · {stats.pending} pending</div>
        </Card>
        <Card className="!p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted font-semibold">Specialist Coverage</div>
          <div className="text-3xl font-bold mt-1">{stats.specialists}<span className="text-base text-muted">/2</span></div>
          <Progress value={(stats.specialists / 2) * 100} tone={stats.specialists >= 2 ? "green" : "gold"} />
        </Card>
        <Card className="!p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted font-semibold">Timekeepers</div>
          <div className="text-3xl font-bold mt-1">{stats.timekeepers}<span className="text-base text-muted">/2</span></div>
          <Progress value={(stats.timekeepers / 2) * 100} tone={stats.timekeepers >= 2 ? "green" : "gold"} />
        </Card>
        <Card className="!p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted font-semibold">In progress</div>
          <div className="text-3xl font-bold mt-1 text-royal">{stats.inProgress}</div>
          <div className="text-[11px] text-muted mt-1">awaiting signature</div>
        </Card>
        <Card className="!p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted font-semibold">Auto-reminders</div>
          <div className="text-3xl font-bold mt-1">Daily</div>
          <div className="text-[11px] text-muted mt-1">last batch 9 hours ago</div>
        </Card>
      </div>

      {/* Filter strip */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted" />
        {(["all", "pending", "in-progress", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={
              "chip " +
              (filter === f ? "!bg-royal/10 !text-royal !border-royal/30 font-semibold" : "")
            }
          >
            {f === "all" ? "All" : f.replace("-", " ")}
          </button>
        ))}
      </div>

      {/* Witness cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((w) => {
          const Icon = STATUS_ICON[w.status];
          const inviteUrl = `${window.location.origin}/witness/sign/${w.token}`;
          return (
            <Card key={w.id} className="!p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-royal text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {w.firstName[0]}
                    {w.lastName[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold truncate">
                      {w.firstName} {w.lastName}
                    </div>
                    <div className="text-[12px] text-muted truncate">{w.organisation}</div>
                    <div className="text-[11px] text-muted truncate">{w.expertise}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {rolePill(w.role)}
                  <Badge tone={STATUS_TONE[w.status]}>
                    <Icon className="h-3 w-3" /> {w.status.replace("-", " ")}
                  </Badge>
                </div>
              </div>

              {/* Shareable link */}
              <div className="mt-4 rounded-lg bg-canvas border border-line p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-muted font-semibold flex items-center gap-1">
                      <Link2 className="h-3 w-3" /> Shareable signing link
                    </div>
                    <div className="text-[12px] font-mono truncate text-soft mt-0.5">{inviteUrl}</div>
                  </div>
                  <button
                    onClick={() => copyLink(w.token)}
                    className="btn-ghost !py-1.5 !px-2"
                    title="Copy link"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
                {linkCopied === w.token && (
                  <div className="text-[11px] text-emerald-600 mt-1">Copied to clipboard</div>
                )}
              </div>

              {/* Shift */}
              {(w.shiftStartISO || w.shiftEndISO) && (
                <div className="mt-3 text-[12px] text-muted">
                  Shift: {w.shiftStartISO && formatDate(w.shiftStartISO)}{" "}
                  {w.shiftStartISO && `${formatTime(w.shiftStartISO)}`}
                  {w.shiftEndISO && ` → ${formatTime(w.shiftEndISO)}`}
                </div>
              )}
              {w.completedAt && (
                <div className="text-[11px] text-emerald-700 mt-1">
                  Signed {formatDate(w.completedAt)} {formatTime(w.completedAt)}
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 flex flex-wrap gap-2">
                {w.status === "pending" && (
                  <Button variant="primary" onClick={() => sendInvite(w.id)}>
                    <Send className="h-4 w-4" /> Send invitation
                  </Button>
                )}
                {w.status === "in-progress" && (
                  <Button variant="outline" onClick={() => sendInvite(w.id)}>
                    <Mail className="h-4 w-4" /> Resend
                  </Button>
                )}
                <Button variant="outline" onClick={() => navigate(`/witness/sign/${w.token}`)}>
                  <Eye className="h-4 w-4" /> Preview form
                </Button>
                {w.status === "completed" && (
                  <Button variant="ghost">
                    <Printer className="h-4 w-4" /> Export PDF
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add witness modal */}
      {adding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-soft/40 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg">
            <CardHeader title="Invite a witness" subtitle={`for ${attemptMeta.recordTitle}`} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="First name" value={draft.firstName} onChange={(e) => setDraft({ ...draft, firstName: e.target.value })} />
              <Input placeholder="Last name" value={draft.lastName} onChange={(e) => setDraft({ ...draft, lastName: e.target.value })} />
              <Input className="col-span-2" placeholder="Email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
              <Input className="col-span-2" placeholder="Organisation" value={draft.organisation} onChange={(e) => setDraft({ ...draft, organisation: e.target.value })} />
              <Input className="col-span-2" placeholder="Field of expertise" value={draft.expertise} onChange={(e) => setDraft({ ...draft, expertise: e.target.value })} />
              <select
                className="input col-span-2"
                value={draft.role}
                onChange={(e) => setDraft({ ...draft, role: e.target.value as WitnessRole })}
              >
                <option value="independent">Independent witness</option>
                <option value="specialist">Specialist witness (AI/ML)</option>
                <option value="timekeeper">Timekeeper</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
              <Button variant="gold" onClick={addWitness}>
                <Send className="h-4 w-4" /> Invite & generate link
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
