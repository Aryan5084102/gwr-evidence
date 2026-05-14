import { Button, Card, CardHeader, PageHeader } from "@/components/ui";
import Timeline from "@/components/Timeline";
import { timeline } from "@/mock-data";
import { Download, Sparkles } from "lucide-react";

export default function SmartTimeline() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Smart Event Timeline"
        subtitle="AI-generated chronological narrative across all evidence. Click any node to inspect linked items."
        actions={
          <>
            <Button variant="outline"><Download className="h-4 w-4" /> Export PDF</Button>
            <Button variant="gold"><Sparkles className="h-4 w-4" /> Regenerate</Button>
          </>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader title="Event Chronology" subtitle="22 April 2026 · 09:00 → 23 April 2026 · 06:15" />
          <Timeline nodes={timeline} />
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader title="Continuity Score" subtitle="No gaps detected" />
            <div className="text-5xl font-bold gold-text">98.4%</div>
            <p className="text-xs text-muted mt-2">21h 15m of contiguous, time-coherent evidence across 4 camera sources.</p>
          </Card>
          <Card>
            <CardHeader title="Coverage Heatmap" subtitle="Evidence density by hour" />
            <div className="grid grid-cols-12 gap-1">
              {Array.from({ length: 24 }).map((_, h) => {
                const v = [3, 6, 8, 9, 7, 6, 4, 3, 2, 1, 1, 2, 4, 6, 7, 8, 9, 9, 8, 7, 6, 4, 3, 2][h];
                const intensity = v / 9;
                return (
                  <div
                    key={h}
                    title={`${h}:00 · ${v * 4} items`}
                    className="aspect-square rounded"
                    style={{ background: `rgba(212,175,55,${0.1 + intensity * 0.6})` }}
                  />
                );
              })}
            </div>
            <div className="mt-2 text-[10px] text-muted flex justify-between"><span>00h</span><span>12h</span><span>23h</span></div>
          </Card>
        </div>
      </div>
    </div>
  );
}
