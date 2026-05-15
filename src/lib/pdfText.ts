/**
 * Sanitize a string for the WinAnsi-encoded standard fonts (Helvetica et al).
 * pdf-lib throws if any character is outside WinAnsi — map common Unicode
 * punctuation to ASCII equivalents and drop anything else.
 */
const REPLACEMENTS: Array<[RegExp, string]> = [
  [/[→➜➡]/g, "->"],   // → ➜ ➡
  [/[←]/g, "<-"],               // ←
  [/[↔]/g, "<->"],              // ↔
  [/[–—]/g, "-"],          // – —  (en/em dash)
  [/[‘’]/g, "'"],          // ‘ ’
  [/[“”]/g, '"'],          // “ ”
  [/[•]/g, "*"],                // •
  [/[…]/g, "..."],              // …
  [/[ ]/g, " "],                // nbsp
  [/[   ]/g, " "],    // thin/hair spaces
  [/[✕✖✗✘]/g, "x"],
];

export function toWinAnsi(input: string | undefined | null): string {
  if (!input) return "";
  let s = String(input);
  for (const [re, rep] of REPLACEMENTS) s = s.replace(re, rep);
  // Strip anything still outside WinAnsi's printable range (0x20-0x7E plus
  // newline/tab, and 0xA0-0xFF). Replace stragglers with "?".
  return s.replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, "?");
}
