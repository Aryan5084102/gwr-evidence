import { Card, PageHeader } from "@/components/ui";
import { activityFeed } from "@/mock-data/portal";
import { formatDate, formatTime } from "@/lib/utils";

const TONE: Record<string, string> = { info: "bg-royal", success: "bg-emerald-500", warning: "bg-amber-500", danger: "bg-rose-500" };

export default function ActivityLogs() {
  return (
    <>
      <PageHeader eyebrow="Organizer" title="Activity logs" subtitle="Chronological feed of every event across your record attempts." />
      <Card>
        <ol className="relative border-l border-line ml-2 space-y-6">
          {activityFeed.map((e) => (
            <li key={e.id} className="pl-6 relative">
              <span className={`absolute -left-[7px] top-1.5 h-3 w-3 rounded-full ring-4 ring-white ${TONE[e.tone ?? "info"]}`} />
              <div className="text-[11px] text-muted">{formatDate(e.ts)} &middot; {formatTime(e.ts)} &middot; {e.actorRole}</div>
              <div className="text-sm text-soft mt-0.5"><span className="font-semibold">{e.actor}</span> {e.action} <span className="font-semibold text-royal">{e.target}</span></div>
            </li>
          ))}
        </ol>
      </Card>
    </>
  );
}
