import type { Command } from "commander";

import { execa, ExecaError } from "execa";

import { readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { createExecaClientWithDefaultOptions } from "src/utility/execa-helpers";

interface Options {
  rebase?: boolean;
}

function gitPostMergeCleanup(program: Command) {
  program
    .command("git-post-merge-cleanup")
    .alias("git-cleanup")
    .description("Run after merging into a given branch to quickly clean up")
    .argument("[branch]", "The branch you want to merge into", "main")
    .option("--rebase", "Enable if your repository mainly rebases into main")
    .action(async (branch: string, { rebase: rebaseOption }: Options) => {
      let alexCLineConfigJSON;
      try {
        alexCLineConfigJSON = await readFile(
          path.join(process.env.HOME ?? os.homedir(), "alex-c-line-config.json"),
          "utf-8",
        );
      } catch {
        // If the file doesn't exist, we don't want to throw an error!
      }
      if (!alexCLineConfigJSON) {
        alexCLineConfigJSON = "{}";
      }
      const alexCLineConfig = JSON.parse(alexCLineConfigJSON);
      const rebase = alexCLineConfig["git-post-merge-cleanup"]?.rebase ?? rebaseOption;
      console.info(`Running git-post-merge-cleanup in ${rebase ? "rebase" : "merge"} mode...`);

      const { stdout: currentBranch } = await execa`git branch --show-current`;
      if (currentBranch === branch) {
        program.error(`❌ ERROR: Cannot run cleanup on ${branch} branch!`, {
          exitCode: 1,
          code: "INVALID_BRANCH",
        });
      }
      const runCommandAndLogToConsole = createExecaClientWithDefaultOptions({
        stdio: "inherit",
      });

      if (rebase) {
        await runCommandAndLogToConsole("git", ["fetch", "origin", branch]);
        await runCommandAndLogToConsole("git", ["pull", "origin", branch]);
      }
      await runCommandAndLogToConsole("git", ["checkout", branch]);
      await runCommandAndLogToConsole("git", ["pull", "origin", branch]);
      await runCommandAndLogToConsole("git", ["fetch", "--prune"]);
      if (rebase) {
        const { stdout: changes } = await execa`git diff ${branch}..${currentBranch}`;
        if (changes) {
          await execa`git checkout ${currentBranch}`;
          program.error("❌ ERROR: Changes on branch not fully merged!", {
            exitCode: 1,
            code: "CHANGES_NOT_MERGED",
          });
        }
        await runCommandAndLogToConsole("git", ["branch", "-D", currentBranch]);
      } else {
        try {
          /* This is needed so that if the command errors, it doesn't log the error to the console
          and we instead print my own error message. But if it succeeds, we do log the message. */
          const { stdout: branchDeletedMessage } =
            await execa`git branch --delete ${currentBranch}`;
          console.info(branchDeletedMessage);
        } catch (error: unknown) {
          if (error instanceof ExecaError) {
            await execa`git checkout ${currentBranch}`;
            program.error("❌ ERROR: Changes on branch not fully merged!", {
              exitCode: 1,
              code: "CHANGES_NOT_MERGED",
            });
          } else {
            throw error;
          }
        }
      }
    });
}

export default gitPostMergeCleanup;
