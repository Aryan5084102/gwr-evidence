import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { LogbookEntry } from "@/types";

/**
 * The official GWR Activity Log Book Template 2022 has two layout variants:
 *  - Page 1: Activity + Rest pair (Rest uses "Total Rest Time Available Up to Now").
 *  - Page 2: Activity + Rest pair (Rest uses "Total Valid Time Available Up to Now"
 *    plus the 5-min-per-uninterrupted-hour accrual footnote).
 * Pages 3 & 4 are filled examples and are dropped.
 *
 * We embed the two blank template pages as background graphics and stamp text
 * on top at the field coordinates pulled from the AcroForm widget rectangles.
 * Sequence #1 uses the page-1 layout; every subsequent sequence reuses the
 * page-2 layout (one A4 sheet per Activity+Rest pair).
 */

export interface LogbookFillData {
  recordTitle: string;
  applicationRef: string;
  pairs: LogbookPair[];
}

export interface LogbookPair {
  activity?: LogbookEntry; // kind === "activity"
  rest?: LogbookEntry;     // kind === "rest"
}

interface Layout {
  activity: {
    seq: [number, number];
    start: [number, number];
    finish: [number, number];
    completed: [number, number];
    accumRest: [number, number];
    witness1: [number, number];
    witness2: [number, number];
  };
  rest: {
    seq: [number, number];
    start: [number, number];
    finish: [number, number];
    avail: [number, number];
    taken: [number, number];
    carry: [number, number];
    witness1: [number, number];
    witness2: [number, number];
  };
}

// Coordinates captured from the official AcroForm widget rectangles
// (y is measured from page bottom). The +5 baseline offset puts the text
// vertically centred inside each field box.
const LAYOUT_PAGE1: Layout = {
  activity: {
    seq:        [310, 681 + 5],
    start:      [62,  614 + 5],
    finish:     [188, 614 + 5],
    completed:  [302, 614 + 5],
    accumRest:  [415, 614 + 5],
    witness1:   [124, 546 + 5],
    witness2:   [364, 546 + 5],
  },
  rest: {
    seq:        [310, 435 + 5],
    start:      [62,  378 + 5],
    finish:     [302, 378 + 5],
    avail:      [302, 351 + 5],
    taken:      [302, 324 + 5],
    carry:      [302, 296 + 5],
    witness1:   [124, 223 + 5],
    witness2:   [366, 223 + 5],
  },
};

const LAYOUT_PAGE2: Layout = {
  activity: {
    seq:        [310, 681 + 5],
    start:      [62,  614 + 5],
    finish:     [188, 614 + 5],
    completed:  [302, 614 + 5],
    accumRest:  [422, 614 + 5],
    witness1:   [126, 546 + 5],
    witness2:   [367, 546 + 5],
  },
  rest: {
    seq:        [312, 400 + 5],
    start:      [63,  344 + 5],
    finish:     [303, 344 + 5],
    avail:      [302, 317 + 5],
    taken:      [302, 289 + 5],
    carry:      [302, 261 + 5],
    witness1:   [124, 186 + 5],
    witness2:   [366, 187 + 5],
  },
};

function hhmm(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function witnessName(w?: LogbookEntry["witness1"]): string {
  if (!w) return "—";
  return `${w.firstName} ${w.lastName}`;
}

export async function fillLogbookPdf(
  data: LogbookFillData,
  templateUrl = "/log-book-template-2022.pdf",
): Promise<Blob> {
  const bytes = await fetch(templateUrl).then((r) => {
    if (!r.ok) throw new Error(`Template not found at ${templateUrl}`);
    return r.arrayBuffer();
  });
  const src = await PDFDocument.load(bytes);

  // Build a "blank" copy of the source: same pages, but with all AcroForm
  // widget annotations removed so the rendered output is purely the template
  // chrome (background colour, table lines, labels). We then stamp values
  // on top at the coordinates we already captured.
  const blank = await PDFDocument.load(bytes);
  try {
    blank.getForm().getFields().forEach((f) => {
      try { blank.getForm().removeField(f); } catch { /* ignore */ }
    });
  } catch { /* ignore */ }

  const out = await PDFDocument.create();
  const font = await out.embedFont(StandardFonts.Helvetica);
  const fontBold = await out.embedFont(StandardFonts.HelveticaBold);

  const [embPage1, embPage2] = await out.embedPages([
    blank.getPage(0),
    blank.getPage(1),
  ]);

  const text = rgb(0.07, 0.09, 0.15);

  const drawValue = (
    page: ReturnType<typeof out.addPage>,
    value: string,
    xy: [number, number],
    size = 10,
    bold = false,
  ) => {
    page.drawText(value, {
      x: xy[0],
      y: xy[1],
      size,
      font: bold ? fontBold : font,
      color: text,
    });
  };

  const stampHeader = (page: ReturnType<typeof out.addPage>, pageNum: number, total: number) => {
    page.drawText(
      `${data.recordTitle}   ·   ${data.applicationRef}   ·   Sequence ${pageNum} of ${total}`,
      { x: 40, y: 815, size: 9, font, color: rgb(0.35, 0.4, 0.5) },
    );
  };

  const pairs = data.pairs.length ? data.pairs : [{}];
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    const isFirst = i === 0;
    const emb = isFirst ? embPage1 : embPage2;
    const layout = isFirst ? LAYOUT_PAGE1 : LAYOUT_PAGE2;

    const page = out.addPage([595.276, 841.89]);
    page.drawPage(emb, { x: 0, y: 0, width: 595.276, height: 841.89 });
    stampHeader(page, i + 1, pairs.length);

    const a = pair.activity;
    if (a) {
      drawValue(page, String(a.sequence), layout.activity.seq, 10, true);
      drawValue(page, a.startHHMM, layout.activity.start);
      drawValue(page, a.endHHMM, layout.activity.finish);
      drawValue(page, hhmm(a.durationMin), layout.activity.completed);
      drawValue(page, `${a.accumulatedRestMin ?? 0} min`, layout.activity.accumRest);
      drawValue(page, witnessName(a.witness1), layout.activity.witness1, 9);
      drawValue(page, witnessName(a.witness2), layout.activity.witness2, 9);
    }

    const r = pair.rest;
    if (r) {
      drawValue(page, String(r.sequence), layout.rest.seq, 10, true);
      drawValue(page, r.startHHMM, layout.rest.start);
      drawValue(page, r.endHHMM, layout.rest.finish);
      drawValue(page, `${r.availableRestMin ?? 0} min`, layout.rest.avail);
      drawValue(page, `${r.takenNowMin ?? 0} min`, layout.rest.taken);
      drawValue(page, `${r.carriedForwardMin ?? 0} min`, layout.rest.carry);
      drawValue(page, witnessName(r.witness1), layout.rest.witness1, 9);
      drawValue(page, witnessName(r.witness2), layout.rest.witness2, 9);
    }
  }

  const saved = await out.save();
  const ab = new ArrayBuffer(saved.byteLength);
  new Uint8Array(ab).set(saved);
  return new Blob([ab], { type: "application/pdf" });
}

export async function downloadFilledLogbook(
  data: LogbookFillData,
  filename = "GWR_Activity_Log_Book_filled.pdf",
) {
  const blob = await fillLogbookPdf(data);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Pair activity sequence N with rest sequence N from the computed entries. */
export function pairLogbookEntries(entries: LogbookEntry[]): LogbookPair[] {
  const byActivity = new Map<number, LogbookEntry>();
  const byRest = new Map<number, LogbookEntry>();
  for (const e of entries) {
    if (e.kind === "activity") byActivity.set(e.sequence, e);
    else byRest.set(e.sequence, e);
  }
  const seqs = Array.from(new Set([...byActivity.keys(), ...byRest.keys()])).sort((a, b) => a - b);
  return seqs.map((s) => ({ activity: byActivity.get(s), rest: byRest.get(s) }));
}
