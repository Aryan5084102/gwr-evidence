import { Brain, FileSearch, Languages, ScanText, Copy, Sparkles, GitMerge, FileWarning } from "lucide-react";
import { Button, Card, CardHeader, PageHeader, Progress } from "@/components/ui";
import { evidence } from "@/mock-data";

const MODULES = [
  { Icon: Brain, name: "AI Classification", desc: "Categorizes evidence by type, scene, and intent.", progress: 100, status: "Complete" },
  { Icon: ScanText, name: "Metadata Extraction", desc: "EXIF, codecs, timestamps, location, device.", progress: 92, status: "Processing" },
  { Icon: Languages, name: "Speech-to-Text", desc: "Multilingual transcripts with confidence scores.", progress: 78, status: "Processing" },
  { Icon: FileSearch, name: "OCR Analysis", desc: "Reads printed documents, signs, scoreboards.", progress: 64, status: "Processing" },
  { Icon: Copy, name: "Duplicate Detection", desc: "Perceptual hashing across image & video sets.", progress: 100, status: "Complete" },
  { Icon: FileWarning, name: "Missing Evidence", desc: "Compares to category requirements checklist.", progress: 100, status: "Complete" },
  { Icon: Sparkles, name: "AI Summary Generation", desc: "Per-item and submission-level narratives.", progress: 42, status: "Processing" },
];

const LOGS = [
  "[09:42:01] Classified 412 items into 7 categories (gold-confidence ≥ 0.92).",
  "[09:42:18] Detected 12 near-duplicate images via perceptual hash.",
  "[09:42:33] Transcribed 14 minutes of announcements (en-IN, hi-IN).",
  "[09:42:47] OCR resolved scoreboard at 22:14:11 → 12,418 participants.",
  "[09:43:02] Cross-referenced timekeeper log vs aerial frame timestamps.",
  "[09:43:21] Generated submission-level summary v0.3 (1,284 tokens).",
];

export default function AIProcessing() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Processing Center"
        subtitle="Real-time evidence intelligence. Classification, extraction, validation — all running in parallel."
        actions={<Button variant="gold"><Sparkles className="h-4 w-4" /> Re-run pipeline</Button>}
      />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <Card className="xl:col-span-3">
          <CardHeader title="AI Modules" subtitle="7 active modules · GWR-2025-0411" />
          <div className="grid sm:grid-cols-2 gap-3">
            {MODULES.map((m) => (
              <div key={m.name} className="panel p-4 hover:border-gold/30 transition">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-9 w-9 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
                    <m.Icon className="h-4 w-4 text-gold" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{m.name}</div>
                    <div className="text-[11px] text-muted">{m.status}</div>
                  </div>
                  <span className="ml-auto text-sm gold-text font-bold">{m.progress}%</span>
                </div>
                <Progress value={m.progress} tone={m.progress === 100 ? "green" : "gold"} />
                <p className="text-[11px] text-muted mt-2 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Live Processing Logs" subtitle="Tail of AI engine" action={<span className="chip"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> live</span>} />
          <div className="font-mono text-[11px] space-y-1.5 text-soft max-h-[420px] overflow-y-auto pr-1">
            {LOGS.concat(LOGS).map((l, i) => (
              <div key={i} className="border-l-2 border-gold/40 pl-2">{l}</div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Smart Evidence Grouping" subtitle="AI-clustered by scene, time, and content similarity" action={<Button variant="ghost"><GitMerge className="h-4 w-4" /> Merge groups</Button>} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {["Crowd · 22:00–23:30", "Aerial · Full event", "Witness statements", "Media coverage", "Scoreboard captures", "Timekeeper logs"].map((g, i) => (
            <div key={g} className="panel p-4">
              <div className="text-sm font-semibold">{g}</div>
              <div className="text-[11px] text-muted mt-1">{evidence.length - i} items · avg confidence {91 - i}%</div>
              <div className="mt-3 flex -space-x-2">
                {Array.from({ length: 4 }).map((_, k) => (
                  <div key={k} className="h-7 w-7 rounded-lg border border-line bg-gradient-to-br from-royal to-royal-400" />
                ))}
                <div className="h-7 w-7 rounded-lg border border-line bg-canvas flex items-center justify-center text-[10px] text-muted">+{12 + i}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
