import {
  FileCheck2,
  Loader2,
  ScanSearch,
  Sparkles,
  TriangleAlert,
  Activity,
  ChevronRight,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import { Badge, Button, Card, CardHeader, PageHeader, Progress } from "@/components/ui";
import AIInsightCard from "@/components/AIInsightCard";
import StatusBadge from "@/components/StatusBadge";
import { reviewers, submissions } from "@/mock-data";
import { formatDate } from "@/lib/utils";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

const chartData = [
  { d: "Mon", uploads: 24, reviews: 18 },
  { d: "Tue", uploads: 38, reviews: 22 },
  { d: "Wed", uploads: 31, reviews: 27 },
  { d: "Thu", uploads: 52, reviews: 34 },
  { d: "Fri", uploads: 49, reviews: 41 },
  { d: "Sat", uploads: 28, reviews: 23 },
  { d: "Sun", uploads: 33, reviews: 30 },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Adjudication Overview"
        subtitle="Active submissions, AI processing intelligence, and reviewer activity across the global verification pipeline."
        actions={
          <>
            <Button variant="outline">Export digest</Button>
            <Button variant="gold"><Sparkles className="h-4 w-4" /> Ask AI</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Submissions" value={1248} delta="+8.2% w/w" tone="gold" Icon={FileCheck2} />
        <StatCard label="Processing" value={37} delta="+12% w/w" tone="blue" Icon={Loader2} />
        <StatCard label="Under Review" value={94} tone="blue" Icon={ScanSearch} />
        <StatCard label="Approved" value={812} delta="+2.1% w/w" tone="green" Icon={FileCheck2} />
        <StatCard label="Missing Evidence" value={11} tone="red" Icon={TriangleAlert} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Submission Pipeline"
            subtitle="Last 7 days · uploads vs completed reviews"
            action={<Badge tone="gold">Live</Badge>}
          />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="gU" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0057B8" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#0057B8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C8A44D" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#C8A44D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="d" stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 12, boxShadow: "0 4px 12px rgba(15,23,42,0.08)" }}
                  labelStyle={{ color: "#1F2937" }}
                />
                <Area type="monotone" dataKey="uploads" stroke="#0057B8" strokeWidth={2} fill="url(#gU)" />
                <Area type="monotone" dataKey="reviews" stroke="#C8A44D" strokeWidth={2} fill="url(#gR)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="AI Insights" subtitle="Generated 2 minutes ago" />
          <div className="space-y-3">
            <AIInsightCard
              title="Submission GWR-2025-0411 is review-ready"
              insight="All required evidence categories present. AI confidence 94%. Recommend assigning final adjudicator."
              confidence={94}
            />
            <AIInsightCard
              title="Audio clarity warning"
              insight="4 announcement clips in 0421 fall below speech-to-text confidence threshold."
              confidence={61}
            />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader title="Active Submissions" subtitle="Real-time pipeline status" action={<Button variant="ghost">View all <ChevronRight className="h-4 w-4" /></Button>} />
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <thead className="bg-canvas">
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted">
                  <th className="px-2 py-2 font-medium">Record</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                  <th className="px-2 py-2 font-medium">Progress</th>
                  <th className="px-2 py-2 font-medium">Evidence</th>
                  <th className="px-2 py-2 font-medium">Event Date</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr key={s.id} className="border-t border-line hover:bg-canvas">
                    <td className="px-2 py-3">
                      <div className="font-semibold truncate max-w-[260px]">{s.recordName}</div>
                      <div className="text-[11px] text-muted">{s.id} · {s.location}</div>
                    </td>
                    <td className="px-2 py-3"><StatusBadge status={s.status} /></td>
                    <td className="px-2 py-3 min-w-[140px]">
                      <Progress value={s.progress} tone="blue" />
                      <div className="text-[10px] text-muted mt-1">{s.progress}%</div>
                    </td>
                    <td className="px-2 py-3 text-muted">{s.evidenceCount}</td>
                    <td className="px-2 py-3 text-muted">{formatDate(s.eventDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader title="Reviewer Activity" subtitle="Last 24 hours" action={<Activity className="h-4 w-4 text-muted" />} />
          <div className="space-y-3">
            {reviewers.map((r, i) => (
              <div key={r.id} className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-9 w-9 rounded-full bg-royal text-white flex items-center justify-center text-xs font-bold">
                    {r.avatar}
                  </div>
                  {r.active && <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold truncate">{r.name}</div>
                  <div className="text-[11px] text-muted truncate">{["Approved 12 items","Flagged duplicates","Requested clarification","Generated package","Added 3 comments"][i]}</div>
                </div>
                <div className="text-[10px] text-muted">{`${i + 1}m`}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
