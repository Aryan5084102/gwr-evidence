import { useMemo, useState } from "react";
import UploadDropzone from "@/components/UploadDropzone";
import { Badge, Button, Card, CardHeader, Input, PageHeader, Progress } from "@/components/ui";
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  Download,
  Eye,
  FileText,
  Film,
  Image as ImageIcon,
  Link2,
  Lock,
  MapPin,
  MessageSquare,
  Newspaper,
  Pause,
  Play,
  RotateCw,
  ScrollText,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCheck,
  X,
} from "lucide-react";

type CategoryId =
  | "video"
  | "photos"
  | "witness"
  | "expert"
  | "logbook"
  | "media";

type Category = {
  id: CategoryId;
  title: string;
  subtitle: string;
  required: boolean;
  formats: string[];
  icon: React.ComponentType<{ className?: string }>;
  guidance: string;
};

const CATEGORIES: Category[] = [
  {
    id: "video",
    title: "Video Evidence",
    subtitle: "Unedited footage of the attempt from start to finish",
    required: true,
    formats: ["MP4", "MOV", "AVI"],
    icon: Film,
    guidance:
      "Continuous, unedited recording. Clock/timer visible where applicable. No cuts, no overlays beyond captions.",
  },
  {
    id: "photos",
    title: "Photographs",
    subtitle: "High-resolution images of the attempt and setup",
    required: true,
    formats: ["JPG", "PNG", "HEIC"],
    icon: ImageIcon,
    guidance:
      "Wide shots of the venue, close-ups of the measurement/result, and the record holder during the attempt.",
  },
  {
    id: "witness",
    title: "Witness Statements",
    subtitle: "Signed statements from two independent witnesses",
    required: true,
    formats: ["PDF", "DOCX"],
    icon: UserCheck,
    guidance:
      "Two qualified, independent witnesses must sign a statement confirming what they observed.",
  },
  {
    id: "expert",
    title: "Expert / Professional Statements",
    subtitle: "Required for technical or specialist record categories",
    required: false,
    formats: ["PDF", "DOCX"],
    icon: ScrollText,
    guidance:
      "Statement from a qualified expert in the relevant field (e.g. surveyor, medical professional, judge).",
  },
  {
    id: "logbook",
    title: "Logbooks, Measurements & Scorecards",
    subtitle: "Record-specific documentation per official guidelines",
    required: true,
    formats: ["PDF", "XLSX", "CSV"],
    icon: FileText,
    guidance:
      "Timestamps, measurements, scorecards, GPS logs — anything explicitly required by your record's guidelines.",
  },
  {
    id: "media",
    title: "Media Coverage",
    subtitle: "Optional supporting press, articles, broadcast clips",
    required: false,
    formats: ["URL", "PDF", "MP4"],
    icon: Newspaper,
    guidance:
      "Newspaper articles, TV segments, or verified press coverage. Strengthens your submission but not required.",
  },
];

type FileItem = {
  id: string;
  name: string;
  size: string;
  progress: number;
  status: "uploading" | "paused" | "done" | "error";
  source: "upload" | "link";
  url?: string;
};

type Witness = {
  id: string;
  name: string;
  profession: string;
  email: string;
  signedOn: string;
};

type AIWarning = {
  id: string;
  severity: "low" | "medium" | "high";
  category: CategoryId;
  message: string;
};

type Stage = "draft" | "submitted" | "review" | "clarifications" | "decision";

const STAGES: { id: Stage; label: string }[] = [
  { id: "draft", label: "Draft" },
  { id: "submitted", label: "Submitted" },
  { id: "review", label: "Under review" },
  { id: "clarifications", label: "Clarifications" },
  { id: "decision", label: "Decision" },
];

const SEED_FILES: Record<CategoryId, FileItem[]> = {
  video: [
    { id: "v1", name: "attempt-master-take.mp4", size: "2.4 GB", progress: 100, status: "done", source: "upload" },
    { id: "v2", name: "wide-angle-cam-b.mov", size: "1.1 GB", progress: 62, status: "uploading", source: "upload" },
  ],
  photos: [
    { id: "p1", name: "venue-overview.jpg", size: "8.2 MB", progress: 100, status: "done", source: "upload" },
    { id: "p2", name: "result-closeup.jpg", size: "6.4 MB", progress: 100, status: "done", source: "upload" },
    { id: "p3", name: "setup-wide.png", size: "11.0 MB", progress: 100, status: "done", source: "upload" },
  ],
  witness: [
    { id: "w1", name: "witness-1-statement-signed.pdf", size: "412 KB", progress: 100, status: "done", source: "upload" },
  ],
  expert: [],
  logbook: [
    { id: "l1", name: "official-scorecard.pdf", size: "286 KB", progress: 38, status: "paused", source: "upload" },
  ],
  media: [],
};

const SEED_WITNESSES: Witness[] = [
  { id: "wt1", name: "Dr. Aanya Kapoor", profession: "Sports Physician", email: "aanya@example.com", signedOn: "2026-05-10" },
];

const SEED_WARNINGS: AIWarning[] = [
  { id: "a1", severity: "high", category: "witness", message: "Only 1 of 2 required witness statements uploaded." },
  { id: "a2", severity: "medium", category: "video", message: "Camera B footage may have a 3-second gap at 00:14:32." },
  { id: "a3", severity: "low", category: "photos", message: "Consider adding a photo of the official measurement tool." },
];

export default function EvidenceUpload() {
  const [active, setActive] = useState<CategoryId>("video");
  const [files, setFiles] = useState<Record<CategoryId, FileItem[]>>(SEED_FILES);
  const [comments, setComments] = useState<Record<CategoryId, string>>({
    video: "", photos: "", witness: "", expert: "", logbook: "", media: "",
  });
  const [witnesses, setWitnesses] = useState<Witness[]>(SEED_WITNESSES);
  const [stage, setStage] = useState<Stage>("draft");
  const [applicationApproved] = useState(true);
  const [guidelinesDate] = useState("2026-04-22");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [confirmFinal, setConfirmFinal] = useState(false);
  const [linkInput, setLinkInput] = useState("");

  const activeCat = CATEGORIES.find((c) => c.id === active)!;

  const completion = useMemo(() => {
    const required = CATEGORIES.filter((c) => c.required);
    const satisfied = required.filter((c) =>
      files[c.id].some((f) => f.status === "done")
    ).length;
    return {
      satisfied,
      total: required.length,
      pct: Math.round((satisfied / required.length) * 100),
      ready: satisfied === required.length && witnesses.length >= 2,
    };
  }, [files, witnesses]);

  const totalFiles = useMemo(
    () => Object.values(files).reduce((n, arr) => n + arr.length, 0),
    [files]
  );

  const handleDrop = (count: number) => {
    if (!count || !applicationApproved) return;
    const fresh: FileItem[] = Array.from({ length: count }).map((_, i) => ({
      id: `${active}-${Date.now()}-${i}`,
      name: `new-upload-${i + 1}.${activeCat.formats[0].toLowerCase()}`,
      size: "—",
      progress: 0,
      status: "uploading",
      source: "upload",
    }));
    setFiles((p) => ({ ...p, [active]: [...fresh, ...p[active]] }));
  };

  const updateFile = (id: string, patch: Partial<FileItem>) => {
    setFiles((p) => ({
      ...p,
      [active]: p[active].map((f) => (f.id === id ? { ...f, ...patch } : f)),
    }));
  };

  const removeFile = (id: string) => {
    setFiles((p) => ({ ...p, [active]: p[active].filter((f) => f.id !== id) }));
  };

  const attachLink = () => {
    if (!linkInput.trim()) return;
    const item: FileItem = {
      id: `${active}-link-${Date.now()}`,
      name: linkInput.trim().replace(/^https?:\/\//, "").slice(0, 60),
      size: "external",
      progress: 100,
      status: "done",
      source: "link",
      url: linkInput.trim(),
    };
    setFiles((p) => ({ ...p, [active]: [item, ...p[active]] }));
    setLinkInput("");
  };

  const addWitness = () => {
    setWitnesses((w) => [
      ...w,
      { id: `wt${Date.now()}`, name: "", profession: "", email: "", signedOn: "" },
    ]);
  };

  const updateWitness = (id: string, patch: Partial<Witness>) => {
    setWitnesses((w) => w.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };

  const removeWitness = (id: string) => {
    setWitnesses((w) => w.filter((x) => x.id !== id));
  };

  const confirmSubmit = () => {
    setShowSubmitModal(false);
    setConfirmFinal(false);
    setStage("submitted");
  };

  const downloadPack = () => {
    const summary = {
      submittedAt: new Date().toISOString(),
      files,
      witnesses,
      comments,
    };
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gwr-evidence-pack.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Evidence Upload"
        subtitle="Upload media and official documents for your record attempt. Follow the categories below — matching the GWR submission portal structure."
        actions={
          <>
            <Button variant="outline" onClick={downloadPack}>
              <Download className="h-4 w-4" /> Download Pack
            </Button>
            <Button variant="outline">
              <Sparkles className="h-4 w-4" /> AI organize
            </Button>
            <Button
              variant="gold"
              disabled={!completion.ready || !applicationApproved}
              onClick={() => setShowSubmitModal(true)}
            >
              <Send className="h-4 w-4" />
              {completion.ready
                ? "Submit Evidence"
                : `Submit Evidence (${completion.satisfied}/${completion.total})`}
            </Button>
          </>
        }
      />

      {/* 1. Application status gate */}
      <Card
        className={
          applicationApproved
            ? "border-emerald-200 bg-emerald-50/40"
            : "border-amber-200 bg-amber-50/40"
        }
      >
        <div className="flex items-start gap-3">
          {applicationApproved ? (
            <ShieldCheck className="h-5 w-5 text-emerald-600 mt-0.5" />
          ) : (
            <Lock className="h-5 w-5 text-amber-600 mt-0.5" />
          )}
          <div className="flex-1">
            <div className="text-sm font-semibold text-soft">
              {applicationApproved
                ? "Application approved · Evidence upload unlocked"
                : "Awaiting application approval"}
            </div>
            <div className="text-xs text-muted mt-0.5">
              {applicationApproved
                ? `Official guidelines received on ${guidelinesDate}. You may now upload evidence per the categories below.`
                : "The Evidence section unlocks after GWR approves your application and sends the official guidelines email."}
            </div>
          </div>
          <Badge tone={applicationApproved ? "green" : "amber"}>
            {applicationApproved ? "Unlocked" : "Locked"}
          </Badge>
        </div>
      </Card>

      {/* 4. Record-attempt metadata header */}
      <Card>
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted font-semibold">Record</div>
            <div className="text-sm font-semibold text-soft mt-0.5">
              Longest Continuous Yoga Marathon — Solo
            </div>
          </div>
          <div className="h-8 w-px bg-line" />
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted font-semibold">Category</div>
            <div className="text-sm text-soft mt-0.5">Endurance · Solo</div>
          </div>
          <div className="h-8 w-px bg-line hidden md:block" />
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted" />
            <span className="text-sm text-soft">2026-06-15</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted" />
            <span className="text-sm text-soft">Mumbai, IN</span>
          </div>
          <div className="ml-auto">
            <Badge tone="blue">Submission #GWR-2026-04812</Badge>
          </div>
        </div>
      </Card>

      {/* 9. Submission timeline */}
      <Card>
        <CardHeader title="Submission timeline" subtitle="Track your record attempt through the GWR review pipeline" />
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {STAGES.map((s, i) => {
            const currentIdx = STAGES.findIndex((x) => x.id === stage);
            const done = i < currentIdx;
            const isCurrent = i === currentIdx;
            return (
              <div key={s.id} className="flex items-center gap-2 flex-shrink-0">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${
                    done
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : isCurrent
                        ? "bg-royal/[0.08] text-royal border-royal/30"
                        : "bg-canvas text-muted border-line"
                  }`}
                >
                  {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <CircleDashed className="h-3.5 w-3.5" />}
                  {s.label}
                </div>
                {i < STAGES.length - 1 && <span className="h-px w-6 bg-line" />}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Readiness */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-soft">Submission readiness</div>
            <div className="text-xs text-muted mt-0.5">
              {completion.satisfied} of {completion.total} required categories · {witnesses.length}/2 witnesses
            </div>
          </div>
          <div className="w-full sm:w-72">
            <Progress value={completion.pct} tone={completion.ready ? "green" : "gold"} />
          </div>
        </div>
      </Card>

      {/* 10. AI pre-validation warnings */}
      {SEED_WARNINGS.length > 0 && (
        <Card>
          <CardHeader
            title="AI pre-validation"
            subtitle="Issues detected before submission — review and resolve"
            action={<Sparkles className="h-4 w-4 text-gold" />}
          />
          <div className="space-y-2">
            {SEED_WARNINGS.map((w) => (
              <button
                key={w.id}
                onClick={() => setActive(w.category)}
                className="w-full flex items-start gap-3 p-3 rounded-xl border border-line hover:bg-canvas text-left"
              >
                <AlertTriangle
                  className={`h-4 w-4 mt-0.5 ${
                    w.severity === "high"
                      ? "text-rose-600"
                      : w.severity === "medium"
                        ? "text-amber-600"
                        : "text-muted"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-soft">{w.message}</div>
                  <div className="text-[11px] text-muted mt-0.5">
                    Category: {CATEGORIES.find((c) => c.id === w.category)?.title}
                  </div>
                </div>
                <Badge
                  tone={w.severity === "high" ? "red" : w.severity === "medium" ? "amber" : "default"}
                >
                  {w.severity}
                </Badge>
              </button>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar */}
        <Card className="lg:col-span-4">
          <CardHeader title="Evidence Categories" subtitle="Per GWR official guidelines" />
          <div className="space-y-2">
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              const items = files[c.id];
              const done = items.some((f) => f.status === "done");
              const isActive = c.id === active;
              return (
                <button
                  key={c.id}
                  onClick={() => setActive(c.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition ${
                    isActive ? "border-royal bg-royal/[0.04]" : "border-line hover:bg-canvas"
                  }`}
                >
                  <div className="h-9 w-9 rounded-lg bg-canvas border border-line flex items-center justify-center">
                    <Icon className="h-4 w-4 text-royal" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-soft truncate">{c.title}</div>
                    <div className="text-[11px] text-muted truncate">
                      {items.length} file{items.length === 1 ? "" : "s"}
                    </div>
                  </div>
                  {c.required ? (
                    done ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <CircleDashed className="h-4 w-4 text-amber-500" />
                    )
                  ) : (
                    <Badge tone="default">Optional</Badge>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Main panel */}
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <CardHeader
              title={activeCat.title}
              subtitle={activeCat.subtitle}
              action={
                activeCat.required ? (
                  <Badge tone="gold">Required</Badge>
                ) : (
                  <Badge tone="default">Optional</Badge>
                )
              }
            />
            <div className="rounded-xl bg-canvas border border-line p-3 mb-4 text-xs text-muted leading-relaxed">
              <span className="font-semibold text-soft">Guideline · </span>
              {activeCat.guidance}
            </div>

            {applicationApproved ? (
              <UploadDropzone onFiles={handleDrop} />
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-line p-10 text-center bg-canvas">
                <Lock className="h-6 w-6 text-muted mx-auto mb-2" />
                <div className="text-sm text-muted">Upload disabled until application is approved.</div>
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              {activeCat.formats.map((f) => (
                <span key={f} className="chip">{f}</span>
              ))}
            </div>

            {/* 6. Large-file external link */}
            <div className="mt-5 p-4 rounded-xl bg-canvas border border-line">
              <div className="flex items-center gap-2 mb-2">
                <Link2 className="h-4 w-4 text-royal" />
                <div className="text-sm font-semibold text-soft">Attach external link</div>
                <span className="text-[11px] text-muted">For files larger than 5 GB — paste a WeTransfer/Drive/Dropbox link.</span>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="https://wetransfer.com/..."
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                />
                <Button variant="outline" onClick={attachLink} disabled={!linkInput.trim()}>
                  Attach
                </Button>
              </div>
            </div>
          </Card>

          {/* 3. Witness details (only on witness category) */}
          {active === "witness" && (
            <Card>
              <CardHeader
                title="Witness details"
                subtitle="Capture witness metadata alongside each signed statement"
                action={
                  <Button variant="outline" onClick={addWitness}>
                    <UserCheck className="h-4 w-4" /> Add witness
                  </Button>
                }
              />
              {witnesses.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted">
                  Two independent witnesses required.
                </div>
              ) : (
                <div className="space-y-3">
                  {witnesses.map((w, i) => (
                    <div key={w.id} className="p-3 rounded-xl border border-line">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-semibold text-soft">Witness #{i + 1}</div>
                        <button
                          className="text-muted hover:text-rose-600"
                          onClick={() => removeWitness(w.id)}
                          aria-label="Remove witness"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-2">
                        <Input
                          placeholder="Full name"
                          value={w.name}
                          onChange={(e) => updateWitness(w.id, { name: e.target.value })}
                        />
                        <Input
                          placeholder="Profession / role"
                          value={w.profession}
                          onChange={(e) => updateWitness(w.id, { profession: e.target.value })}
                        />
                        <Input
                          placeholder="Email"
                          type="email"
                          value={w.email}
                          onChange={(e) => updateWitness(w.id, { email: e.target.value })}
                        />
                        <Input
                          placeholder="Signed on (YYYY-MM-DD)"
                          value={w.signedOn}
                          onChange={(e) => updateWitness(w.id, { signedOn: e.target.value })}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="text-[11px] text-muted mt-3">
                {witnesses.length < 2
                  ? `${2 - witnesses.length} more witness${witnesses.length === 1 ? "" : "es"} required.`
                  : "Witness requirement met."}
              </div>
            </Card>
          )}

          {/* Files list with per-file actions */}
          <Card>
            <CardHeader
              title="Files in this category"
              subtitle={`${files[active].length} item${files[active].length === 1 ? "" : "s"}`}
              action={<Activity className="h-4 w-4 text-muted" />}
            />
            {files[active].length === 0 ? (
              <div className="text-center py-10 text-sm text-muted">
                No files uploaded yet for this category.
              </div>
            ) : (
              <div className="space-y-3">
                {files[active].map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center gap-4 p-3 rounded-xl border border-line hover:bg-canvas"
                  >
                    <div className="h-10 w-10 rounded-lg bg-canvas border border-line flex items-center justify-center text-[10px] uppercase text-muted">
                      {f.source === "link" ? <Link2 className="h-4 w-4 text-royal" /> : f.name.split(".").pop()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold truncate">{f.name}</div>
                      <div className="mt-1.5">
                        <Progress
                          value={f.progress}
                          tone={
                            f.status === "done"
                              ? "green"
                              : f.status === "paused"
                                ? "gold"
                                : f.status === "error"
                                  ? "red"
                                  : "blue"
                          }
                        />
                      </div>
                      <div className="text-[11px] text-muted mt-1">
                        {f.status === "done"
                          ? `Completed · ${f.size}${f.source === "link" ? " · external link" : " · AI processed"}`
                          : f.status === "paused"
                            ? `Paused · ${f.progress}% · ${f.size}`
                            : f.status === "error"
                              ? `Failed · retry to resume`
                              : `Uploading · ${f.progress}% · ${f.size}`}
                      </div>
                    </div>

                    {/* 2 + 7. Per-file actions including pause/resume */}
                    <div className="flex items-center gap-1">
                      {f.status === "uploading" && (
                        <button
                          className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-line"
                          onClick={() => updateFile(f.id, { status: "paused" })}
                          aria-label="Pause"
                          title="Pause"
                        >
                          <Pause className="h-4 w-4 text-muted" />
                        </button>
                      )}
                      {f.status === "paused" && (
                        <button
                          className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-line"
                          onClick={() => updateFile(f.id, { status: "uploading" })}
                          aria-label="Resume"
                          title="Resume"
                        >
                          <Play className="h-4 w-4 text-royal" />
                        </button>
                      )}
                      {f.status === "error" && (
                        <button
                          className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-line"
                          onClick={() => updateFile(f.id, { status: "uploading", progress: 0 })}
                          aria-label="Retry"
                          title="Retry"
                        >
                          <RotateCw className="h-4 w-4 text-royal" />
                        </button>
                      )}
                      {f.status === "done" && (
                        <button
                          className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-line"
                          aria-label="Preview"
                          title="Preview"
                          onClick={() => f.url && window.open(f.url, "_blank")}
                        >
                          <Eye className="h-4 w-4 text-muted" />
                        </button>
                      )}
                      <button
                        className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-line"
                        aria-label="Replace"
                        title="Replace"
                        onClick={() => updateFile(f.id, { progress: 0, status: "uploading" })}
                      >
                        <RotateCw className="h-4 w-4 text-muted" />
                      </button>
                      <button
                        className="p-2 rounded-lg hover:bg-rose-50 border border-transparent hover:border-rose-200"
                        aria-label="Delete"
                        title="Delete"
                        onClick={() => removeFile(f.id)}
                      >
                        <Trash2 className="h-4 w-4 text-rose-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* 8. Comments per category */}
          <Card>
            <CardHeader
              title="Notes for the reviewer"
              subtitle="Optional context for this category"
              action={<MessageSquare className="h-4 w-4 text-muted" />}
            />
            <textarea
              className="input min-h-[100px] resize-y w-full"
              placeholder="e.g. Camera B failed at 14:32 — see Camera A from that timestamp."
              value={comments[active]}
              onChange={(e) => setComments((p) => ({ ...p, [active]: e.target.value }))}
            />
          </Card>
        </div>
      </div>

      {/* 5. Pre-submit confirmation modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg panel p-6 rounded-2xl bg-white">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-sm font-semibold text-soft">Confirm submission</div>
                <div className="text-xs text-muted mt-0.5">
                  This action is final and cannot be undone.
                </div>
              </div>
              <button onClick={() => setShowSubmitModal(false)} aria-label="Close">
                <X className="h-5 w-5 text-muted" />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              {CATEGORIES.map((c) => {
                const items = files[c.id];
                const done = items.filter((f) => f.status === "done").length;
                return (
                  <div key={c.id} className="flex items-center justify-between text-sm">
                    <span className="text-soft">{c.title}</span>
                    <span className="text-muted">
                      {done} verified{c.required ? " · required" : ""}
                    </span>
                  </div>
                );
              })}
              <div className="flex items-center justify-between text-sm">
                <span className="text-soft">Witnesses</span>
                <span className="text-muted">{witnesses.length} on file</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-soft">Total files</span>
                <span className="text-muted">{totalFiles}</span>
              </div>
            </div>

            <label className="flex items-start gap-2 text-xs text-soft mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmFinal}
                onChange={(e) => setConfirmFinal(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                I confirm this evidence is complete and final. I understand it cannot be edited after submission.
              </span>
            </label>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSubmitModal(false)}>
                Cancel
              </Button>
              <Button variant="gold" disabled={!confirmFinal} onClick={confirmSubmit}>
                <Send className="h-4 w-4" /> Submit final
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
