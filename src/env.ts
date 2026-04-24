import { createEnv } from "@t3-oss/env-nextjs";
import * as v from "valibot";

export const env = createEnv({
  server: {
    FLARESOLVERR_URL: v.pipe(v.string(), v.url()),
    GEMINI_API_KEY: v.pipe(v.string(), v.startsWith("AI")),
    DATABASE_URL: v.pipe(v.string(), v.url(), v.startsWith("postgresql://")),
    PAYLOAD_SECRET: v.string(),
    GOOGLE_MAPS_API_KEY: v.optional(v.pipe(v.string(), v.startsWith("AI"))),
  },
  client: {
    NEXT_PUBLIC_SITE_URL: v.optional(v.pipe(v.string(), v.url())),
    NEXT_PUBLIC_GOOGLE_MAPS_API_ENABLED: v.boolean(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_GOOGLE_MAPS_API_ENABLED: !!process.env.GOOGLE_MAPS_API_KEY,
  },
  isServer: typeof window === "undefined" || process.env.NODE_ENV === "test",
});
