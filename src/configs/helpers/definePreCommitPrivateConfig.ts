import type { PreCommitPrivateConfig } from "src/configs/types/PreCommitPrivateConfig";

import { DataError, parseZodSchema } from "@alextheman/utility";
import z from "zod";

export const preCommitPrivateConfigSchema = z.object({
  disableSteps: z.array(z.string()).optional(),
});

function definePreCommitPrivateConfig<ScriptName extends string = string>(
  config: PreCommitPrivateConfig<ScriptName>,
): PreCommitPrivateConfig {
  return parseZodSchema(
    preCommitPrivateConfigSchema,
    config,
    new DataError(
      config,
      "INVALID_PRE_COMMIT_PRIVATE_CONFIG",
      "The config provided does not match the expected shape.",
    ),
  );
}

export default definePreCommitPrivateConfig;
