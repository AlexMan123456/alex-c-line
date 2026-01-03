import type { AlexCLineConfig } from "src/configs/types/AlexCLineConfig";

import { scripts } from "package.json" with { type: "json" };

const internalConfig: AlexCLineConfig<keyof typeof scripts> = {
  preCommit: {
    packageManager: "pnpm",
    steps: ["format", "lint", "test"],
  },
};

export default internalConfig;
