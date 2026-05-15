import { PDFDocument, StandardFonts } from "pdf-lib";
import { toWinAnsi } from "./pdfText";

/**
 * The official GWR Time Keeper Statement Template 2022 ships with AcroForm
 * fields. Field names mirror the Witness Statement template but with the
 * `_3` / `_15` / `_16` suffixes Adobe Acrobat assigns when the same boilerplate
 * is re-used. We fill them directly with setText and flatten.
 */
export interface TimekeeperStatementFill {
  declarationName: string;
  recordTitle: string;
  applicationRef: string;
  firstName: string;
  lastName: string;
  organisation: string;
  nationality: string;
  email: string;
  telephone: string;
  /** 3) describe your role & timing equipment */
  roleAndEquipment: string;
  /** 4) timekeeping expertise */
  expertise: string;
  /** 5) final measurement */
  finalMeasurement: string;
  venue: string;
  cityTown: string;
  country: string;
  presentDates: string;
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

export async function fillTimekeeperStatementPdf(
  data: TimekeeperStatementFill,
  templateUrl = "/timekeeper-statement-template-2022.pdf",
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
      f.setText(toWinAnsi(value));
      try { f.setFontSize(fontSize); } catch { /* ignore */ }
      try { f.updateAppearances(helv); } catch { /* ignore */ }
    } catch {
      /* field missing — ignore */
    }
  };

  setText("I_3", data.declarationName, 10);
  setText("Record Title_3", data.recordTitle, 10);
  setText("Application Reference Number_3", data.applicationRef, 10);

  setText("First Name_4", data.firstName, 10);
  setText("Last Name_4", data.lastName, 10);
  setText("Organisation_2", data.organisation, 10);
  setText("Nationality_3", data.nationality, 10);
  setText("Email_3", data.email, 10);
  setText("Telephone_3", data.telephone, 10);

  setText("the equipment you used to time the attempt", data.roleAndEquipment, 9, true);
  setText("4 My expertise in timekeeping is", data.expertise, 9, true);
  setText("5 Final measurement_2", data.finalMeasurement, 10);

  setText("Venue_2", data.venue, 10);
  setText("CityTown_2", data.cityTown, 10);
  setText("Country_3", data.country, 10);

  setText("include dates and times_3", data.presentDates, 9, true);

  const d = splitDateParts(data.completedISO);
  setText("Date_3", d.dd, 9);
  setText("undefined_15", d.mm, 9);
  setText("undefined_16", d.yyyy, 9);

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
      const targetW = 150;
      const ratio = img.height / img.width;
      page.drawImage(img, { x: 336, y: 162, width: targetW, height: targetW * ratio });
    } catch {
      /* signature is optional */
    }
  }

  const out = await pdf.save();
  const ab = new ArrayBuffer(out.byteLength);
  new Uint8Array(ab).set(out);
  return new Blob([ab], { type: "application/pdf" });
}

export async function downloadFilledTimekeeperStatement(
  data: TimekeeperStatementFill,
  filename = "GWR_Timekeeper_Statement_filled.pdf",
) {
  const blob = await fillTimekeeperStatementPdf(data);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
