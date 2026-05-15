import { Link } from "react-router-dom";
import { Send, ClipboardList, UploadCloud, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { Card, PageHeader, Badge, Progress } from "@/components/ui";
import StatCard from "@/components/StatCard";
import { attempts, witnesses, activityFeed } from "@/mock-data/portal";
import { formatDate } from "@/lib/utils";
import { useAppSelector } from "@/redux/store";

export default function OrganizerDashboard() {
  const user = useAppSelector((s) => s.auth.user);
  const open = attempts.filter((a) => a.status !== "Approved" && a.status !== "Rejected").length;
  const witnessesAssigned = witnesses.length;
  const witnessesApproved = witnesses.filter((w) => w.status === "Approved").length;
  return (
    <>
      <PageHeader
        eyebrow="Organizer Workspace"
        title={`Hello, ${user?.name?.split(" ")[0]}.`}
        subtitle="Oversee live submissions, witness onboarding and evidence readiness across all your record attempts."
        actions={
          <>
            <Link to="/organizer/invite" className="btn-ghost border border-line"><Send className="h-4 w-4" /> Invite witness</Link>
            <Link to="/organizer/evidence" className="btn-primary"><UploadCloud className="h-4 w-4" /> Upload evidence</Link>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Open Submissions" value={open} Icon={ClipboardList} tone="blue" />
        <StatCard label="Witnesses Invited" value={witnessesAssigned} Icon={Send} tone="gold" />
        <StatCard label="Witnesses Approved" value={witnessesApproved} Icon={ShieldCheck} tone="green" />
        <StatCard label="AI Flags Open" value={2} Icon={Sparkles} tone="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-soft">Submission readiness</h3>
              <p className="text-xs text-muted">Evidence coverage across your active record attempts.</p>
            </div>
            <Link to="/organizer/submissions" className="text-xs text-royal hover:underline inline-flex items-center gap-1">All submissions <ArrowRight className="h-3 w-3" /></Link>
          </div>
          <ul className="space-y-4">
            {attempts.map((a) => (
              <li key={a.id}>
                <div className="flex items-center justify-between text-sm">
                  <div className="min-w-0">
                    <div className="font-semibold text-soft truncate">{a.title}</div>
                    <div className="text-[11px] text-muted">{a.id} &middot; {formatDate(a.startISO)}</div>
                  </div>
                  <Badge tone={a.status === "Approved" ? "green" : a.status === "Live" ? "blue" : "gold"}>{a.status}</Badge>
                </div>
                <div className="mt-2"><Progress value={a.coveragePct} tone="blue" /></div>
                <div className="text-[11px] text-muted mt-1">{a.coveragePct}% coverage &middot; {a.evidenceCount} evidence items</div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h3 className="font-semibold text-soft">Witness onboarding</h3>
          <ul className="mt-4 divide-y divide-line">
            {witnesses.slice(0, 5).map((w) => (
              <li key={w.id} className="py-3 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-royal/10 text-royal font-semibold flex items-center justify-center text-sm">{w.initials}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-soft truncate">{w.name}</div>
                  <div className="text-[11px] text-muted truncate">{w.attemptId}</div>
                </div>
                <Badge tone={w.status === "Approved" ? "green" : w.status === "Invited" ? "default" : "gold"} className="!text-[10px]">{w.status}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-6">
        <h3 className="font-semibold text-soft">Activity feed</h3>
        <ul className="mt-3 space-y-3">
          {activityFeed.slice(0, 6).map((e) => (
            <li key={e.id} className="text-sm flex gap-3">
              <div className="h-2 w-2 rounded-full bg-royal mt-2" />
              <div className="flex-1">
                <div className="text-soft"><span className="font-semibold">{e.actor}</span> <span className="text-muted">{e.action}</span> <span className="font-semibold text-royal">{e.target}</span></div>
                <div className="text-[11px] text-muted">{formatDate(e.ts)}</div>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
