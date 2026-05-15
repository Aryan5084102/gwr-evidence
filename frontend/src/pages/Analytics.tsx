import { Card, CardHeader, PageHeader } from "@/components/ui";
import StatCard from "@/components/StatCard";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { HardDrive, Sparkles, Timer, UsersRound } from "lucide-react";

const trend = Array.from({ length: 12 }).map((_, i) => ({
  m: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
  s: 40 + Math.round(Math.sin(i) * 12) + i * 3,
  a: 30 + Math.round(Math.cos(i) * 10) + i * 2,
}));

const reviewerProd = [
  { r: "Whitfield", v: 142 },
  { r: "Chen", v: 118 },
  { r: "Raghavan", v: 96 },
  { r: "Tanaka", v: 134 },
  { r: "Almeida", v: 78 },
];

const evidenceMix = [
  { name: "Videos", value: 18, color: "#0057B8" },
  { name: "Images", value: 62, color: "#003B7A" },
  { name: "Documents", value: 12, color: "#3B82F6" },
  { name: "Audio", value: 5, color: "#C8A44D" },
  { name: "Links", value: 3, color: "#93C5FD" },
];

const tooltip = {
  contentStyle: { background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 12, boxShadow: "0 4px 12px rgba(15,23,42,0.08)" },
  labelStyle: { color: "#1F2937" },
};

export default function Analytics() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="Executive-level visibility into evidence flow, review throughput, AI processing, and storage utilization."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Storage Used" value={6.8} Icon={HardDrive} tone="gold" delta="of 12 TB" />
        <StatCard label="Review Completion" value={91} Icon={Timer} tone="green" delta="+4% w/w" />
        <StatCard label="AI Items Processed" value={48230} Icon={Sparkles} tone="blue" delta="+1,284 today" />
        <StatCard label="Active Reviewers" value={42} Icon={UsersRound} tone="gold" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader title="Submission Trends" subtitle="12-month view · submissions vs approvals" />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="m" stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip {...tooltip} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#94A3B8" }} />
                <Line type="monotone" name="Submitted" dataKey="s" stroke="#0057B8" strokeWidth={2.5} dot={false} />
                <Line type="monotone" name="Approved" dataKey="a" stroke="#C8A44D" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Evidence Mix" subtitle="By type · current cycle" />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={evidenceMix} dataKey="value" nameKey="name" innerRadius={50} outerRadius={86} paddingAngle={2}>
                  {evidenceMix.map((e) => <Cell key={e.name} fill={e.color} />)}
                </Pie>
                <Tooltip {...tooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 text-[11px]">
            {evidenceMix.map((e) => (
              <div key={e.name} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: e.color }} />
                <span className="text-muted">{e.name}</span>
                <span className="ml-auto font-semibold">{e.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Reviewer Productivity" subtitle="Items adjudicated · last 30 days" />
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reviewerProd} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="r" stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip {...tooltip} />
              <Bar dataKey="v" fill="#0057B8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
