import { Link } from "react-router-dom";
import { Card, PageHeader, Badge, Progress } from "@/components/ui";
import { attempts, witnesses } from "@/mock-data/portal";
import { formatDate } from "@/lib/utils";
import { Plus, ArrowRight } from "lucide-react";

export default function Submissions() {
  return (
    <>
      <PageHeader
        eyebrow="Organizer"
        title="Submissions"
        subtitle="Every record attempt you are organizing &mdash; from upcoming events to fully ratified records."
        actions={<button className="btn-primary"><Plus className="h-4 w-4" /> New submission</button>}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {attempts.map((a) => {
          const ws = witnesses.filter((w) => w.attemptId === a.id);
          const approved = ws.filter((w) => w.status === "Approved").length;
          return (
            <Card key={a.id} className="hover:shadow-soft transition">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[11px] text-royal font-semibold tracking-wide">{a.id}</div>
                  <h3 className="text-base font-bold text-soft mt-1 leading-snug">{a.title}</h3>
                </div>
                <Badge tone={a.status === "Approved" ? "green" : a.status === "Live" ? "blue" : "gold"}>{a.status}</Badge>
              </div>
              <p className="text-xs text-muted mt-2 line-clamp-2">{a.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-[12px]">
                <KV label="Venue">{a.city}</KV>
                <KV label="Date">{formatDate(a.startISO)}</KV>
                <KV label="Witnesses">{approved}/{ws.length} approved</KV>
                <KV label="Evidence">{a.evidenceCount} items</KV>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-[12px] mb-1.5"><span className="text-soft">Readiness</span><span className="text-muted">{a.coveragePct}%</span></div>
                <Progress value={a.coveragePct} tone="blue" />
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                <Link to="/organizer/invite" className="text-xs text-royal hover:underline">Invite witness</Link>
                <Link to="/organizer/evidence" className="text-xs text-royal hover:underline inline-flex items-center gap-1">Manage <ArrowRight className="h-3 w-3" /></Link>
              </div>
            </Card>
          );
        })}
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
