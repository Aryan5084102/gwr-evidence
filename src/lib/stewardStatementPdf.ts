import { PDFDocument, StandardFonts } from "pdf-lib";

/**
 * The official GWR Steward Statement Template 2022 ships with AcroForm fields.
 * The steward template has a different section layout to the witness/timekeeper
 * forms — separate boxes for participant counts, role and disqualification
 * notes. Field names are filled directly with setText and the form is flattened.
 */
export interface StewardStatementFill {
  declarationName: string;
  recordTitle: string;
  applicationRef: string;
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  city: string;
  stateProvinceRegion: string;
  country: string;
  /** 4) when present at the attempt (dates & times) */
  presentDates: string;
  /** 5) role as steward */
  role: string;
  /** 6) how many participants observed + counting method */
  participantsObserved: string;
  /** 7) how many participated fully per guidelines */
  participantsValid: string;
  /** 8) how many disqualified + why */
  participantsDisqualified: string;
  completedISO: string;
  signatureDataUrl?: string;
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

export async function fillStewardStatementPdf(
  data: StewardStatementFill,
  templateUrl = "/steward-statement-template-2022.pdf",
): Promise<Blob> {
  const bytes = await fetch(templateUrl).then((r) => {
    if (!r.ok) throw new Error(`Template not found at ${templateUrl}`);
    return r.arrayBuffer();
  });
  const pdf = await PDFDocument.load(bytes);
  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const form = pdf.getForm();

  const setText = (fieldName: string, value: string, fontSize = 10, multiline = false) => {
    try {
      const f = form.getTextField(fieldName);
      if (multiline) { try { f.enableMultiline(); } catch { /* ignore */ } }
      f.setText(value ?? "");
      try { f.setFontSize(fontSize); } catch { /* ignore */ }
      try { f.updateAppearances(helv); } catch { /* ignore */ }
    } catch {
      /* field missing — ignore */
    }
  };

  setText("I", data.declarationName, 10);
  setText("Record Title", data.recordTitle, 10);
  setText("Application Reference Number", data.applicationRef, 10);

  // 2) Contact details — Name spans two stacked input rows
  setText("Name 1", data.firstName, 10);
  setText("Name 2", data.lastName, 10);
  setText("Email", data.email, 10);
  setText("Telephone", data.telephone, 10);

  // 3) Location
  setText("City", data.city, 10);
  setText("StateProvinceRegion", data.stateProvinceRegion, 10);
  setText("Country", data.country, 10);

  // 4-8) Free-text answers
  setText("include dates and times", data.presentDates, 9, true);
  setText("5 What was your role as a steward", data.role, 9, true);
  setText("how did you count them", data.participantsObserved, 9, true);
  setText("guidelines of the record", data.participantsValid, 9, true);
  setText("why were they disqualified", data.participantsDisqualified, 9, true);

  const d = splitDateParts(data.completedISO);
  setText("Date", d.dd, 9);
  setText("undefined_11", d.mm, 9);
  setText("undefined_12", d.yyyy, 9);

  try { form.updateFieldAppearances(helv); } catch { /* ignore */ }
  try { form.flatten(); } catch { /* ignore */ }

  if (data.signatureDataUrl) {
    try {
      const sig = data.signatureDataUrl;
      const isPng = sig.startsWith("data:image/png");
      const b64 = sig.split(",")[1] ?? "";
      const bin = typeof atob === "function"
        ? Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
        : Buffer.from(b64, "base64");
      const img = isPng ? await pdf.embedPng(bin) : await pdf.embedJpg(bin);
      const page = pdf.getPage(0);
      // Sign here line sits to the left of the date row (y=180.5).
      const targetW = 180;
      const ratio = img.height / img.width;
      page.drawImage(img, { x: 90, y: 178, width: targetW, height: targetW * ratio });
    } catch {
      /* signature is optional */
    }
  }

  const out = await pdf.save();
  const ab = new ArrayBuffer(out.byteLength);
  new Uint8Array(ab).set(out);
  return new Blob([ab], { type: "application/pdf" });
}

export async function downloadFilledStewardStatement(
  data: StewardStatementFill,
  filename = "GWR_Steward_Statement_filled.pdf",
) {
  const blob = await fillStewardStatementPdf(data);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
