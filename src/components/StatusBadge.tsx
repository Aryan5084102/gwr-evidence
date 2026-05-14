import { Badge } from "./ui";
import type { EvidenceStatus } from "@/types";
import { CheckCircle2, CircleDot, Loader2, ShieldAlert, ThumbsDown, UploadCloud } from "lucide-react";

const MAP: Record<EvidenceStatus | string, { tone: any; label: string; Icon: any }> = {
  uploading: { tone: "blue", label: "Uploading", Icon: UploadCloud },
  processing: { tone: "amber", label: "AI Processing", Icon: Loader2 },
  validated: { tone: "gold", label: "Validated", Icon: CheckCircle2 },
  flagged: { tone: "red", label: "Flagged", Icon: ShieldAlert },
  approved: { tone: "green", label: "Approved", Icon: CheckCircle2 },
  rejected: { tone: "red", label: "Rejected", Icon: ThumbsDown },
  draft: { tone: "default", label: "Draft", Icon: CircleDot },
  review: { tone: "amber", label: "Under Review", Icon: Loader2 },
};

export default function StatusBadge({ status }: { status: string }) {
  const cfg = MAP[status] || MAP.draft;
  return (
    <Badge tone={cfg.tone}>
      <cfg.Icon className={`h-3 w-3 ${status === "processing" ? "animate-spin" : ""}`} />
      {cfg.label}
    </Badge>
  );
}
