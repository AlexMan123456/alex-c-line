import type { AlexCLineConfig } from "src/configs/AlexCLineConfig";

function defineAlexCLineConfig<ScriptName extends string = string>(
  config: AlexCLineConfig<ScriptName>,
): AlexCLineConfig<ScriptName> {
  return config;
}

export default defineAlexCLineConfig;
