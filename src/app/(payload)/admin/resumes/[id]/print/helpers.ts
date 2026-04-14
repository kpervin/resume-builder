import type { Applicant } from "@/payload-types";

export function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function formatMonthYear(input: string | Date | null | undefined): string {
  if (!input) return "";
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = String(d.getFullYear());
  return `${mm}/${yyyy}`;
}

export function formatHeaderAddress(applicant: Applicant): string {
  const loc = applicant.location as Applicant["location"] | undefined;
  const parts = [loc?.postalCode, loc?.city, loc?.state, loc?.country].filter(Boolean);
  return parts.join(", ");
}

export function bestEffortNanpPhone(raw: string | null | undefined): string {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  const d = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (d.length !== 10) return raw;
  const area = d.slice(0, 3);
  const exch = d.slice(3, 6);
  const line = d.slice(6);
  return `(${area}) ${exch}-${line}`;
}
