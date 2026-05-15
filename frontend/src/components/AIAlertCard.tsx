import { AlertTriangle, ShieldAlert, Info, Flame } from "lucide-react";
import type { AIAlert } from "@/types";
import { Badge } from "./ui";

const CFG: Record<AIAlert["severity"], { tone: any; Icon: any; label: string; bg: string; text: string }> = {
  low: { tone: "default", Icon: Info, label: "Low", bg: "bg-slate-100", text: "text-slate-600" },
  medium: { tone: "amber", Icon: AlertTriangle, label: "Medium", bg: "bg-amber-50", text: "text-amber-700" },
  high: { tone: "red", Icon: ShieldAlert, label: "High", bg: "bg-rose-50", text: "text-rose-700" },
  critical: { tone: "red", Icon: Flame, label: "Critical", bg: "bg-rose-50", text: "text-rose-700" },
};

export default function AIAlertCard({ alert }: { alert: AIAlert }) {
  const c = CFG[alert.severity];
  return (
    <div className="panel p-4 hover:border-royal/30 transition">
      <div className="flex items-center gap-2 mb-2">
        <div className={`h-7 w-7 rounded-lg ${c.bg} flex items-center justify-center`}>
          <c.Icon className={`h-3.5 w-3.5 ${c.text}`} />
        </div>
        <Badge tone={c.tone}>{c.label} severity</Badge>
        <span className="ml-auto text-[11px] text-muted">{alert.id}</span>
      </div>
      <div className="text-sm font-semibold text-soft">{alert.title}</div>
      <p className="text-xs text-muted mt-1 leading-relaxed">{alert.description}</p>
      <div className="mt-3 pt-3 border-t border-line">
        <div className="text-[10px] uppercase tracking-wider text-royal font-semibold mb-1">AI Recommendation</div>
        <p className="text-xs text-soft leading-relaxed">{alert.recommendation}</p>
      </div>
    </div>
  );
}
