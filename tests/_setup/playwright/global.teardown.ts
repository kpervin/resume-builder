import { execSync } from "child_process";

export default async function globalTeardown() {
  console.log("Shutting down Docker...");
  execSync(
    "pnpm -w exec docker compose -f docker-compose.test.yml down --volumes --remove-orphans",
    {
      stdio: "inherit",
    },
  );
}
