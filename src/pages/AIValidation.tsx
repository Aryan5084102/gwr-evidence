import { Button, Card, CardHeader, PageHeader, Progress } from "@/components/ui";
import AIAlertCard from "@/components/AIAlertCard";
import { aiAlerts } from "@/mock-data";
import { ShieldCheck, Sparkles } from "lucide-react";

const QUALITY = [
  { label: "Continuity", value: 98 },
  { label: "Witness Coverage", value: 64 },
  { label: "Media Coverage", value: 86 },
  { label: "Metadata Completeness", value: 92 },
  { label: "Audio Quality", value: 71 },
  { label: "Duplicate Hygiene", value: 88 },
];

export default function AIValidation() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Validation & Alert Center"
        subtitle="Detected gaps, anomalies, and AI-graded evidence quality — with prescriptive recommendations."
        actions={<Button variant="gold"><Sparkles className="h-4 w-4" /> Re-validate</Button>}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader title="Overall Quality Score" subtitle="Composite from 6 signals" action={<ShieldCheck className="h-4 w-4 text-gold" />} />
          <div className="text-6xl font-bold gold-text">82</div>
          <p className="text-xs text-muted mt-2">High confidence. Address 1 critical and 1 high alert to move to "submission-ready".</p>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title="Evidence Quality Breakdown" />
          <div className="grid sm:grid-cols-2 gap-3">
            {QUALITY.map((q) => (
              <div key={q.label} className="panel p-3">
                <div className="flex items-center justify-between text-sm">
                  <span>{q.label}</span>
                  <span className={q.value >= 85 ? "text-emerald-700" : q.value >= 70 ? "text-gold" : "text-rose-700"}>{q.value}%</span>
                </div>
                <div className="mt-2"><Progress value={q.value} tone={q.value >= 85 ? "green" : q.value >= 70 ? "gold" : "red"} /></div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Active Alerts" subtitle={`${aiAlerts.length} items requiring attention`} />
        <div className="grid md:grid-cols-2 gap-3">
          {aiAlerts.map((a) => <AIAlertCard key={a.id} alert={a} />)}
        </div>
      </Card>
    </div>
  );
}
