import type { PreCommitPrivateConfig } from "src/configs/PreCommitConfig";

function definePreCommitPrivateConfig<ScriptName extends string = string>(
  config: PreCommitPrivateConfig<ScriptName>,
): PreCommitPrivateConfig<ScriptName> {
  return config;
}

export default definePreCommitPrivateConfig;
