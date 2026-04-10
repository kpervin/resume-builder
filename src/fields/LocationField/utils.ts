import { Location } from "@/payload-types";

type LocationParts = Omit<Location, "search">;

type ValidKey = keyof LocationParts;

/**
 * Extracts the word after the $ to show a clean error message
 */
type ExtractWord<T extends string> =
  T extends `${infer Word}${"," | " " | "." | "-" | "\n"}${string}` ? Word : T;

/**
 * Recursively validates the string.
 * Returns "VALID" sentinel if okay, otherwise returns an Error String.
 */
export type ValidateTemplate<T extends string> = T extends `${string}$${infer Rest}`
  ? Rest extends `${ValidKey}${infer Post}`
    ? ValidateTemplate<Post>
    : `ERROR: '$${ExtractWord<Rest>}' is not a valid key. (Expected: ${ValidKey})`
  : true;

/**
 * Identity function with high-fidelity validation.
 */
export function defineLocationTemplate<T extends string>(
  template: T & (ValidateTemplate<T> extends true ? unknown : ValidateTemplate<T>),
): T {
  return template;
}

export function parseLocationTemplate(template: string, parts: Partial<LocationParts>): string {
  const result = template.replace(/\$(\w+)/g, (_, key: ValidKey) => {
    return parts[key] || "";
  });

  return result
    .replace(/,\s*,/g, ",")
    .replace(/^[\s,.\-]+|[\s,.\-]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
