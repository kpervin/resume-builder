import { execSync } from "child_process";

export default async function globalSetup() {
  console.log("Spinning up Docker Compose...");
  execSync("pnpm -w exec docker compose -f docker-compose.test.yml up -d --wait", {
    stdio: "inherit",
  });
}
