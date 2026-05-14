import { PDFDocument, StandardFonts } from "pdf-lib";

/**
 * The official GWR Cover Letter Template 2022 ships with AcroForm fields.
 * We fill those fields directly rather than overlaying text at coordinates,
 * which guarantees every value lands exactly inside its box on the template.
 */
export interface CoverLetterFill {
  recordTitle: string;
  applicationRef: string;
  currentRecord: string;
  attemptResults: string;
  holderFirstName: string;
  holderLastName: string;
  holderOrganisation: string;
  holderNationality: string;
  holderGender: "Male" | "Female" | "Other";
  location: string;
  startISO: string;
  endISO: string;
  attemptDescription: string;
  evidence: {
    witnessStatement: boolean;
    video: boolean;
    photos: boolean;
    specific: boolean;
    other: boolean;
    otherText: string;
    signedBy: string;
  };
  completedFirstName: string;
  completedLastName: string;
  completedISO: string;
}

function splitDateParts(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return { dd: "", mm: "", yyyy: "" };
  return {
    dd: String(d.getDate()).padStart(2, "0"),
    mm: String(d.getMonth() + 1).padStart(2, "0"),
    yyyy: String(d.getFullYear()),
  };
}

export async function fillCoverLetterPdf(
  data: CoverLetterFill,
  templateUrl = "/cover-letter-template-2022.pdf",
  _options: { debugGrid?: boolean } = {},
): Promise<Blob> {
  const bytes = await fetch(templateUrl).then((r) => {
    if (!r.ok) throw new Error(`Template not found at ${templateUrl}`);
    return r.arrayBuffer();
  });
  const pdf = await PDFDocument.load(bytes);
  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const form = pdf.getForm();

  const setText = (fieldName: string, value: string, fontSize = 10) => {
    try {
      const f = form.getTextField(fieldName);
      f.setText(value ?? "");
      try { f.setFontSize(fontSize); } catch { /* ignore */ }
      // Helvetica is universally available; this avoids font-encoding errors on flatten.
      try { f.updateAppearances(helv); } catch { /* ignore */ }
    } catch {
      /* field missing — ignore */
    }
  };
  const check = (fieldName: string, on: boolean) => {
    try {
      const cb = form.getCheckBox(fieldName);
      if (on) cb.check(); else cb.uncheck();
    } catch {
      /* ignore */
    }
  };

  // Sections 1 & 2
  setText("1 Record Title", data.recordTitle, 10);
  setText("2 Application Reference Number", data.applicationRef, 10);

  // Sections 3 & 4
  setText("3 Current Record or minimum", data.currentRecord, 10);
  setText("4 Your Attempt Results", data.attemptResults, 10);

  // Section 5 — record holder
  setText("First Name", data.holderFirstName, 9);
  setText("Last Name", data.holderLastName, 9);
  setText("Nationality", data.holderNationality, 9);
  setText("Organization  Team Name", data.holderOrganisation, 9);
  check("Check Box2", data.holderGender === "Male");
  check("Check Box3", data.holderGender === "Female");
  check("Check Box4", data.holderGender === "Other");

  // Section 6 — location, dates, description
  setText("Location of attempt", data.location, 9);
  const s = splitDateParts(data.startISO);
  const e = splitDateParts(data.endISO);
  setText("undefined_2", s.dd, 9);
  setText("undefined_3", s.mm, 9);
  setText("undefined_4", s.yyyy, 9);
  setText("undefined_5", e.dd, 9);
  setText("undefined_6", e.mm, 9);
  setText("undefined_7", e.yyyy, 9);
  // Big description box on the left side of section 6.
  try {
    const desc = form.getTextField("surveyor");
    desc.enableMultiline();
    desc.setText(data.attemptDescription ?? "");
    try { desc.setFontSize(8); } catch { /* ignore */ }
    try { desc.updateAppearances(helv); } catch { /* ignore */ }
  } catch { /* ignore */ }

  // Section 7 — evidence
  check("Check Box5", data.evidence.witnessStatement);
  check("Check Box6", data.evidence.video);
  check("Check Box7", data.evidence.photos);
  check("Check Box8", data.evidence.specific);
  check("Check Box9", data.evidence.other);
  setText("Signed by", data.evidence.signedBy, 9);
  if (data.evidence.other) {
    try {
      const oth = form.getTextField("undefined_8");
      oth.enableMultiline();
      oth.setText(data.evidence.otherText ?? "");
      try { oth.setFontSize(9); } catch { /* ignore */ }
      try { oth.updateAppearances(helv); } catch { /* ignore */ }
    } catch { /* ignore */ }
  } else {
    setText("undefined_8", "", 9);
  }

  // Section 8 — completed by
  setText("First Name_2", data.completedFirstName, 9);
  setText("Last Name_2", data.completedLastName, 9);
  const c = splitDateParts(data.completedISO);
  setText("undefined_9", c.dd, 9);
  setText("undefined_10", c.mm, 9);
  setText("ddmmyyyy", c.yyyy, 9);

  // Refresh every appearance using a known-good font, then flatten so the
  // values render identically in every PDF viewer (including object/embed).
  try { form.updateFieldAppearances(helv); } catch { /* ignore */ }
  try { form.flatten(); } catch { /* ignore */ }

  const out = await pdf.save();
  const ab = new ArrayBuffer(out.byteLength);
  new Uint8Array(ab).set(out);
  return new Blob([ab], { type: "application/pdf" });
}

export async function downloadFilledCoverLetter(data: CoverLetterFill, filename = "GWR_Cover_Letter_filled.pdf") {
  const blob = await fillCoverLetterPdf(data);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
