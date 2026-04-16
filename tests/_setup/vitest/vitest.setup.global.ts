import { execSync } from "node:child_process";

import "../setup.env";

export async function setup() {
  execSync("docker compose -f docker-compose.test.yml up -d --wait", {
    stdio: "inherit",
  });
  execSync("pnpm payload migrate");
}

export async function teardown() {
  if (!process.env.CI) {
    execSync("docker compose -f docker-compose.test.yml down", {
      stdio: "inherit",
    });
  }
}
