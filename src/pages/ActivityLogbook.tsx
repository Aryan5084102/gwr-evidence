import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  Wand2,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Coffee,
  Clock,
  Download,
  FileWarning,
  RefreshCw,
} from "lucide-react";
import { Badge, Button, Card, CardHeader, PageHeader, Progress } from "@/components/ui";
import {
  activityRows as seedA,
  restRows as seedR,
  witnesses,
  attemptMeta,
} from "@/mock-data";
import type { ActivityRow, RestRow } from "@/types";
import { buildLogbook, diffMinutes, fmtDuration, minToHHMM } from "@/lib/gwr";
import {
  downloadFilledLogbook,
  fillLogbookPdf,
  pairLogbookEntries,
} from "@/lib/logbookPdf";

const TEMPLATE_URL = "/log-book-template-2022.pdf";

function WitnessSelect({
  value,
  onChange,
}: {
  value?: string;
  onChange: (v: string | undefined) => void;
}) {
  return (
    <select
      className="input !py-1 !text-[12px]"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || undefined)}
    >
      <option value="">—</option>
      {witnesses.map((w) => (
        <option key={w.id} value={w.id}>
          {w.firstName} {w.lastName}
        </option>
      ))}
    </select>
  );
}

function TimeCell({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="time"
      className="input !py-1 !w-[100px] !text-[12px] font-mono"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export default function ActivityLogbook() {
  const [activities, setActivities] = useState<ActivityRow[]>(seedA);
  const [rests, setRests] = useState<RestRow[]>(seedR);

  const witnessById = useMemo(() => {
    const m: Record<string, (typeof witnesses)[number]> = {};
    witnesses.forEach((w) => (m[w.id] = w));
    return m;
  }, []);

  const log = useMemo(
    () => buildLogbook(activities, rests, witnessById),
    [activities, rests, witnessById],
  );

  const fillPayload = useMemo(
    () => ({
      recordTitle: attemptMeta.recordTitle,
      applicationRef: attemptMeta.applicationRef,
      pairs: pairLogbookEntries(log.entries),
    }),
    [log.entries],
  );

  const [templateExists, setTemplateExists] = useState<boolean | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [rebuilding, setRebuilding] = useState(false);

  useEffect(() => {
    fetch(TEMPLATE_URL, { method: "HEAD" })
      .then((r) =>
        setTemplateExists(
          r.ok && r.headers.get("content-type")?.includes("pdf") !== false,
        ),
      )
      .catch(() => setTemplateExists(false));
  }, []);

  useEffect(() => {
    if (!templateExists) return;
    let cancelled = false;
    setRebuilding(true);
    const t = setTimeout(async () => {
      try {
        const blob = await fillLogbookPdf(fillPayload, TEMPLATE_URL);
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        setPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      } finally {
        if (!cancelled) setRebuilding(false);
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [fillPayload, templateExists]);

  const handleDownloadTemplate = async () => {
    if (!templateExists) {
      alert(
        `Template PDF not found.\n\nPlace the official GWR Activity Log Book template at:\nfrontend/public/log-book-template-2022.pdf`,
      );
      return;
    }
    await downloadFilledLogbook(
      fillPayload,
      `GWR_Activity_Log_Book_${attemptMeta.applicationRef}.pdf`,
    );
  };

  const addActivity = () => {
    const seq = (activities[activities.length - 1]?.sequence ?? 0) + 1;
    const last = activities[activities.length - 1];
    setActivities([
      ...activities,
      {
        id: `A${Date.now()}`,
        sequence: seq,
        startHHMM: last ? last.endHHMM : "09:00",
        endHHMM: "10:00",
      },
    ]);
  };

  const addRest = () => {
    const seq = (rests[rests.length - 1]?.sequence ?? 0) + 1;
    const lastA = activities[activities.length - 1];
    setRests([
      ...rests,
      {
        id: `R${Date.now()}`,
        sequence: seq,
        startHHMM: lastA?.endHHMM ?? "10:00",
        endHHMM: "10:05",
      },
    ]);
  };

  const updateActivity = (id: string, patch: Partial<ActivityRow>) =>
    setActivities((arr) => arr.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  const updateRest = (id: string, patch: Partial<RestRow>) =>
    setRests((arr) => arr.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const delActivity = (id: string) => setActivities((arr) => arr.filter((a) => a.id !== id));
  const delRest = (id: string) => setRests((arr) => arr.filter((r) => r.id !== id));

  const aiValidate = () => {
    // simulate AI suggestion: flag short activities and zero-rest violations
    alert(
      log.violations.length
        ? `AI found ${log.violations.length} rule violation(s):\n\n${log.violations.join("\n")}`
        : "AI validation passed: all rest sequences respect GWR 5-min-per-hour accrual.",
    );
  };

  const handlePrint = () => {
    const win = window.open("", "_blank", "width=900,height=1100");
    if (!win) return;
    const rows = log.entries
      .map((e) => {
        if (e.kind === "activity") {
          return `<tr>
            <td>${e.sequence}</td><td>Activity</td>
            <td>${e.startHHMM}</td><td>${e.endHHMM}</td>
            <td>${minToHHMM(e.durationMin)}</td>
            <td>+${e.accumulatedRestMin} min earned</td>
            <td>${e.witness1 ? `${e.witness1.firstName} ${e.witness1.lastName}` : "—"}</td>
            <td>${e.witness2 ? `${e.witness2.firstName} ${e.witness2.lastName}` : "—"}</td>
          </tr>`;
        }
        return `<tr style="background:#FBF5E5">
            <td>${e.sequence}</td><td>Rest</td>
            <td>${e.startHHMM}</td><td>${e.endHHMM}</td>
            <td>${minToHHMM(e.durationMin)}</td>
            <td>Avail: ${e.availableRestMin} · Taken: ${e.takenNowMin} · Carry: ${e.carriedForwardMin}</td>
            <td>${e.witness1 ? `${e.witness1.firstName} ${e.witness1.lastName}` : "—"}</td>
            <td>${e.witness2 ? `${e.witness2.firstName} ${e.witness2.lastName}` : "—"}</td>
          </tr>`;
      })
      .join("");
    win.document.write(`
      <html><head><title>Activity Log Book — ${attemptMeta.recordTitle}</title>
      <style>
        body{font-family:Inter,ui-sans-serif,system-ui;color:#1F2937;padding:32px;line-height:1.5}
        h1{color:#003B7A;margin:0 0 4px}
        .sub{color:#6B7280;font-size:12px;margin-bottom:18px}
        table{width:100%;border-collapse:collapse;font-size:12px}
        th,td{border:1px solid #E5E7EB;padding:6px 8px;text-align:left}
        th{background:#0057B8;color:#fff;font-size:11px;text-transform:uppercase;letter-spacing:.08em}
      </style></head><body>
      <h1>Activity Log Book</h1>
      <div class="sub">${attemptMeta.recordTitle} · ${attemptMeta.applicationRef}</div>
      <table>
        <thead><tr>
          <th>Seq</th><th>Kind</th><th>Start</th><th>End</th><th>Duration</th>
          <th>Rest accounting</th><th>Witness 1</th><th>Witness 2</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="margin-top:18px;font-size:11px;color:#6B7280">
        Total activity: ${fmtDuration(log.totalActivityMin)} · Total rest taken: ${fmtDuration(log.totalRestTakenMin)} · Carried forward: ${log.restBalanceMin} min
      </p>
      <script>window.onload=()=>setTimeout(()=>window.print(),250)</script>
      </body></html>
    `);
    win.document.close();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Logbook (Auto-Calculated)"
        subtitle="Editable timeline of activity and rest sequences. The platform applies GWR's 5-min-per-uninterrupted-hour rest accrual rule automatically and flags any rule violations."
        actions={
          <>
            <Button variant="outline" onClick={aiValidate}>
              <Wand2 className="h-4 w-4" /> AI validate
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4" /> Print summary
            </Button>
            <Button variant="gold" onClick={handleDownloadTemplate}>
              <Download className="h-4 w-4" /> Download official GWR PDF
            </Button>
          </>
        }
      />

      {/* Summary strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="!p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted font-semibold">Total activity</div>
          <div className="text-3xl font-bold mt-1">{fmtDuration(log.totalActivityMin)}</div>
        </Card>
        <Card className="!p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted font-semibold">Total rest taken</div>
          <div className="text-3xl font-bold mt-1">{fmtDuration(log.totalRestTakenMin)}</div>
        </Card>
        <Card className="!p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted font-semibold">Rest balance</div>
          <div className={`text-3xl font-bold mt-1 ${log.restBalanceMin <= 0 ? "text-rose-600" : "text-emerald-600"}`}>
            {log.restBalanceMin} <span className="text-base text-muted">min</span>
          </div>
          <div className="text-[11px] text-muted mt-1">5 min earned per uninterrupted hour</div>
        </Card>
        <Card className="!p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted font-semibold">Rule validation</div>
          {log.violations.length === 0 ? (
            <div className="flex items-center gap-2 mt-1 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" /><span className="font-bold">All rules respected</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-1 text-rose-600">
              <AlertTriangle className="h-5 w-5" /><span className="font-bold">{log.violations.length} violation(s)</span>
            </div>
          )}
        </Card>
      </div>

      {/* Editable activity table */}
      <Card>
        <CardHeader
          title="Activity sequences"
          subtitle="Add, edit or remove activity sequences. Duration and earned rest time update live."
          action={
            <Button variant="outline" onClick={addActivity}>
              <Plus className="h-4 w-4" /> Add activity
            </Button>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-canvas">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted">
                <th className="px-2 py-2 font-medium">#</th>
                <th className="px-2 py-2 font-medium">Start</th>
                <th className="px-2 py-2 font-medium">End</th>
                <th className="px-2 py-2 font-medium">Duration</th>
                <th className="px-2 py-2 font-medium">Earned rest</th>
                <th className="px-2 py-2 font-medium">Witness 1</th>
                <th className="px-2 py-2 font-medium">Witness 2</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {activities.map((a) => {
                const d = diffMinutes(a.startHHMM, a.endHHMM);
                const earned = Math.floor(d / 60) * 5;
                return (
                  <tr key={a.id} className="border-t border-line">
                    <td className="px-2 py-2 font-semibold text-royal">{a.sequence}</td>
                    <td className="px-2 py-2">
                      <TimeCell value={a.startHHMM} onChange={(v) => updateActivity(a.id, { startHHMM: v })} />
                    </td>
                    <td className="px-2 py-2">
                      <TimeCell value={a.endHHMM} onChange={(v) => updateActivity(a.id, { endHHMM: v })} />
                    </td>
                    <td className="px-2 py-2 font-mono text-[12px]">{minToHHMM(d)}</td>
                    <td className="px-2 py-2">
                      <Badge tone="gold">+{earned} min</Badge>
                    </td>
                    <td className="px-2 py-2">
                      <WitnessSelect value={a.witness1Id} onChange={(v) => updateActivity(a.id, { witness1Id: v })} />
                    </td>
                    <td className="px-2 py-2">
                      <WitnessSelect value={a.witness2Id} onChange={(v) => updateActivity(a.id, { witness2Id: v })} />
                    </td>
                    <td className="px-2 py-2 text-right">
                      <button onClick={() => delActivity(a.id)} className="btn-ghost !p-1.5">
                        <Trash2 className="h-3.5 w-3.5 text-muted" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Editable rest table */}
      <Card>
        <CardHeader
          title="Rest sequences"
          subtitle="Each rest deducts from the earned-rest balance. If the balance goes negative, the attempt would end."
          action={
            <Button variant="outline" onClick={addRest}>
              <Plus className="h-4 w-4" /> Add rest
            </Button>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-canvas">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted">
                <th className="px-2 py-2 font-medium">#</th>
                <th className="px-2 py-2 font-medium">Start</th>
                <th className="px-2 py-2 font-medium">End</th>
                <th className="px-2 py-2 font-medium">Taken</th>
                <th className="px-2 py-2 font-medium">Witness 1</th>
                <th className="px-2 py-2 font-medium">Witness 2</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rests.map((r) => (
                <tr key={r.id} className="border-t border-line">
                  <td className="px-2 py-2 font-semibold text-royal">{r.sequence}</td>
                  <td className="px-2 py-2">
                    <TimeCell value={r.startHHMM} onChange={(v) => updateRest(r.id, { startHHMM: v })} />
                  </td>
                  <td className="px-2 py-2">
                    <TimeCell value={r.endHHMM} onChange={(v) => updateRest(r.id, { endHHMM: v })} />
                  </td>
                  <td className="px-2 py-2 font-mono text-[12px]">{minToHHMM(diffMinutes(r.startHHMM, r.endHHMM))}</td>
                  <td className="px-2 py-2">
                    <WitnessSelect value={r.witness1Id} onChange={(v) => updateRest(r.id, { witness1Id: v })} />
                  </td>
                  <td className="px-2 py-2">
                    <WitnessSelect value={r.witness2Id} onChange={(v) => updateRest(r.id, { witness2Id: v })} />
                  </td>
                  <td className="px-2 py-2 text-right">
                    <button onClick={() => delRest(r.id)} className="btn-ghost !p-1.5">
                      <Trash2 className="h-3.5 w-3.5 text-muted" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Computed timeline */}
      <Card>
        <CardHeader
          title="Auto-computed timeline"
          subtitle="Merged activity + rest sequences with rest-time accounting per GWR Endurance Marathon rules."
        />
        <div className="relative pl-6">
          <div className="absolute left-2 top-1 bottom-1 w-px bg-line" />
          {log.entries.map((e, i) => (
            <div key={i} className="relative pb-4 last:pb-0">
              <div
                className={
                  "absolute -left-[18px] top-2 h-3.5 w-3.5 rounded-full border-2 border-white " +
                  (e.kind === "activity" ? "bg-royal" : "bg-gold")
                }
              />
              <div className="flex flex-wrap items-baseline gap-3 text-sm">
                <Badge tone={e.kind === "activity" ? "blue" : "gold"}>
                  {e.kind === "activity" ? <Activity className="h-3 w-3" /> : <Coffee className="h-3 w-3" />}
                  {e.kind === "activity" ? "Activity" : "Rest"} #{e.sequence}
                </Badge>
                <span className="font-mono text-[12px] text-muted">
                  <Clock className="h-3 w-3 inline mr-1" />
                  {e.startHHMM} → {e.endHHMM} · {minToHHMM(e.durationMin)}
                </span>
                {e.kind === "activity" ? (
                  <span className="text-[12px] text-emerald-700">
                    +{e.accumulatedRestMin} min rest credit earned
                  </span>
                ) : (
                  <span className="text-[12px] text-muted">
                    Available <strong className="text-soft">{e.availableRestMin}</strong> ·
                    Taken <strong className="text-soft">{e.takenNowMin}</strong> ·
                    Carried <strong className={(e.carriedForwardMin ?? 0) === 0 ? "text-rose-600" : "text-emerald-700"}>
                      {e.carriedForwardMin}
                    </strong>
                  </span>
                )}
                {(e.witness1 || e.witness2) && (
                  <span className="text-[11px] text-muted">
                    Witnessed by {[e.witness1, e.witness2].filter(Boolean).map((w) => w!.firstName + " " + w!.lastName).join(", ")}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {log.violations.length > 0 && (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-[12px] text-rose-800">
            <div className="font-bold flex items-center gap-1.5 mb-1">
              <AlertTriangle className="h-3.5 w-3.5" /> Rule violations detected
            </div>
            <ul className="list-disc pl-5 space-y-0.5">
              {log.violations.map((v, i) => (
                <li key={i}>{v}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4">
          <div className="text-[11px] uppercase tracking-wider text-muted font-semibold mb-1">
            24-hour minimum requirement (Rule 1)
          </div>
          <Progress
            value={Math.min(100, (log.totalActivityMin / (24 * 60)) * 100)}
            tone={log.totalActivityMin >= 24 * 60 ? "green" : "blue"}
          />
          <div className="text-[11px] text-muted mt-1">
            {fmtDuration(log.totalActivityMin)} / 24h 00m of continuous development activity
          </div>
        </div>
      </Card>

      {/* ===== Official GWR template — auto-filled, inline preview ===== */}
      <Card className="!p-0 overflow-hidden">
        <div className="flex items-center justify-between bg-canvas px-5 py-3 border-b border-line">
          <div>
            <div className="text-[11px] uppercase tracking-wider font-bold text-royal">
              Official GWR Activity Log Book Template 2022
            </div>
            <div className="text-[11.5px] text-muted mt-0.5">
              One page per Activity + Rest sequence. Page 1 layout for sequence
              #1; subsequent sequences use the page-2 layout (with the 5-min
              accrual footnote) per the official template.
            </div>
          </div>
          <div className="flex items-center gap-2">
            {rebuilding && (
              <span className="text-[11px] text-muted flex items-center gap-1">
                <RefreshCw className="h-3 w-3 animate-spin" /> Updating…
              </span>
            )}
            <Badge tone="gold">Auto-filled</Badge>
            <Button variant="outline" onClick={handleDownloadTemplate}>
              <Download className="h-4 w-4" /> Download
            </Button>
          </div>
        </div>

        {templateExists === null && (
          <div className="p-8 text-center text-[12px] text-muted">Checking template…</div>
        )}

        {templateExists === false && (
          <div className="p-8 text-center">
            <FileWarning className="h-10 w-10 text-amber-500 mx-auto mb-3" />
            <div className="font-bold text-soft mb-1">Template PDF not found</div>
            <p className="text-[12.5px] text-muted leading-relaxed max-w-md mx-auto">
              Place the official GWR Activity Log Book template at:
            </p>
            <code className="block mt-3 bg-canvas border border-line rounded px-3 py-2 text-[11.5px] text-soft inline-block">
              frontend/public/log-book-template-2022.pdf
            </code>
            <div className="text-[11px] text-muted mt-3">Then refresh this page.</div>
          </div>
        )}

        {templateExists && previewUrl && (
          <object
            data={previewUrl + "#toolbar=0&navpanes=0"}
            type="application/pdf"
            className="block w-full bg-canvas"
            style={{ height: "90vh" }}
          >
            <div className="p-6 text-[12px] text-muted">
              Your browser cannot display PDFs inline.{" "}
              <a href={previewUrl} download className="text-royal underline">
                Download the filled PDF
              </a>
              .
            </div>
          </object>
        )}

        <div className="px-5 py-3 bg-canvas border-t border-line text-[11px] text-muted">
          Values are stamped on top of the real GWR template at the official
          field coordinates. Tweak positions in <code>src/lib/logbookPdf.ts</code>{" "}
          if any value lands a few pixels off in your PDF reader.
        </div>
      </Card>
    </div>
  );
}
