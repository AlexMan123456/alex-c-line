import { defineConfig } from "tsdown";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    clean: true,
    fixedExtension: false,
  },
  {
    entry: ["src/configs/index.ts"],
    outDir: "dist/configs",
    format: ["esm", "cjs"],
    dts: true,
    clean: true,
    fixedExtension: false,
  },
]);
