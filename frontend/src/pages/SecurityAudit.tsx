import { Badge, Card, CardHeader, PageHeader } from "@/components/ui";
import { auditLogs } from "@/mock-data";
import { Fingerprint, KeyRound, Lock, ShieldCheck } from "lucide-react";
import { formatTime, formatDate } from "@/lib/utils";

export default function SecurityAudit() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Security & Audit"
        subtitle="Immutable activity log, evidence integrity status, and secure access history across the workspace."
      />

      <div className="grid lg:grid-cols-4 gap-4">
        {[
          { Icon: ShieldCheck, l: "Integrity Score", v: "100%", s: "All hashes verified" },
          { Icon: Lock, l: "Encryption", v: "AES-256", s: "At rest & in transit" },
          { Icon: KeyRound, l: "Active Keys", v: "12", s: "HSM-managed" },
          { Icon: Fingerprint, l: "MFA Coverage", v: "100%", s: "Required for all users" },
        ].map((s) => (
          <Card key={s.l}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center">
                <s.Icon className="h-4 w-4 text-gold" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted">{s.l}</div>
                <div className="text-xl font-bold">{s.v}</div>
                <div className="text-[11px] text-muted">{s.s}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Audit Log"
            subtitle="Every action, signed and tamper-evident"
            action={<span className="chip"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> immutable</span>}
          />
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <thead className="bg-canvas">
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted">
                  <th className="px-2 py-2 font-medium">Actor</th>
                  <th className="px-2 py-2 font-medium">Action</th>
                  <th className="px-2 py-2 font-medium">Date</th>
                  <th className="px-2 py-2 font-medium">Time</th>
                  <th className="px-2 py-2 font-medium">IP</th>
                </tr>
              </thead>
              <tbody>
                {[...auditLogs, ...auditLogs].map((a, i) => (
                  <tr key={i} className="border-t border-line hover:bg-canvas">
                    <td className="px-2 py-3 font-medium">{a.actor}</td>
                    <td className="px-2 py-3 text-soft">{a.action}</td>
                    <td className="px-2 py-3 text-muted">{formatDate(a.time)}</td>
                    <td className="px-2 py-3 text-muted">{formatTime(a.time)}</td>
                    <td className="px-2 py-3 font-mono text-[11px] text-muted">{a.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader title="Evidence Integrity" subtitle="SHA-256 verification" />
          <div className="space-y-2 text-sm">
            {["GWR-2025-0411", "GWR-2025-0421", "GWR-2025-0433", "GWR-2025-0398"].map((s) => (
              <div key={s} className="flex items-center justify-between p-2.5 rounded-xl border border-line hover:bg-canvas">
                <div>
                  <div className="font-semibold">{s}</div>
                  <div className="text-[11px] font-mono text-muted">0x{Math.random().toString(16).slice(2, 18).toUpperCase()}…</div>
                </div>
                <Badge tone="green"><ShieldCheck className="h-3 w-3" /> verified</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
