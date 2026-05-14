import type {
  ActivityRow,
  RestRow,
  LogbookEntry,
  Witness,
  AttemptMeta,
  SubmissionHealth,
} from "@/types";

/* ---------- time helpers ---------- */

export function hhmmToMin(s: string): number {
  if (!s || !/^\d{1,2}:\d{2}$/.test(s)) return NaN;
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
}

export function minToHHMM(mins: number): string {
  if (!isFinite(mins)) return "—";
  const sign = mins < 0 ? "-" : "";
  const m = Math.abs(Math.round(mins));
  return `${sign}${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

/** handles cross-midnight: if end < start, add 24h */
export function diffMinutes(start: string, end: string): number {
  const a = hhmmToMin(start);
  const b = hhmmToMin(end);
  if (isNaN(a) || isNaN(b)) return 0;
  let d = b - a;
  if (d < 0) d += 24 * 60;
  return d;
}

/* ---------- GWR Endurance Marathon rules ---------- */

/**
 * Per GWR rules: 5 minutes of rest accrued for each FULL uninterrupted hour
 * of activity completed in a single activity sequence. Partial hours don't count.
 */
export function restEarnedFromActivity(activityMinutes: number): number {
  return Math.floor(activityMinutes / 60) * 5;
}

/**
 * Compute interleaved logbook timeline from activity + rest rows.
 * Activities and rests are sorted by sequence number and merged in order.
 *
 * Rules applied:
 *  - Activity earns floor(durationMin/60)*5 minutes of rest credit
 *  - Rest "Total Available Up to Now" = sum of credit earned - sum already taken (before this rest)
 *  - "Taken Now" = duration of this rest
 *  - "Carried Forward" = Available - Taken
 *  - If Carried Forward goes negative -> rule violation (attempt would end)
 */
export function buildLogbook(
  activities: ActivityRow[],
  rests: RestRow[],
  witnessById: Record<string, Witness | undefined>,
): { entries: LogbookEntry[]; totalActivityMin: number; totalRestTakenMin: number; restBalanceMin: number; violations: string[] } {
  const interleaved: Array<{ kind: "activity" | "rest"; seq: number; row: ActivityRow | RestRow }> = [];
  activities.forEach((a) => interleaved.push({ kind: "activity", seq: a.sequence, row: a }));
  rests.forEach((r) => interleaved.push({ kind: "rest", seq: r.sequence, row: r }));
  // Stable order: by sequence, with activity preceding rest of same sequence
  interleaved.sort((a, b) =>
    a.seq !== b.seq ? a.seq - b.seq : a.kind === "activity" ? -1 : 1,
  );

  let totalActivityMin = 0;
  let totalRestTakenMin = 0;
  let earnedRestMin = 0;
  let restBalance = 0; // earned - taken
  const violations: string[] = [];

  const entries: LogbookEntry[] = interleaved.map((item) => {
    const dur = diffMinutes(item.row.startHHMM, item.row.endHHMM);
    if (item.kind === "activity") {
      const earned = restEarnedFromActivity(dur);
      totalActivityMin += dur;
      earnedRestMin += earned;
      restBalance += earned;
      const a = item.row as ActivityRow;
      return {
        kind: "activity",
        sequence: a.sequence,
        startHHMM: a.startHHMM,
        endHHMM: a.endHHMM,
        durationMin: dur,
        accumulatedRestMin: earned,
        witness1: a.witness1Id ? witnessById[a.witness1Id] : undefined,
        witness2: a.witness2Id ? witnessById[a.witness2Id] : undefined,
      };
    } else {
      const r = item.row as RestRow;
      const available = restBalance;
      const taken = dur;
      const carried = available - taken;
      if (carried < 0) {
        violations.push(
          `Rest #${r.sequence}: took ${taken} min but only ${available} min available. Attempt would END.`,
        );
      }
      totalRestTakenMin += taken;
      restBalance = Math.max(0, carried); // floor at 0 for downstream display
      return {
        kind: "rest",
        sequence: r.sequence,
        startHHMM: r.startHHMM,
        endHHMM: r.endHHMM,
        durationMin: taken,
        availableRestMin: available,
        takenNowMin: taken,
        carriedForwardMin: Math.max(0, carried),
        witness1: r.witness1Id ? witnessById[r.witness1Id] : undefined,
        witness2: r.witness2Id ? witnessById[r.witness2Id] : undefined,
      };
    }
  });

  return {
    entries,
    totalActivityMin,
    totalRestTakenMin,
    restBalanceMin: restBalance,
    violations,
  };
}

/* ---------- submission health / completeness ---------- */

export interface HealthInputs {
  meta: AttemptMeta;
  witnesses: Witness[];
  activities: ActivityRow[];
  rests: RestRow[];
  evidenceCount: number;
  videoCount: number;
  photoCount: number;
  mediaArticlesCount: number;
  timekeeperCount: number;
  qualificationsUploaded: boolean;
  layoutDiagramUploaded: boolean;
}

export function computeSubmissionHealth(inp: HealthInputs): SubmissionHealth {
  const items: SubmissionHealth["items"] = [];

  const metaComplete =
    inp.meta.recordTitle &&
    inp.meta.applicationRef &&
    inp.meta.venue &&
    inp.meta.city &&
    inp.meta.country &&
    inp.meta.startISO &&
    inp.meta.endISO &&
    inp.meta.attemptDescription.length > 40;
  items.push({
    id: "cover-letter",
    label: "Cover Letter",
    state: metaComplete ? "complete" : "partial",
    detail: metaComplete
      ? "All required fields populated"
      : "Missing fields or short description",
  });

  const specialists = inp.witnesses.filter((w) => w.role === "specialist" && w.status === "completed");
  const independents = inp.witnesses.filter((w) => w.role === "independent" && w.status === "completed");
  items.push({
    id: "specialist-witness",
    label: "Specialist Witness Statements",
    state: specialists.length >= 2 ? "complete" : specialists.length === 1 ? "partial" : "missing",
    detail: `${specialists.length}/2 specialist witness statements completed`,
  });
  items.push({
    id: "independent-witness",
    label: "Independent Witness Statements",
    state: independents.length >= 2 ? "complete" : independents.length >= 1 ? "partial" : "missing",
    detail: `${independents.length} independent witness statement(s) signed`,
  });

  const timekeepers = inp.witnesses.filter((w) => w.role === "timekeeper" && w.status === "completed");
  items.push({
    id: "timekeepers",
    label: "Timekeeper Statements",
    state: timekeepers.length >= 2 ? "complete" : timekeepers.length === 1 ? "partial" : "missing",
    detail: `${timekeepers.length}/2 timekeeper statements signed`,
  });

  items.push({
    id: "logbook",
    label: "Activity Logbook",
    state: inp.activities.length >= 1 ? "complete" : "missing",
    detail: `${inp.activities.length} activity rows, ${inp.rests.length} rest rows`,
  });

  items.push({
    id: "qualifications",
    label: "Proof of Lead Qualifications",
    state: inp.qualificationsUploaded ? "complete" : "missing",
    detail: inp.qualificationsUploaded ? "Uploaded" : "Lead organiser must upload AI/ML qualifications",
  });

  items.push({
    id: "layout",
    label: "Layout Diagram of Attempt Area",
    state: inp.layoutDiagramUploaded ? "complete" : "missing",
  });

  items.push({
    id: "video",
    label: "Video Evidence",
    state: inp.videoCount > 0 ? "complete" : "missing",
    detail: `${inp.videoCount} video segment(s) uploaded`,
  });

  items.push({
    id: "photos",
    label: "Photographic Evidence",
    state: inp.photoCount >= 10 ? "complete" : inp.photoCount > 0 ? "partial" : "missing",
    detail: `${inp.photoCount} photograph(s)`,
  });

  items.push({
    id: "media",
    label: "Media Articles (optional)",
    state: inp.mediaArticlesCount > 0 ? "complete" : "partial",
    detail: `${inp.mediaArticlesCount} article(s) — optional, but strengthens claim`,
  });

  // Score
  const weights: Record<string, number> = {
    "cover-letter": 12,
    "specialist-witness": 14,
    "independent-witness": 12,
    "timekeepers": 10,
    "logbook": 14,
    "qualifications": 8,
    "layout": 6,
    "video": 12,
    "photos": 8,
    "media": 4,
  };
  let total = 0;
  let maxTotal = 0;
  for (const it of items) {
    const w = weights[it.id] ?? 5;
    maxTotal += w;
    if (it.state === "complete") total += w;
    else if (it.state === "partial") total += w * 0.5;
  }
  return { score: Math.round((total / maxTotal) * 100), items };
}

/* ---------- submission package structure ---------- */

export const SUBMISSION_PACKAGE_FOLDERS = [
  { name: "01_Cover_Letter", desc: "Cover letter PDF + appendix" },
  { name: "02_Witness_Statements", desc: "All independent + specialist witness PDFs" },
  { name: "03_Activity_Log", desc: "Endurance marathon logbook PDF + CSV export" },
  { name: "04_Timekeeper_Logs", desc: "Official timekeeper statements" },
  { name: "05_Evidence", desc: "Photographs, layout diagram, qualifications" },
  { name: "06_Videos", desc: "Continuous attempt recording (part_1 … part_N)" },
  { name: "07_Media", desc: "Press articles, blog coverage, broadcasts" },
] as const;

/* ---------- formatting ---------- */

export function fmtDuration(totalMin: number): string {
  const sign = totalMin < 0 ? "-" : "";
  const m = Math.abs(Math.round(totalMin));
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return `${sign}${h}h ${String(rem).padStart(2, "0")}m`;
}

export function fmtAttemptDuration(startISO: string, endISO: string): string {
  const start = new Date(startISO).getTime();
  const end = new Date(endISO).getTime();
  if (isNaN(start) || isNaN(end) || end < start) return "—";
  const sec = Math.floor((end - start) / 1000);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}
