import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ScrollText, Search, Download, AlertTriangle, Loader2 } from "lucide-react";
import { Card, PageHeader, Badge, Button } from "@/components/ui";
import { auditApi } from "@/lib/api/resources";
import { ApiError } from "@/lib/api";
import { formatDate, formatTime, relativeTime } from "@/lib/utils";

function downloadCSV(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((r) =>
      r.map((cell) => {
        const s = String(cell ?? "");
        if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
        return s;
      }).join(",")
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function AuditLog() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 100;

  const { data: entries = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ["audit", page, pageSize],
    queryFn: () => auditApi.list(page, pageSize),
    refetchOnWindowFocus: false,
  });

  const filtered = useMemo(() => {
    if (!q.trim()) return entries;
    const n = q.toLowerCase();
    return entries.filter((e) =>
      `${e.actor_id ?? ""} ${e.action} ${e.target_type ?? ""} ${e.target_id ?? ""}`
        .toLowerCase()
        .includes(n)
    );
  }, [entries, q]);

  function exportCsv() {
    downloadCSV(`gwr_audit_page${page}.csv`, [
      ["Timestamp", "Actor", "Action", "Target Type", "Target ID", "IP", "Hash"],
      ...entries.map((e) => [e.ts, e.actor_id ?? "", e.action, e.target_type ?? "", e.target_id ?? "", e.ip ?? "", e.hash ?? ""]),
    ]);
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin · Compliance"
        title="Audit log"
        subtitle="Tamper-evident record sourced from the live backend audit table. Includes every assignment change, login, and consent event."
        actions={
          <Button variant="outline" onClick={exportCsv} disabled={entries.length === 0}>
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
            <button onClick={() => refetch()} className="text-[11px] text-royal hover:underline ml-1">
              Refresh
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Filter by actor, action, target…"
                className="input pl-8 py-1.5 text-sm w-72"
              />
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-ghost text-xs disabled:opacity-40"
              >
                Prev
              </button>
              <span>p{page}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={entries.length < pageSize}
                className="btn-ghost text-xs disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="py-16 flex items-center justify-center gap-2 text-muted">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading audit log…
          </div>
        )}

        {isError && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 text-rose-700 p-3 text-sm inline-flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {error instanceof ApiError ? error.message : "Couldn't reach the audit endpoint."}
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-line p-8 text-center">
            <div className="text-sm font-semibold text-soft">No audit entries</div>
            <div className="text-[12px] text-muted mt-1">
              {q ? "Try a different search term." : "Backend audit log is empty for this page."}
            </div>
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <ul className="divide-y divide-line">
            {filtered.map((e) => (
              <li key={e.id} className="py-3 flex items-start gap-3">
                <div className="mt-1.5 h-2 w-2 rounded-full bg-royal shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-soft">
                    <span className="font-semibold">
                      {e.actor_id ? e.actor_id.slice(0, 8) : "system"}
                    </span>{" "}
                    <span className="text-muted">{e.action}</span>{" "}
                    {e.target_type && (
                      <span className="font-semibold text-royal">
                        {e.target_type}
                        {e.target_id ? ` · ${e.target_id.slice(0, 8)}` : ""}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-muted mt-0.5">
                    {formatDate(e.ts)} · {formatTime(e.ts)} · {relativeTime(e.ts)} · ref {e.id.slice(0, 8)}
                    {e.ip && <> · {e.ip}</>}
                  </div>
                </div>
                {e.hash && (
                  <span className="text-[10px] font-mono text-muted truncate max-w-[140px]" title={e.hash}>
                    {e.hash.slice(0, 10)}…
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
