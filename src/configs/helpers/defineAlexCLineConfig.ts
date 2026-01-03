import type { AlexCLineConfig } from "src/configs/types/AlexCLineConfig";

import { DataError, parseZodSchema } from "@alextheman/utility";
import z from "zod";

import { preCommitConfigSchema } from "src/configs/helpers/definePreCommitConfig";

const alexCLineConfigSchema = z.object({
  preCommit: preCommitConfigSchema,
});

function defineAlexCLineConfig<ScriptName extends string = string>(
  config: AlexCLineConfig<ScriptName>,
): AlexCLineConfig {
  return parseZodSchema(
    alexCLineConfigSchema,
    config,
    new DataError(
      config,
      "INVALID_ALEX_C_LINE_CONFIG",
      "The config provided does not match the expected shape.",
    ),
  );
}

export default defineAlexCLineConfig;
