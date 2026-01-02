/** The packages explicitly supported by the `pre-commit` command as of now. */
export type PackageManager = "npm" | "pnpm";

export interface PreCommitStep<ScriptName extends string = string> {
  /** The script name in package.json. */
  script: ScriptName;
  /** Arguments to pass to the given script */
  arguments?: string[];
}

export interface PreCommitConfig<ScriptName extends string = string> {
  /** The name of the package manager being used (can choose from `npm` or `pnpm`). If not provided, can be inferred from the packageManager field in package.json. */
  packageManager?: PackageManager;
  /** Allow the hook to run even if there are no staged changes. */
  allowNoStagedChanges?: boolean;
  /** The steps to run in the pre-commit hook. */
  steps: PreCommitStep<ScriptName>[];
}

export interface PreCommitPrivateConfig<ScriptName extends string = string> {
  /** List of script names to skip */
  disableSteps?: ScriptName[];
}
