/**
 * Formats a RUT string for display: "123456789" → "12.345.678-9"
 * Accepts partial input (while typing) and returns the formatted version.
 */
export function formatRut(value: string): string {
  const clean = value.replace(/[^0-9kK]/g, "").toUpperCase();
  if (!clean) return "";

  if (clean.length === 1) return clean;

  const body = clean.slice(0, -1);
  const verifier = clean.slice(-1);
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${formatted}-${verifier}`;
}

/**
 * Strips dots from a formatted RUT for storage: "12.345.678-9" → "12345678-9"
 */
export function cleanRut(value: string): string {
  return value.replace(/\./g, "").toUpperCase();
}
