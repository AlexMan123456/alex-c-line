import type { PreCommitConfig } from "src/configs/PreCommitConfig";

export interface AlexCLineConfig<ScriptName extends string = string> {
  preCommit: PreCommitConfig<ScriptName>;
}
