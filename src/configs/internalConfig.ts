import type { AlexCLineConfig } from "src/configs/types/AlexCLineConfig";

import { scripts } from "package.json" with { type: "json" };

const internalConfig: AlexCLineConfig<keyof typeof scripts> = {
  preCommit: {
    packageManager: "pnpm",
    steps: ["build", "format", "lint", "test"],
  },
};

export default internalConfig;
