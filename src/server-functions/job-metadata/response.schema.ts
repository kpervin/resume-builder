import { toJsonSchema } from "@valibot/to-json-schema";
import * as v from "valibot";

export const ResponseSchema = v.object({
  title: v.pipe(v.string(), v.minLength(3)),
  company: v.pipe(v.string(), v.minLength(1)),
  description: v.pipe(v.string(), v.minLength(20), v.maxLength(2000)),
  coverLetter: v.pipe(v.string(), v.nonEmpty()),
  location: v.object({
    fullAddress: v.string(),
    street: v.optional(v.string()),
    city: v.string(),
    province: v.string(),
    postalCode: v.optional(v.string()),
    country: v.string(),
  }),
});
export const JsonSchema = toJsonSchema(ResponseSchema);
