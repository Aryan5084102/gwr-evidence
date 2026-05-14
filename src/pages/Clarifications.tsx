import { useState } from "react";
import { Badge, Button, Card, CardHeader, PageHeader } from "@/components/ui";
import { cn, formatTime } from "@/lib/utils";
import { reviewers } from "@/mock-data";
import { CheckCircle2, MessageSquare, Plus, Send } from "lucide-react";

const TICKETS = [
  { id: "CL-019", title: "Missing notarized witness signature", status: "open", priority: "critical", reviewer: reviewers[0], updated: "2026-05-13T10:14:00Z" },
  { id: "CL-018", title: "Provide secondary aerial source (02:14–02:46)", status: "open", priority: "high", reviewer: reviewers[3], updated: "2026-05-13T09:42:00Z" },
  { id: "CL-017", title: "Confirm scoreboard reading at 23:00", status: "responded", priority: "medium", reviewer: reviewers[1], updated: "2026-05-13T08:18:00Z" },
  { id: "CL-016", title: "Clarify counting method for moving participants", status: "resolved", priority: "low", reviewer: reviewers[2], updated: "2026-05-12T22:05:00Z" },
];

const tones: any = { open: "red", responded: "amber", resolved: "green" };

export default function Clarifications() {
  const [active, setActive] = useState(TICKETS[0].id);
  const ticket = TICKETS.find((t) => t.id === active)!;
  return (
    <div className="space-y-6">
      <PageHeader
        title="Clarification Management"
        subtitle="Open questions, organizer responses, and resolution tracking — modeled as a secure adjudicator ticketing system."
        actions={<Button variant="gold"><Plus className="h-4 w-4" /> New clarification</Button>}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader title="Tickets" subtitle={`${TICKETS.length} total · ${TICKETS.filter((t) => t.status === "open").length} open`} />
          <div className="space-y-2">
            {TICKETS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={cn(
                  "w-full text-left p-3 rounded-xl border transition",
                  active === t.id ? "border-gold/40 bg-gold/[0.04] ring-gold" : "border-line hover:bg-canvas"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted">{t.id}</span>
                  <Badge tone={tones[t.status]}>{t.status}</Badge>
                </div>
                <div className="text-sm font-semibold mt-1">{t.title}</div>
                <div className="text-[11px] text-muted mt-1">{t.reviewer.name} · {formatTime(t.updated)}</div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title={`${ticket.id} · ${ticket.title}`}
            subtitle={`Priority: ${ticket.priority} · assigned to ${ticket.reviewer.name}`}
            action={
              <div className="flex gap-2">
                <Button variant="outline">Mark responded</Button>
                <Button variant="gold"><CheckCircle2 className="h-4 w-4" /> Resolve</Button>
              </div>
            }
          />
          <div className="space-y-4">
            {[
              { who: "Eleanor Whitfield", role: "Adjudicator", at: "10:14", body: "We require a notarized signature on Witness Statement 03. Please re-upload with seal visible.", side: "left" },
              { who: "Vedic Wellness Foundation", role: "Organizer", at: "10:32", body: "Notary visit scheduled for tomorrow morning. Will reupload by 11:00 IST.", side: "right" },
              { who: "Marcus Chen", role: "Reviewer", at: "10:40", body: "Acknowledged — leaving open until artifact is received.", side: "left" },
            ].map((m, i) => (
              <div key={i} className={cn("flex gap-3", m.side === "right" && "flex-row-reverse")}>
                <div className="h-8 w-8 rounded-full bg-royal text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                  {m.who.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </div>
                <div className={cn("max-w-[78%] panel p-3", m.side === "right" && "bg-gold/[0.06] border-gold/20")}>
                  <div className="text-[11px] text-muted">{m.who} · {m.role} · {m.at}</div>
                  <div className="text-sm mt-1">{m.body}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-line flex gap-2">
            <input placeholder="Reply to this clarification…" className="input flex-1" />
            <Button variant="gold"><Send className="h-4 w-4" /></Button>
          </div>

          <div className="mt-3 text-[11px] text-muted flex items-center gap-2">
            <MessageSquare className="h-3.5 w-3.5" /> Responses are audit-logged and immutable.
          </div>
        </Card>
      </div>
    </div>
  );
}
