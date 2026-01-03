import type { AlexCLineConfig } from "src/configs/types/AlexCLineConfig";

function defineAlexCLineConfig<ScriptName extends string = string>(
  config: AlexCLineConfig<ScriptName>,
): AlexCLineConfig<ScriptName> {
  return config;
}

export default defineAlexCLineConfig;
