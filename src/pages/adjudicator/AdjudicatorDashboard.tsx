import { Link } from "react-router-dom";
import { Users, FileCheck2, AlertTriangle, ShieldCheck, ArrowRight, Activity } from "lucide-react";
import { Card, PageHeader, Badge, Progress } from "@/components/ui";
import StatCard from "@/components/StatCard";
import { witnesses, activityFeed, clarifications, attempts } from "@/mock-data/portal";
import { formatDate, formatTime } from "@/lib/utils";
import { useAppSelector } from "@/redux/store";

export default function AdjudicatorDashboard() {
  const user = useAppSelector((s) => s.auth.user);
  const pending = witnesses.filter((w) => w.status === "Pending Approval").length;
  const approved = witnesses.filter((w) => w.status === "Approved").length;
  const flagged = witnesses.filter((w) => w.riskScore > 30).length;
  const openClar = clarifications.filter((c) => c.status === "Open").length;

  // Mini bar chart data
  const weekly = [12, 18, 14, 22, 26, 19, 24];

  return (
    <>
      <PageHeader
        eyebrow="Adjudicator Workspace"
        title={`Good day, ${user?.name?.split(" ")[0]}.`}
        subtitle="Operational overview of your queue, AI validation alerts, and live review activity."
        actions={
          <Link to="/adjudicator/witnesses" className="btn-primary">
            <Users className="h-4 w-4" /> Open review queue
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pending Witness Approvals" value={pending} Icon={FileCheck2} tone="blue" delta="2 SLA breaches" />
        <StatCard label="Active Reviews" value={attempts.length} Icon={Activity} tone="gold" />
        <StatCard label="Validation Alerts" value={flagged} Icon={AlertTriangle} tone="red" />
        <StatCard label="Approved Witnesses" value={approved} Icon={ShieldCheck} tone="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-soft">Review throughput</h3>
              <p className="text-xs text-muted">Witnesses processed per day this week.</p>
            </div>
            <Badge tone="blue">+18% vs last week</Badge>
          </div>
          <div className="flex items-end gap-3 h-40">
            {weekly.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2">
                <div className="w-full rounded-t-md bg-gradient-to-t from-royal/80 to-royal" style={{ height: `${v * 4}px` }} />
                <div className="text-[10px] text-muted">{["M","T","W","T","F","S","S"][i]}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <Metric label="Avg time / witness" value="6m 42s" />
            <Metric label="AI agreement rate" value="94.1%" />
            <Metric label="Open clarifications" value={`${openClar}`} />
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-soft">My queue health</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <Bar label="Pending approval" value={pending} max={20} tone="blue" />
            <Bar label="Clarification requested" value={witnesses.filter((w) => w.status === "Clarification Requested").length} max={10} tone="gold" />
            <Bar label="Approved" value={approved} max={20} tone="green" />
            <Bar label="High-risk flagged" value={flagged} max={10} tone="red" />
          </ul>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-soft">Reviewer activity feed</h3>
            <Link to="/adjudicator/audit" className="text-xs text-royal hover:underline inline-flex items-center gap-1">
              Audit logs <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="space-y-3">
            {activityFeed.slice(0, 6).map((e) => (
              <li key={e.id} className="text-sm flex gap-3">
                <div className="h-2 w-2 rounded-full bg-royal mt-2" />
                <div>
                  <div className="text-soft"><span className="font-semibold">{e.actor}</span> <span className="text-muted">{e.action}</span> <span className="font-semibold text-royal">{e.target}</span></div>
                  <div className="text-[11px] text-muted">{formatDate(e.ts)} &middot; {formatTime(e.ts)}</div>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-soft">Open clarifications</h3>
            <Link to="/adjudicator/clarifications" className="text-xs text-royal hover:underline">Manage</Link>
          </div>
          <ul className="divide-y divide-line">
            {clarifications.slice(0, 4).map((c) => (
              <li key={c.id} className="py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-soft truncate">{c.subject}</div>
                  <Badge tone={c.status === "Open" ? "amber" : "blue"}>{c.status}</Badge>
                </div>
                <div className="text-[11px] text-muted mt-1">{c.attemptId} &middot; to {c.to}</div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line p-3">
      <div className="text-lg font-bold text-soft">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted mt-0.5">{label}</div>
    </div>
  );
}

function Bar({ label, value, max, tone }: { label: string; value: number; max: number; tone: "blue"|"gold"|"green"|"red" }) {
  return (
    <li>
      <div className="flex items-center justify-between text-[12px] mb-1.5">
        <span className="text-soft">{label}</span>
        <span className="text-muted">{value}</span>
      </div>
      <Progress value={(value / max) * 100} tone={tone} />
    </li>
  );
}
