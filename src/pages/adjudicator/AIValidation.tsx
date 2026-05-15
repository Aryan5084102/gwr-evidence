import { ShieldCheck, ShieldAlert, AlertTriangle, Sparkles, Activity, Fingerprint, FileSearch, Users, Clock } from "lucide-react";
import { Card, PageHeader, Badge, Progress } from "@/components/ui";
import { aiInsights, witnesses, attempts } from "@/mock-data/portal";

const STATUS_ICON: Record<string, any> = {
  pass: { Icon: ShieldCheck, cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  warn: { Icon: AlertTriangle, cls: "text-amber-700 bg-amber-50 border-amber-200" },
  fail: { Icon: ShieldAlert, cls: "text-rose-700 bg-rose-50 border-rose-200" },
};

const CHECKS = [
  { Icon: Fingerprint, label: "Identity verification", desc: "OCR + face match against passport.", score: 96 },
  { Icon: FileSearch, label: "OCR extraction", desc: "Text & signature fields extracted from PDFs.", score: 99 },
  { Icon: Clock, label: "Duration validation", desc: "Required coverage hours met by witnesses.", score: 88 },
  { Icon: Users, label: "Duplicate witness detection", desc: "Cross-match against historical statements.", score: 92 },
  { Icon: Activity, label: "Timeline coverage", desc: "Gap detection across reported watch windows.", score: 71 },
];

export default function AIValidation() {
  const healthScore = Math.round(CHECKS.reduce((a, c) => a + c.score, 0) / CHECKS.length);
  return (
    <>
      <PageHeader
        eyebrow="AI Validation"
        title="AI validation centre"
        subtitle="Automated checks across every witness, statement and piece of evidence."
        actions={<Badge tone="blue"><Sparkles className="h-3 w-3" /> Model: GWR-Verify v3.2</Badge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-soft">Evidence health score</h3>
              <p className="text-xs text-muted">Aggregate AI confidence across all active reviews.</p>
            </div>
            <Badge tone={healthScore >= 90 ? "green" : healthScore >= 75 ? "blue" : "amber"}>{healthScore}/100</Badge>
          </div>
          <Progress value={healthScore} tone={healthScore >= 90 ? "green" : "blue"} />

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
            {CHECKS.map((c) => (
              <div key={c.label} className="rounded-xl border border-line p-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-royal/10 text-royal flex items-center justify-center"><c.Icon className="h-4 w-4" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-soft">{c.label}</div>
                    <div className="text-[11px] text-muted">{c.desc}</div>
                  </div>
                  <div className="text-xl font-bold text-royal">{c.score}</div>
                </div>
                <div className="mt-3">
                  <Progress value={c.score} tone={c.score >= 90 ? "green" : c.score >= 75 ? "blue" : "gold"} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-soft">Current alerts</h3>
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
        <h3 className="font-semibold text-soft">Per-witness risk overview</h3>
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted">
                <th className="text-left py-2 px-3">Witness</th>
                <th className="text-left py-2 px-3">Attempt</th>
                <th className="text-left py-2 px-3">Coverage</th>
                <th className="text-left py-2 px-3">Risk score</th>
                <th className="text-left py-2 px-3">Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {witnesses.map((w) => {
                const a = attempts.find((x) => x.id === w.attemptId);
                const cov = Math.round((w.duration.coveredHours / Math.max(1, w.duration.requiredHours)) * 100);
                return (
                  <tr key={w.id} className="hover:bg-canvas">
                    <td className="py-3 px-3"><div className="font-semibold text-soft">{w.name}</div><div className="text-[11px] text-muted">{w.organization}</div></td>
                    <td className="py-3 px-3 text-[12px] text-soft">{a?.title}</td>
                    <td className="py-3 px-3 w-[140px]"><Progress value={cov} tone="blue" /><div className="text-[11px] text-muted mt-1">{cov}%</div></td>
                    <td className="py-3 px-3"><Badge tone={w.riskScore < 20 ? "green" : w.riskScore < 40 ? "blue" : "amber"}>{w.riskScore}/100</Badge></td>
                    <td className="py-3 px-3 text-[12px] text-soft">
                      {w.riskScore < 20 ? "AI: clean" : w.riskScore < 40 ? "AI: review recommended" : "AI: clarify required"}
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
