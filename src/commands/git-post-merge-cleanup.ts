import type { Command } from "commander";

import { execa, ExecaError } from "execa";

import { readFile } from "fs/promises";
import os from "os";
import path from "path";

import { createExecaClientWithDefaultOptions } from "src/utils/execa-helpers";

interface Options {
  rebase?: boolean;
}

function gitPostMergeCleanup(program: Command) {
  program
    .command("git-post-merge-cleanup")
    .alias("git-cleanup")
    .description("Run after merging into main to quickly clean up")
    .option("--rebase", "Enable if your repository mainly rebases into main")
    .action(async ({ rebase: rebaseOption }: Options) => {
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
      if (currentBranch === "main") {
        console.error("❌ ERROR: Cannot run cleanup on main branch!");
        process.exitCode = 1;
        return;
      }
      const runCommandAndLogToConsole = createExecaClientWithDefaultOptions({
        stdio: "inherit",
      });

      if (rebase) {
        await runCommandAndLogToConsole("git", ["fetch", "origin", "main"]);
        await runCommandAndLogToConsole("git", ["pull", "origin", "main"]);
      }
      await runCommandAndLogToConsole("git", ["checkout", "main"]);
      await runCommandAndLogToConsole("git", ["pull", "origin", "main"]);
      await runCommandAndLogToConsole("git", ["fetch", "--prune"]);
      if (rebase) {
        const { stdout: changes } = await execa`git diff main..${currentBranch}`;
        if (changes) {
          console.error("❌ ERROR: Changes on branch not fully merged!");
          await execa`git checkout ${currentBranch}`;
          process.exit(1);
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
            console.error("❌ ERROR: Changes on branch not fully merged!");
            await execa`git checkout ${currentBranch}`;
            process.exit(1);
          }
          throw error;
        }
      }
    });
}

export default gitPostMergeCleanup;
