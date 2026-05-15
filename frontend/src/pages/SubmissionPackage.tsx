import { useMemo, useState } from "react";
import {
  Package,
  Folder,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  Circle,
  ShieldCheck,
  Link2,
  Share2,
  Sparkles,
  Archive,
} from "lucide-react";
import { Badge, Button, Card, CardHeader, PageHeader } from "@/components/ui";
import {
  attemptMeta,
  witnesses,
  activityRows,
  restRows,
  packageStructure,
} from "@/mock-data";
import { computeSubmissionHealth, SUBMISSION_PACKAGE_FOLDERS } from "@/lib/gwr";
import { formatBytes } from "@/lib/utils";

export default function SubmissionPackage() {
  const [evidenceCount] = useState(312);
  const [videoCount] = useState(18);
  const [photoCount] = useState(64);
  const [mediaArticlesCount] = useState(7);
  const [timekeeperCount] = useState(2);
  const [qualificationsUploaded, setQualificationsUploaded] = useState(true);
  const [layoutDiagramUploaded, setLayoutDiagramUploaded] = useState(true);
  const [building, setBuilding] = useState(false);
  const [built, setBuilt] = useState(false);

  const health = useMemo(
    () =>
      computeSubmissionHealth({
        meta: attemptMeta,
        witnesses,
        activities: activityRows,
        rests: restRows,
        evidenceCount,
        videoCount,
        photoCount,
        mediaArticlesCount,
        timekeeperCount,
        qualificationsUploaded,
        layoutDiagramUploaded,
      }),
    [
      evidenceCount,
      videoCount,
      photoCount,
      mediaArticlesCount,
      timekeeperCount,
      qualificationsUploaded,
      layoutDiagramUploaded,
    ],
  );

  const scoreTone =
    health.score >= 90 ? "green" : health.score >= 70 ? "gold" : health.score >= 50 ? "amber" : "red";

  const buildPackage = async () => {
    setBuilding(true);
    setBuilt(false);
    await new Promise((r) => setTimeout(r, 1400));
    setBuilding(false);
    setBuilt(true);
  };

  const totalSize = packageStructure.reduce((s, f) => s + f.size, 0);
  const totalFiles = packageStructure.reduce((s, f) => s + f.count, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Submission Package"
        subtitle="Assemble the official Guinness World Records evidence bundle. The platform validates completeness against the record's evidence checklist and produces an upload-ready ZIP."
        actions={
          <>
            <Button variant="outline">
              <Share2 className="h-4 w-4" /> Secure share
            </Button>
            <Button variant="gold" onClick={buildPackage} disabled={building}>
              <Archive className="h-4 w-4" /> {building ? "Building…" : built ? "Re-build ZIP" : "Build submission ZIP"}
            </Button>
          </>
        }
      />

      {/* Health score banner */}
      <Card className="!p-0 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr]">
          <div className="bg-blue-shine text-white p-6 flex flex-col justify-center">
            <div className="text-[10px] uppercase tracking-[0.22em] opacity-80">Submission Health</div>
            <div className="text-6xl font-extrabold mt-2 leading-none">
              {health.score}
              <span className="text-2xl opacity-80">/100</span>
            </div>
            <div className="mt-3">
              <Badge tone={scoreTone === "green" ? "green" : scoreTone === "gold" ? "gold" : "amber"}>
                {health.score >= 90
                  ? "Submission-ready"
                  : health.score >= 70
                    ? "Almost ready — minor gaps"
                    : "Needs more evidence"}
              </Badge>
            </div>
            <div className="text-[12px] opacity-80 mt-3">
              {attemptMeta.recordTitle} · {attemptMeta.applicationRef}
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {health.items.map((it) => {
                const Icon =
                  it.state === "complete"
                    ? CheckCircle2
                    : it.state === "partial"
                      ? AlertCircle
                      : Circle;
                const color =
                  it.state === "complete"
                    ? "text-emerald-600"
                    : it.state === "partial"
                      ? "text-amber-600"
                      : "text-rose-500";
                return (
                  <div key={it.id} className="flex items-start gap-2 rounded-lg p-2 hover:bg-canvas">
                    <Icon className={"h-4 w-4 mt-0.5 shrink-0 " + color} />
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold truncate">{it.label}</div>
                      {it.detail && <div className="text-[11px] text-muted truncate">{it.detail}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Package structure */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-6">
        <Card>
          <CardHeader
            title="Package structure"
            subtitle="Auto-organised into the folder layout Guinness adjudicators expect."
            action={
              <Badge tone="blue">
                <Package className="h-3 w-3" /> {formatBytes(totalSize)} · {totalFiles} files
              </Badge>
            }
          />
          <div className="rounded-lg border border-line bg-canvas/40 font-mono text-[13px] p-4">
            <div className="text-soft font-bold mb-2">
              📦 {attemptMeta.applicationRef}_GWR_Submission.zip
            </div>
            {SUBMISSION_PACKAGE_FOLDERS.map((f, i) => {
              const stats = packageStructure.find((p) => p.name === f.name);
              return (
                <div key={f.name} className="flex items-start gap-2 py-1.5 pl-4">
                  <span className="text-muted">
                    {i === SUBMISSION_PACKAGE_FOLDERS.length - 1 ? "└──" : "├──"}
                  </span>
                  <Folder className="h-4 w-4 text-gold mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-soft">{f.name}/</div>
                    <div className="text-[11px] text-muted">{f.desc}</div>
                  </div>
                  {stats && (
                    <div className="text-[11px] text-muted text-right shrink-0">
                      <div>{stats.count} files</div>
                      <div>{formatBytes(stats.size)}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {built && (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
              <div className="flex-1">
                <div className="font-bold text-emerald-800">Submission ZIP ready</div>
                <div className="text-[12px] text-emerald-700">
                  Hash chain sealed · cryptographic manifest included · ready for upload to GWR portal.
                </div>
              </div>
              <Button variant="gold">
                <Download className="h-4 w-4" /> Download
              </Button>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Final pre-flight checks"
            subtitle="A few toggles unblock the final health points."
          />
          <div className="space-y-2">
            <label className="flex items-start gap-3 rounded-lg p-3 border border-line hover:bg-canvas">
              <input
                type="checkbox"
                className="mt-0.5 accent-royal"
                checked={qualificationsUploaded}
                onChange={(e) => setQualificationsUploaded(e.target.checked)}
              />
              <div className="flex-1">
                <div className="font-semibold text-sm">Proof of lead organiser qualifications</div>
                <div className="text-[11px] text-muted">Rule 5 — Lead organiser must be qualified in AI / ML.</div>
              </div>
              <Badge tone={qualificationsUploaded ? "green" : "amber"}>
                {qualificationsUploaded ? "Uploaded" : "Missing"}
              </Badge>
            </label>
            <label className="flex items-start gap-3 rounded-lg p-3 border border-line hover:bg-canvas">
              <input
                type="checkbox"
                className="mt-0.5 accent-royal"
                checked={layoutDiagramUploaded}
                onChange={(e) => setLayoutDiagramUploaded(e.target.checked)}
              />
              <div className="flex-1">
                <div className="font-semibold text-sm">Layout diagram of attempt area</div>
                <div className="text-[11px] text-muted">Required by the record's evidence checklist.</div>
              </div>
              <Badge tone={layoutDiagramUploaded ? "green" : "amber"}>
                {layoutDiagramUploaded ? "Uploaded" : "Missing"}
              </Badge>
            </label>
          </div>

          <div className="mt-5 rounded-lg border border-line bg-canvas/40 p-3">
            <div className="text-[11px] uppercase tracking-wider text-muted font-semibold mb-1">
              <Sparkles className="h-3 w-3 inline -mt-0.5 mr-1 text-gold" />
              AI Pre-flight Suggestions
            </div>
            <ul className="text-[12px] text-soft space-y-1 list-disc pl-5">
              <li>Re-send signing link to witness W-004 — pending for 3 days.</li>
              <li>Cover letter description is strong (450+ chars). No action needed.</li>
              <li>Consider adding 1 more press mention to strengthen the optional Media folder.</li>
            </ul>
          </div>
        </Card>
      </div>

      {/* Generated PDFs */}
      <Card>
        <CardHeader
          title="Auto-generated documents"
          subtitle="Produced by the platform from your form data, witness signatures, and the activity log — Guinness-compliant out of the box."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { title: "Cover Letter", sub: "GWR Template 2022", icon: FileText, tone: "blue" as const },
            { title: "Activity Log Book", sub: "Auto-computed timeline", icon: FileText, tone: "gold" as const },
            {
              title: "Witness Statements",
              sub: `${witnesses.filter((w) => w.status === "completed").length} signed PDFs`,
              icon: ShieldCheck,
              tone: "green" as const,
            },
          ].map((doc) => (
            <div key={doc.title} className="rounded-lg border border-line p-4 hover:shadow-soft transition">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-canvas flex items-center justify-center">
                  <doc.icon className="h-5 w-5 text-royal" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{doc.title}</div>
                  <div className="text-[11px] text-muted">{doc.sub}</div>
                </div>
                <Badge tone={doc.tone}>PDF</Badge>
              </div>
              <div className="flex gap-2 mt-3">
                <Button variant="outline" className="flex-1">
                  <FileText className="h-3.5 w-3.5" /> Preview
                </Button>
                <Button variant="ghost">
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Secure share */}
      <Card>
        <CardHeader
          title="Secure share with adjudicators"
          subtitle="Generate a one-time, expiring link that GWR adjudicators can use to inspect the package without downloading."
        />
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[260px] rounded-lg border border-line bg-canvas px-3 py-2 font-mono text-[12px] flex items-center gap-2">
            <Link2 className="h-3.5 w-3.5 text-muted" />
            <span className="truncate">
              https://gwr.glimmora.ai/share/{attemptMeta.applicationRef.toLowerCase()}?token=•••••••
            </span>
          </div>
          <Button variant="outline">Regenerate</Button>
          <Button variant="gold">Copy link</Button>
        </div>
        <div className="mt-2 text-[11px] text-muted">
          Link expires 72 hours after first access. Includes server-side audit log of all views and downloads.
        </div>
      </Card>
    </div>
  );
}
