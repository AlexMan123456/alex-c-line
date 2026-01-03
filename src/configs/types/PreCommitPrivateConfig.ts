export interface PreCommitPrivateConfig<ScriptName extends string = string> {
  /** List of script names to skip */
  disableSteps?: ScriptName[];
}
