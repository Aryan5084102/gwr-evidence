import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, PageHeader, Badge } from "@/components/ui";
import { Search, Download, AlertTriangle, Loader2 } from "lucide-react";
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

export default function AuditLogs() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const { data: entries = [], isLoading, isError, error } = useQuery({
    queryKey: ["audit", page, pageSize],
    queryFn: () => auditApi.list(page, pageSize),
    refetchOnWindowFocus: false,
  });

  const filtered = useMemo(() => {
    if (!q.trim()) return entries;
    const n = q.toLowerCase();
    return entries.filter((e) =>
      `${e.actor_id ?? ""} ${e.action} ${e.target_type ?? ""} ${e.target_id ?? ""} ${e.ip ?? ""}`
        .toLowerCase()
        .includes(n)
    );
  }, [entries, q]);

  function exportCsv() {
    downloadCSV(`audit_page${page}.csv`, [
      ["Timestamp", "Actor", "Action", "Target Type", "Target ID", "IP", "Hash"],
      ...entries.map((e) => [e.ts, e.actor_id ?? "", e.action, e.target_type ?? "", e.target_id ?? "", e.ip ?? "", e.hash ?? ""]),
    ]);
  }

  return (
    <>
      <PageHeader
        eyebrow="Compliance"
        title="Audit logs"
        subtitle="Immutable record of every action taken in the portal &mdash; signed and timestamped."
        actions={
          <button onClick={exportCsv} disabled={entries.length === 0} className="btn-ghost border border-line">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        }
      />
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="relative max-w-md flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              className="input pl-9"
              placeholder="Filter audit events…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-[12px] text-muted">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-ghost border border-line text-xs disabled:opacity-50"
            >
              Prev
            </button>
            <span>Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={entries.length < pageSize}
              className="btn-ghost border border-line text-xs disabled:opacity-50"
            >
              Next
            </button>
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
              {q ? "Try a different search term." : "The audit log is empty for this page."}
            </div>
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-muted">
                  <th className="text-left py-2 px-3">Timestamp</th>
                  <th className="text-left py-2 px-3">Actor</th>
                  <th className="text-left py-2 px-3">Action</th>
                  <th className="text-left py-2 px-3">Target</th>
                  <th className="text-left py-2 px-3">IP</th>
                  <th className="text-left py-2 px-3">Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-canvas/60">
                    <td className="py-3 px-3 text-[12px] text-muted whitespace-nowrap">
                      {formatDate(e.ts)} &middot; {formatTime(e.ts)}
                      <div className="text-[10px]">{relativeTime(e.ts)}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-soft text-[12px]">
                        {e.actor_id ? e.actor_id.slice(0, 8) : <span className="text-muted">system</span>}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[12px] text-soft font-medium">{e.action}</td>
                    <td className="py-3 px-3 text-[12px] text-soft">
                      {e.target_type && <Badge tone="default">{e.target_type}</Badge>}
                      {e.target_id && <span className="ml-1 font-mono text-[11px] text-muted">{e.target_id.slice(0, 8)}</span>}
                    </td>
                    <td className="py-3 px-3 text-[11px] text-muted font-mono">{e.ip ?? "—"}</td>
                    <td className="py-3 px-3 text-[10px] text-muted font-mono truncate max-w-[120px]" title={e.hash ?? ""}>
                      {e.hash ? `${e.hash.slice(0, 10)}…` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
