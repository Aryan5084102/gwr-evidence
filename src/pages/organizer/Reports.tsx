import { Card, PageHeader, Badge } from "@/components/ui";
import { attempts, witnesses } from "@/mock-data/portal";
import { Download, BarChart3 } from "lucide-react";

export default function Reports() {
  const total = attempts.length;
  const approved = witnesses.filter((w) => w.status === "Approved").length;
  const pending = witnesses.filter((w) => w.status === "Pending Approval").length;

  // Build 12 month synthetic bars
  const bars = Array.from({ length: 12 }, (_, i) => ({
    month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
    value: 8 + Math.round(Math.abs(Math.sin(i / 1.6)) * 18 + (i % 3) * 2),
  }));
  const max = Math.max(...bars.map((b) => b.value));

  return (
    <>
      <PageHeader
        eyebrow="Organizer"
        title="Reports"
        subtitle="Submission analytics, witness performance and operational readiness."
        actions={<button className="btn-ghost border border-line"><Download className="h-4 w-4" /> Export PDF</button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card><Metric label="Total record attempts" value={total} /></Card>
        <Card><Metric label="Witnesses approved" value={approved} tone="green" /></Card>
        <Card><Metric label="Witnesses pending" value={pending} tone="gold" /></Card>
      </div>

      <Card className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-soft flex items-center gap-2"><BarChart3 className="h-4 w-4 text-royal" /> Submission velocity</h3>
            <p className="text-xs text-muted">Record attempts started per month.</p>
          </div>
          <Badge tone="blue">12-month trend</Badge>
        </div>
        <div className="flex items-end gap-2 h-44">
          {bars.map((b) => (
            <div key={b.month} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full rounded-t-md bg-gradient-to-t from-royal/80 to-royal" style={{ height: `${(b.value / max) * 100}%` }} title={`${b.value}`} />
              <div className="text-[10px] text-muted">{b.month}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-6">
        <h3 className="font-semibold text-soft">Top categories</h3>
        <ul className="mt-3 divide-y divide-line">
          {Array.from(new Set(attempts.map((a) => a.category))).map((c) => {
            const count = attempts.filter((a) => a.category === c).length;
            return (
              <li key={c} className="py-3 flex items-center justify-between">
                <div className="text-sm text-soft">{c}</div>
                <Badge tone="blue">{count} attempt{count > 1 ? "s" : ""}</Badge>
              </li>
            );
          })}
        </ul>
      </Card>
    </>
  );
}

function Metric({ label, value, tone = "blue" }: { label: string; value: number; tone?: "blue" | "green" | "gold" }) {
  const text = tone === "green" ? "text-emerald-700" : tone === "gold" ? "text-[#8A6F1F]" : "text-royal";
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted">{label}</div>
      <div className={`mt-2 text-3xl font-bold ${text}`}>{value}</div>
    </div>
  );
}
