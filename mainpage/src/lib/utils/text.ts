/**
 * Truncate text at the last word boundary before maxChars.
 * Returns the original text if it's already short enough.
 * Appends "…" to indicate truncation.
 */
export function truncateAtWord(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars).replace(/\s+\S*$/, "").trimEnd() + "…";
}
