import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

import "./tests/_setup/setup.env";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    setupFiles: [import.meta.resolve("./tests/_setup/vitest/vitest.setup.ts")],
    globalSetup: [import.meta.resolve("./tests/_setup/vitest/vitest.setup.global.ts")],
    include: ["tests/int/**/*.int.spec.ts"],
  },
});
