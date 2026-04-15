import type { Applicant } from "@/payload-types";

export function formatMonthYear(input: string | Date | null | undefined): string {
  if (!input) return "";
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    year: "numeric",
  }).format(d);
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
