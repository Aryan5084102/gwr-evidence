import { useMemo, useState } from "react";
import { ScrollText, Search, Download } from "lucide-react";
import { Card, PageHeader, Badge, Button } from "@/components/ui";
import { adminAuditLog } from "@/mock-data/admin";
import { formatDate, formatTime } from "@/lib/utils";

type Tone = "info" | "success" | "warning" | "danger" | "All";

export default function AuditLog() {
  const [q, setQ] = useState("");
  const [tone, setTone] = useState<Tone>("All");

  const filtered = useMemo(() => {
    return adminAuditLog.filter((e) => {
      if (tone !== "All" && e.tone !== tone) return false;
      if (!q.trim()) return true;
      const n = q.toLowerCase();
      return (
        e.actor.toLowerCase().includes(n) ||
        e.action.toLowerCase().includes(n) ||
        e.target.toLowerCase().includes(n)
      );
    });
  }, [q, tone]);

  return (
    <>
      <PageHeader
        eyebrow="Admin · Compliance"
        title="Audit log"
        subtitle="Tamper-evident record of every assignment change, geo-fence event, and consent action."
        actions={
          <Button variant="outline">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        }
      />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="inline-flex items-center gap-2">
            <ScrollText className="h-4 w-4 text-royal" />
            <h3 className="font-semibold text-soft">Activity</h3>
            <Badge tone="default">{filtered.length}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search actor, action, target…"
                className="input pl-8 py-1.5 text-sm w-72"
              />
            </div>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as Tone)}
              className="input py-1.5 text-sm"
            >
              <option>All</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="danger">Danger</option>
            </select>
          </div>
        </div>

        <ul className="divide-y divide-line">
          {filtered.map((e) => (
            <li key={e.id} className="py-3 flex items-start gap-3">
              <div
                className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                  e.tone === "success" ? "bg-emerald-500" :
                  e.tone === "warning" ? "bg-amber-500" :
                  e.tone === "danger" ? "bg-rose-500" : "bg-royal"
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-soft">
                  <span className="font-semibold">{e.actor}</span>{" "}
                  <span className="text-muted">{e.action}</span>{" "}
                  <span className="font-semibold text-royal">{e.target}</span>
                </div>
                <div className="text-[11px] text-muted mt-0.5">
                  {formatDate(e.ts)} · {formatTime(e.ts)} · ref {e.id}
                </div>
              </div>
              <Badge tone={e.tone === "success" ? "green" : e.tone === "warning" ? "amber" : e.tone === "danger" ? "red" : "blue"}>
                {e.tone}
              </Badge>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
