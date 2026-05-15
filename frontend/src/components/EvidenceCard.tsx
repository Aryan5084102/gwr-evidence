import { FileVideo, Image as ImageIcon, FileText, Music, Link as LinkIcon, Eye, Sparkles } from "lucide-react";
import type { Evidence } from "@/types";
import { formatBytes, formatTime } from "@/lib/utils";
import StatusBadge from "./StatusBadge";
import { Progress } from "./ui";

const ICONS = {
  video: FileVideo,
  image: ImageIcon,
  document: FileText,
  audio: Music,
  link: LinkIcon,
};

export default function EvidenceCard({ e }: { e: Evidence }) {
  const Icon = ICONS[e.type];
  return (
    <div className="panel p-4 group hover:border-royal/30 hover:shadow-glow transition-all">
      <div className="relative aspect-video rounded-xl bg-gradient-to-br from-[#E8F0FB] to-[#F5F7FA] border border-line mb-3 overflow-hidden flex items-center justify-center">
        <Icon className="h-10 w-10 text-royal/40" />
        <div className="absolute top-2 left-2">
          <StatusBadge status={e.status} />
        </div>
        {e.duration && (
          <div className="absolute bottom-2 right-2 chip !bg-white/90 !backdrop-blur">{e.duration}</div>
        )}
        <button className="absolute inset-0 flex items-center justify-center bg-royal/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition">
          <span className="btn-primary !py-1.5 !text-xs"><Eye className="h-3.5 w-3.5" /> Preview</span>
        </button>
      </div>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate text-soft">{e.name}</div>
          <div className="text-[11px] text-muted mt-0.5">
            {formatBytes(e.size)} · {formatTime(e.uploadedAt)}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[10px] uppercase tracking-wider text-muted">AI</div>
          <div className="text-sm font-bold blue-text">{e.aiConfidence}%</div>
        </div>
      </div>
      {e.status === "uploading" && (
        <div className="mt-3">
          <Progress value={e.progress} tone="blue" />
          <div className="text-[10px] text-muted mt-1">Uploading · {e.progress}%</div>
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {e.tags.map((t) => (
          <span key={t} className="chip">
            <Sparkles className="h-3 w-3 text-gold" /> {t}
          </span>
        ))}
      </div>
    </div>
  );
}
