/** Oman mobile-style national numbers: 8 digits starting with 7 or 9 (after country code 968). */

export function normalizeOmaniPhoneE164(input) {
  const raw = String(input ?? "")
    .trim()
    .replace(/[\s\-().]/g, "")
    .replace(/^\+/, "");
  let d = raw;
  if (d.startsWith("00968")) d = d.slice(5);
  else if (d.startsWith("968")) d = d.slice(3);
  if (!/^[79]\d{7}$/.test(d)) return null;
  return `968${d}`;
}

export function formatOmaniPhoneDisplay(stored) {
  const e164 = normalizeOmaniPhoneE164(stored);
  if (!e164) return String(stored ?? "");
  const d = e164.slice(3);
  return `+968 ${d.slice(0, 4)} ${d.slice(4)}`;
}
