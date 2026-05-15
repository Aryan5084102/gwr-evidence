import { Sparkles } from "lucide-react";

export default function AIInsightCard({
  title,
  insight,
  confidence,
}: {
  title: string;
  insight: string;
  confidence: number;
}) {
  return (
    <div className="panel p-4 relative overflow-hidden">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-7 w-7 rounded-lg bg-royal/10 flex items-center justify-center">
          <Sparkles className="h-3.5 w-3.5 text-royal" />
        </div>
        <div className="text-[10px] uppercase tracking-wider text-muted">AI Insight</div>
        <div className="ml-auto text-xs font-bold text-royal">{confidence}%</div>
      </div>
      <div className="text-sm font-semibold mb-1 text-soft">{title}</div>
      <p className="text-xs text-muted leading-relaxed">{insight}</p>
    </div>
  );
}
