import { Button, Card, CardHeader, PageHeader } from "@/components/ui";
import ReviewerCommentPanel from "@/components/ReviewerCommentPanel";
import { comments, reviewers } from "@/mock-data";
import { AtSign, MessageSquare, Pin } from "lucide-react";

export default function Collaboration() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reviewer Collaboration"
        subtitle="Threaded discussions, mentions, annotations, and live presence — designed for high-trust adjudication."
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Active Threads" subtitle="Pinned and live discussions" action={<Button variant="outline"><Pin className="h-4 w-4" /> Pin new</Button>} />
            <ReviewerCommentPanel comments={comments} />
          </Card>

          <Card>
            <CardHeader title="Annotations" subtitle="Anchored to specific evidence frames & pages" />
            <div className="space-y-3">
              {[
                { e: "aerial_full_event_1.mp4 · 22:14", note: "Verify count overlay matches timekeeper sheet 3." },
                { e: "witness_statement_3.pdf · p.2", note: "Cross-reference timeline with statement 5." },
                { e: "crowd_capture_4.jpg", note: "High-res duplicate available — consider replacing." },
              ].map((a, i) => (
                <div key={i} className="panel p-3 flex gap-3">
                  <div className="h-8 w-8 rounded-lg bg-gold/15 flex items-center justify-center"><MessageSquare className="h-3.5 w-3.5 text-gold" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted">{a.e}</div>
                    <div className="text-sm mt-0.5">{a.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Reviewers Online" subtitle="Live presence" />
            <div className="space-y-3">
              {reviewers.map((r) => (
                <div key={r.id} className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-9 w-9 rounded-full bg-royal text-white flex items-center justify-center text-xs font-bold">{r.avatar}</div>
                    {r.active && <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-white" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate">{r.name}</div>
                    <div className="text-[11px] text-muted truncate">{r.role}</div>
                  </div>
                  <button className="btn-ghost !p-1.5"><AtSign className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Reactions" subtitle="Last 24 hours" />
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              {[["✅", "Verified", 42], ["🔍", "Investigate", 18], ["⚠️", "Concern", 6], ["📌", "Pinned", 11]].map(([e, l, c]) => (
                <div key={String(l)} className="panel p-3">
                  <div className="text-2xl">{e}</div>
                  <div className="text-muted mt-1">{l}</div>
                  <div className="font-bold mt-1">{c}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
