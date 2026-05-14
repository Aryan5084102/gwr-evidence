import { PDFDocument, StandardFonts } from "pdf-lib";

/**
 * The official GWR Witness Statement Template 2022 ships with AcroForm fields.
 * We fill those fields directly with setText so every value lands inside the
 * exact box defined by the template, then flatten. An optional signature
 * image (data URL) is drawn on top of the flattened page at the "Sign here"
 * position so the digitally-captured signature appears on the final PDF.
 */
export interface WitnessStatementFill {
  declarationName: string; // "I, ____" — the witness's full name
  recordTitle: string;
  applicationRef: string;
  firstName: string;
  lastName: string;
  organisation: string;
  nationality: string;
  email: string;
  telephone: string;
  /** 3) details of all the record guidelines you witnessed being followed */
  witnessDetails: string;
  /** 4) reason for witnessing the record attempt / expertise */
  expertise: string;
  /** 5) final measurement */
  finalMeasurement: string;
  /** 6) venue / city / country */
  venue: string;
  cityTown: string;
  country: string;
  /** 7) when were you present at the record attempt (dates & times) */
  presentDates: string;
  /** 8) completed-by date (ISO) — split into dd/mm/yyyy */
  completedISO: string;
  /** optional base64 PNG/JPEG of the digital signature */
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

export async function fillWitnessStatementPdf(
  data: WitnessStatementFill,
  templateUrl = "/witness-statement-template-2022.pdf",
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
      if (multiline) {
        try { f.enableMultiline(); } catch { /* ignore */ }
      }
      f.setText(value ?? "");
      try { f.setFontSize(fontSize); } catch { /* ignore */ }
      try { f.updateAppearances(helv); } catch { /* ignore */ }
    } catch {
      /* field missing — ignore */
    }
  };

  // 1) Declaration name + record identifiers
  setText("I_2", data.declarationName, 10);
  setText("Record Title_2", data.recordTitle, 10);
  setText("Application Reference Number_2", data.applicationRef, 10);

  // 2) Contact details
  setText("First Name_3", data.firstName, 10);
  setText("Last Name_3", data.lastName, 10);
  setText("Organisation", data.organisation, 10);
  setText("Nationality_2", data.nationality, 10);
  setText("Email_2", data.email, 10);
  setText("Telephone_2", data.telephone, 10);

  // 3) Witness observations (large left-hand box)
  setText("witnessed being followed", data.witnessDetails, 9, true);

  // 4) Field of expertise
  setText("4 My field of expertise is", data.expertise, 9, true);

  // 5) Final measurement
  setText("5 Final measurement", data.finalMeasurement, 10);

  // 6) Location
  setText("Venue", data.venue, 10);
  setText("CityTown", data.cityTown, 10);
  setText("Country_2", data.country, 10);

  // 7) Dates & times present
  setText("include dates and times_2", data.presentDates, 9, true);

  // 8) Completion date (dd / mm / yyyy split)
  const d = splitDateParts(data.completedISO);
  setText("Date_2", d.dd, 9);
  setText("undefined_13", d.mm, 9);
  setText("undefined_14", d.yyyy, 9);

  // Refresh all appearances with a known-good font, then flatten so the
  // text renders identically in every PDF viewer.
  try { form.updateFieldAppearances(helv); } catch { /* ignore */ }
  try { form.flatten(); } catch { /* ignore */ }

  // Stamp the optional signature image on top of the flattened page, at the
  // "Sign here:" line just above the date row in section 8.
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
      // Sign-here line sits just above the date row (y≈157, immediately above
      // the dd/mm/yyyy boxes at y=144.84). Keep the image inside the section-8
      // box and scale to a sensible width.
      const targetW = 150;
      const ratio = img.height / img.width;
      page.drawImage(img, {
        x: 336,
        y: 162,
        width: targetW,
        height: targetW * ratio,
      });
    } catch {
      /* ignore — signature is optional */
    }
  }

  const out = await pdf.save();
  const ab = new ArrayBuffer(out.byteLength);
  new Uint8Array(ab).set(out);
  return new Blob([ab], { type: "application/pdf" });
}

export async function downloadFilledWitnessStatement(
  data: WitnessStatementFill,
  filename = "GWR_Witness_Statement_filled.pdf",
) {
  const blob = await fillWitnessStatementPdf(data);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
