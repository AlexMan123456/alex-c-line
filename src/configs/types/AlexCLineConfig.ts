import type { PreCommitConfig } from "src/configs/types/PreCommitConfig";

export interface AlexCLineConfig<ScriptName extends string = string> {
  preCommit: PreCommitConfig<ScriptName>;
}
