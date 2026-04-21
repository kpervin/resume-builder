import { execSync } from "node:child_process";

import config from "@payload-config";
import { getPayload } from "payload";

import "../setup.env";

export async function setup() {
  execSync("pnpm docker:up", {
    stdio: "inherit",
  });
  /**
   * We are going to get a timeout regardless for the time being until
   * https://github.com/payloadcms/payload/issues/15674 is resolved
   */
  const payload = await getPayload({ config });
  await payload.db.destroy?.();
}

export async function teardown() {
  if (!process.env.CI) {
    execSync("pnpm docker:down", {
      stdio: "inherit",
    });
  }
}
