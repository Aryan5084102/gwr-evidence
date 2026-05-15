import { useState } from "react";
import { UploadCloud, FileVideo, FileText, FileAudio, ImageIcon, ScrollText, X } from "lucide-react";
import { Badge, Card, PageHeader, Progress, Button } from "@/components/ui";
import { evidence } from "@/mock-data/portal";
import { formatBytes } from "@/lib/utils";

const KIND_ICON: Record<string, any> = { Video: FileVideo, Document: FileText, Audio: FileAudio, Photo: ImageIcon, Log: ScrollText };

interface PendingItem { id: number; name: string; size: number; progress: number }

export default function EvidenceUpload() {
  const [drag, setDrag] = useState(false);
  const [pending, setPending] = useState<PendingItem[]>([]);

  function onFiles(list: FileList | null) {
    if (!list) return;
    const items: PendingItem[] = Array.from(list).map((f) => ({ id: Date.now() + Math.random(), name: f.name, size: f.size, progress: 0 }));
    setPending((p) => [...p, ...items]);
    items.forEach((it) => simulateUpload(it.id));
  }
  function simulateUpload(id: number) {
    const tick = () => {
      setPending((cur) => {
        const idx = cur.findIndex((x) => x.id === id);
        if (idx < 0) return cur;
        const next = [...cur];
        const newProgress = Math.min(100, next[idx].progress + 8 + Math.random() * 12);
        next[idx] = { ...next[idx], progress: newProgress };
        if (newProgress < 100) setTimeout(tick, 280);
        return next;
      });
    };
    setTimeout(tick, 300);
  }

  return (
    <>
      <PageHeader
        eyebrow="Organizer"
        title="Evidence upload"
        subtitle="Drop video, audio, documents and logs. Files are routed to AI validation upon upload."
      />

      <Card>
        <label
          onDragEnter={() => setDrag(true)} onDragLeave={() => setDrag(false)}
          onDragOver={(e) => { e.preventDefault(); }} onDrop={(e) => { e.preventDefault(); setDrag(false); onFiles(e.dataTransfer.files); }}
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 cursor-pointer transition ${drag ? "border-royal bg-royal/[0.04]" : "border-line bg-canvas hover:border-royal/40"}`}
        >
          <div className="h-12 w-12 rounded-xl bg-royal/10 text-royal flex items-center justify-center"><UploadCloud className="h-5 w-5" /></div>
          <div className="mt-3 text-soft font-semibold">Drop files here or click to browse</div>
          <div className="text-xs text-muted mt-1">Supports video, audio, images, PDFs, GPX/CSV logs. Max 50GB per file.</div>
          <input type="file" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
        </label>

        {pending.length > 0 && (
          <div className="mt-5 space-y-2">
            {pending.map((p) => (
              <div key={p.id} className="rounded-xl border border-line bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-soft truncate">{p.name}</div>
                    <div className="text-[11px] text-muted">{formatBytes(p.size)} &middot; {p.progress < 100 ? `${Math.round(p.progress)}%` : "Indexed & queued for AI validation"}</div>
                  </div>
                  <button onClick={() => setPending((cur) => cur.filter((x) => x.id !== p.id))} className="btn-ghost !p-1.5"><X className="h-4 w-4" /></button>
                </div>
                <div className="mt-2"><Progress value={p.progress} tone={p.progress < 100 ? "blue" : "green"} /></div>
              </div>
            ))}
            <div className="flex justify-end"><Button onClick={() => setPending([])} variant="outline">Clear all</Button></div>
          </div>
        )}
      </Card>

      <Card className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-soft">Recently uploaded</h3>
        </div>
        <ul className="divide-y divide-line">
          {evidence.slice(0, 6).map((e) => {
            const Icon = KIND_ICON[e.kind] ?? FileText;
            return (
              <li key={e.id} className="py-3 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-royal/10 text-royal flex items-center justify-center"><Icon className="h-4 w-4" /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-soft truncate">{e.name}</div>
                  <div className="text-[11px] text-muted">{e.attemptId} &middot; {e.size}{e.duration ? ` · ${e.duration}` : ""}</div>
                </div>
                <Badge tone={e.status === "Approved" ? "green" : e.status === "Flagged" ? "red" : e.status === "Processing" ? "amber" : "blue"}>{e.status}</Badge>
              </li>
            );
          })}
        </ul>
      </Card>
    </>
  );
}
