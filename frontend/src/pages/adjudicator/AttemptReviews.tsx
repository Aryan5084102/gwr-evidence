import { Link } from "react-router-dom";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { Badge, Card, PageHeader, Progress } from "@/components/ui";
import { attempts, witnesses } from "@/mock-data/portal";
import { formatDate } from "@/lib/utils";

export default function AttemptReviews() {
  return (
    <>
      <PageHeader eyebrow="Adjudicator" title="Attempt reviews" subtitle="All record attempts currently in your adjudication scope." />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted">
                <th className="text-left py-2 px-3">Attempt</th>
                <th className="text-left py-2 px-3">Status</th>
                <th className="text-left py-2 px-3">Witnesses</th>
                <th className="text-left py-2 px-3">Coverage</th>
                <th className="text-left py-2 px-3">Window</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {attempts.map((a) => {
                const ws = witnesses.filter((w) => w.attemptId === a.id);
                const approved = ws.filter((w) => w.status === "Approved").length;
                return (
                  <tr key={a.id} className="hover:bg-canvas">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-soft">{a.title}</div>
                      <div className="text-[11px] text-muted">{a.id} &middot; {a.category} &middot; {a.organizer.split("—")[0].trim()}</div>
                      <div className="text-[11px] text-muted mt-1 inline-flex items-center gap-3">
                        <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {a.city}, {a.country}</span>
                        <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {a.participantCount.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3"><Badge tone={a.status === "Approved" ? "green" : a.status === "Live" ? "blue" : "gold"}>{a.status}</Badge></td>
                    <td className="py-3 px-3 text-[12px] text-soft">{approved}/{ws.length} approved</td>
                    <td className="py-3 px-3 w-[180px]">
                      <Progress value={a.coveragePct} tone="blue" />
                      <div className="text-[11px] text-muted mt-1">{a.coveragePct}%</div>
                    </td>
                    <td className="py-3 px-3 text-[12px] text-muted inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(a.startISO)}</td>
                    <td className="py-3 px-3 text-right">
                      <Link to="/adjudicator/witnesses" className="text-royal text-xs inline-flex items-center gap-1 hover:underline">
                        Review <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
