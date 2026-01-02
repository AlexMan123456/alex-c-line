import type { PreCommitConfig } from "src/configs/PreCommitConfig";

function definePreCommitConfig<ScriptName extends string = string>(
  config: PreCommitConfig<ScriptName>,
): PreCommitConfig<ScriptName> {
  return config;
}

export default definePreCommitConfig;
