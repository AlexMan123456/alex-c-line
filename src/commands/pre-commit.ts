import type { Command } from "commander";

import { execaNoFail } from "src/utility/execa-helpers";

interface PreCommitOptions {
  build?: boolean;
  tests?: boolean;
}

function preCommit(program: Command) {
  program
    .command("pre-commit")
    .description("Run the standard pre-commits used across all my repositories.")
    .option("--no-build", "Skip the build")
    .option("--no-tests", "Skip the tests")
    .action(async ({ build: shouldIncludeBuild, tests: shouldIncludeTests }: PreCommitOptions) => {
      const { exitCode: diffExitCode } = await execaNoFail("git", ["diff", "--cached", "--quiet"]);

      switch (diffExitCode) {
        case 128:
          program.error("Not currently in a Git repository", {
            exitCode: 1,
            code: "GIT_DIFF_FAILED",
          });
        // program.error() will throw an error and stop the program, so it is redundant to include a break here.
        // eslint-disable-next-line no-fallthrough
        case 0:
          console.info("No staged changes found.");
          return;
      }

      async function runCommandAndLogToConsole(command: string, args?: string[] | undefined) {
        const result = await execaNoFail(command, args, { stdio: "inherit" });

        if (result.exitCode !== 0) {
          program.error(`Command failed: ${command}${args?.length ? ` ${args.join(" ")}` : ""}`, {
            exitCode: result.exitCode ?? 1,
            code: "PRE_COMMIT_FAILED",
          });
        }

        return result;
      }

      if (shouldIncludeBuild) {
        await runCommandAndLogToConsole("pnpm", ["run", "build"]);
      }
      await runCommandAndLogToConsole("pnpm", ["run", "format"]);
      await runCommandAndLogToConsole("pnpm", ["run", "lint"]);
      if (shouldIncludeTests) {
        await runCommandAndLogToConsole("pnpm", ["test"]);
      }

      await execaNoFail("git", ["update-index", "--again"]);
    });
}

export default preCommit;
