import type { AlexCLineConfig } from "./dist/configs/index";
import { scripts } from "./package.json" with { type: "json" };

const alexCLineConfig: AlexCLineConfig<keyof typeof scripts> = {
  preCommit: {
    packageManager: "pnpm",
    steps: [{ script: "build" }, { script: "format" }, { script: "lint" }, { script: "test" }],
  },
};

export default alexCLineConfig;
