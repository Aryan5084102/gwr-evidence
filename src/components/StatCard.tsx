import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";

export default function StatCard({
  label,
  value,
  delta,
  tone = "blue",
  Icon,
}: {
  label: string;
  value: number;
  delta?: string;
  tone?: "gold" | "blue" | "green" | "red";
  Icon: any;
}) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const dur = 700;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.round(value * (0.2 + 0.8 * (1 - Math.pow(1 - p, 3)))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const tones = {
    gold: { bg: "bg-[#FBF5E5]", text: "text-[#8A6F1F]" },
    blue: { bg: "bg-royal/10", text: "text-royal" },
    green: { bg: "bg-emerald-50", text: "text-emerald-700" },
    red: { bg: "bg-rose-50", text: "text-rose-700" },
  } as const;
  return (
    <div className="panel p-5 relative overflow-hidden">
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted">{label}</div>
          <div className="mt-2 text-3xl font-bold tracking-tight text-soft">{n.toLocaleString()}</div>
          {delta && (
            <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-emerald-700">
              <TrendingUp className="h-3 w-3" /> {delta}
            </div>
          )}
        </div>
        <div className={`h-10 w-10 rounded-xl ${tones[tone].bg} flex items-center justify-center ${tones[tone].text}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
