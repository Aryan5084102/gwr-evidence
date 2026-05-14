import { useState } from "react";
import { Button, Card, CardHeader, PageHeader, Progress } from "@/components/ui";
import { packageStructure } from "@/mock-data";
import { formatBytes, cn } from "@/lib/utils";
import { ChevronRight, Download, Folder, FolderOpen, ShieldCheck } from "lucide-react";

const totalSize = packageStructure.reduce((s, p) => s + p.size, 0);
const totalCount = packageStructure.reduce((s, p) => s + p.count, 0);

export default function SubmissionPackage() {
  const [open, setOpen] = useState<string[]>([packageStructure[0].name]);
  const toggle = (n: string) =>
    setOpen((s) => (s.includes(n) ? s.filter((x) => x !== n) : [...s, n]));
  return (
    <div className="space-y-6">
      <PageHeader
        title="Submission Package"
        subtitle="Final, structured export of all evidence and adjudication artifacts. Ready for handoff to Guinness verification HQ."
        actions={
          <>
            <Button variant="outline">Regenerate</Button>
            <Button variant="gold"><Download className="h-4 w-4" /> Export Package</Button>
          </>
        }
      />

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader title="Folder Structure" subtitle="Generated automatically · audit-immutable" />
            <ul className="font-mono text-sm">
              <li className="py-1.5 text-soft/80">/GWR-2025-0411</li>
              {packageStructure.map((p) => {
                const isOpen = open.includes(p.name);
                return (
                  <li key={p.name}>
                    <button
                      onClick={() => toggle(p.name)}
                      className="w-full flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-canvas"
                    >
                      <ChevronRight className={cn("h-3.5 w-3.5 text-muted transition", isOpen && "rotate-90")} />
                      {isOpen ? <FolderOpen className="h-4 w-4 text-gold" /> : <Folder className="h-4 w-4 text-royal" />}
                      <span className="flex-1 text-left">{p.name}</span>
                      <span className="text-[11px] text-muted">{p.count} items · {formatBytes(p.size)}</span>
                    </button>
                    {isOpen && (
                      <ul className="pl-8 pb-2 space-y-1 text-[12px] text-soft/80">
                        {Array.from({ length: Math.min(5, p.count) }).map((_, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="h-1 w-1 rounded-full bg-muted" />
                            <span>{p.name.toLowerCase()}_{String(i + 1).padStart(3, "0")}.{p.name.includes("Recording") ? "mp4" : p.name.includes("Image") ? "jpg" : "pdf"}</span>
                          </li>
                        ))}
                        {p.count > 5 && <li className="text-muted">… {p.count - 5} more</li>}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Package Stats" />
            <Row k="Total Folders" v={`${packageStructure.length}`} />
            <Row k="Total Items" v={`${totalCount.toLocaleString()}`} />
            <Row k="Total Size" v={formatBytes(totalSize)} />
            <Row k="Compression" v="ZIP · streamed" />
            <div className="mt-3 pt-3 border-t border-line">
              <div className="text-[11px] text-muted mb-1">Export readiness</div>
              <Progress value={94} tone="blue" />
              <div className="text-[10px] text-muted mt-1">94% · 1 unresolved clarification</div>
            </div>
          </Card>
          <Card>
            <CardHeader title="Integrity" subtitle="SHA-256 hashing per file" action={<ShieldCheck className="h-4 w-4 text-gold" />} />
            <p className="text-xs text-muted leading-relaxed">
              Every artifact in this package is cryptographically hashed at export. The manifest
              <span className="font-mono text-gold"> /00_Manifest.json</span> contains all signatures, witnessed by your adjudicator key.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-[11px] text-muted">{k}</span>
      <span className="text-sm font-medium">{v}</span>
    </div>
  );
}
