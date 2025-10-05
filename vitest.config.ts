import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    setupFiles: ["/tests/setup.ts"],
    environment: "node",
    include: ["**/tests/**/*.test.ts"],
  },
});
