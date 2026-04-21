import { execSync } from "node:child_process";

import config from "@payload-config";
import { getPayload } from "payload";

process.env.COMPOSE_PROJECT_NAME = "resume-builder-vitest";

export async function setup() {
  execSync("pnpm docker:up", {
    stdio: "inherit",
  });
  /**
   * We are going to get a timeout regardless for the time being until
   * https://github.com/payloadcms/payload/issues/15674 is resolved
   */
  await getPayload({
    config,
    onInit: async (payload) => {
      payload.db.pool.on("error", (err) => {
        console.error("Unexpected error on idle client", err);
        process.exit(0);
      });
      await payload.destroy();
    },
  });
}

export async function teardown() {
  execSync("pnpm docker:cleanup", {
    stdio: "inherit",
  });
}
