import { createEnv } from "@t3-oss/env-nextjs";
import { config } from "dotenv";
import * as v from "valibot";

let configPaths = [".env.local", ".env"];
switch (process.env.NODE_ENV) {
  case "development":
    configPaths = [".env.development.local", ".env.development", ...configPaths];
    break;
  case "test":
    configPaths = [".env.test.local", ".env.test", ...configPaths];
    break;
  case "production":
    configPaths = [".env.production.local", ".env.production", ...configPaths];
    break;
}
config({ path: configPaths });

export const env = createEnv({
  server: {
    FLARESOLVERR_URL: v.pipe(v.string(), v.url()),
    GEMINI_API_KEY: v.pipe(v.string(), v.startsWith("AI")),
    DATABASE_URL: v.pipe(v.string(), v.url(), v.startsWith("postgresql://")),
    PAYLOAD_SECRET: v.string(),
  },
  client: {
    NEXT_PUBLIC_SITE_URL: v.optional(v.pipe(v.string(), v.url())),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
  isServer: typeof window === "undefined" || process.env.NODE_ENV === "test",
});
