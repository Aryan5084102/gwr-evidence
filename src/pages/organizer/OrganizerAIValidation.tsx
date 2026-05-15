import { Card, PageHeader, Badge, Progress } from "@/components/ui";
import { aiInsights, attempts, evidence } from "@/mock-data/portal";
import { Sparkles, ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";

const STATUS_ICON: Record<string, any> = {
  pass: { Icon: ShieldCheck, cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  warn: { Icon: AlertTriangle, cls: "text-amber-700 bg-amber-50 border-amber-200" },
  fail: { Icon: ShieldAlert, cls: "text-rose-700 bg-rose-50 border-rose-200" },
};

export default function OrganizerAIValidation() {
  return (
    <>
      <PageHeader
        eyebrow="Organizer"
        title="AI validation"
        subtitle="Pre-submission AI checks across your attempts so issues are resolved before adjudication."
        actions={<Badge tone="blue"><Sparkles className="h-3 w-3" /> Auto-runs after each upload</Badge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold text-soft">Per-attempt health</h3>
          <ul className="mt-4 space-y-4">
            {attempts.map((a) => (
              <li key={a.id}>
                <div className="flex items-center justify-between text-sm">
                  <div className="min-w-0">
                    <div className="font-semibold text-soft truncate">{a.title}</div>
                    <div className="text-[11px] text-muted">{a.id} &middot; {a.evidenceCount} evidence items</div>
                  </div>
                  <Badge tone={a.coveragePct >= 85 ? "green" : a.coveragePct >= 60 ? "blue" : "amber"}>{a.coveragePct}% coverage</Badge>
                </div>
                <div className="mt-2"><Progress value={a.coveragePct} tone={a.coveragePct >= 85 ? "green" : "blue"} /></div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h3 className="font-semibold text-soft">Live AI checks</h3>
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
      </div>

      <Card className="mt-6">
        <h3 className="font-semibold text-soft">Evidence with AI scores</h3>
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted">
                <th className="text-left py-2 px-3">Evidence</th>
                <th className="text-left py-2 px-3">Attempt</th>
                <th className="text-left py-2 px-3">AI score</th>
                <th className="text-left py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {evidence.map((e) => (
                <tr key={e.id} className="hover:bg-canvas">
                  <td className="py-3 px-3"><div className="font-semibold text-soft">{e.name}</div><div className="text-[11px] text-muted">{e.id} &middot; {e.size}</div></td>
                  <td className="py-3 px-3 text-[12px] text-soft">{e.attemptId}</td>
                  <td className="py-3 px-3 w-[180px]"><Progress value={e.aiScore ?? 0} tone={(e.aiScore ?? 0) >= 90 ? "green" : "blue"} /><div className="text-[11px] text-muted mt-1">{e.aiScore ?? 0}/100</div></td>
                  <td className="py-3 px-3"><Badge tone={e.status === "Approved" ? "green" : e.status === "Flagged" ? "red" : e.status === "Processing" ? "amber" : "blue"}>{e.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
