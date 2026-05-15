import { useState } from "react";
import { Card, PageHeader, Badge } from "@/components/ui";
import { activityFeed } from "@/mock-data/portal";
import { Search, Download } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";

export default function AuditLogs() {
  const [q, setQ] = useState("");
  const items = activityFeed.filter((e) => `${e.actor} ${e.action} ${e.target}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader
        eyebrow="Compliance"
        title="Audit logs"
        subtitle="Immutable record of every action taken in the portal &mdash; signed and timestamped."
        actions={<button className="btn-ghost border border-line"><Download className="h-4 w-4" /> Export CSV</button>}
      />
      <Card>
        <div className="relative max-w-md mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input className="input pl-9" placeholder="Filter audit events&hellip;" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted">
                <th className="text-left py-2 px-3">Timestamp</th>
                <th className="text-left py-2 px-3">Actor</th>
                <th className="text-left py-2 px-3">Action</th>
                <th className="text-left py-2 px-3">Target</th>
                <th className="text-left py-2 px-3">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((e) => (
                <tr key={e.id} className="hover:bg-canvas">
                  <td className="py-3 px-3 text-[12px] text-muted">{formatDate(e.ts)} &middot; {formatTime(e.ts)}</td>
                  <td className="py-3 px-3"><div className="font-semibold text-soft">{e.actor}</div><div className="text-[11px] text-muted">{e.actorRole}</div></td>
                  <td className="py-3 px-3 text-[12px] text-soft">{e.action}</td>
                  <td className="py-3 px-3 text-[12px] text-soft">{e.target}</td>
                  <td className="py-3 px-3"><Badge tone={e.tone === "warning" ? "amber" : e.tone === "success" ? "green" : "blue"}>{e.tone ?? "info"}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
