import { Command } from "commander";
import { execa, ExecaError } from "execa";

interface Options {
  rebase?: boolean;
}

function gitCleanup(program: Command) {
  program
    .command("git-cleanup")
    .description("Run after merging into main to quickly clean up")
    .option("--rebase", "Enable if your repository mainly rebases into main")
    .action(async ({ rebase }: Options) => {
      const { stdout: currentBranch } = await execa`git branch --show-current`;
      if (currentBranch === "main") {
        console.error("❌ ERROR: Cannot run cleanup on main branch!");
        process.exitCode = 1;
        return;
      }
      if (rebase) {
        await execa("git", ["fetch", "origin", "main"], { stdio: "inherit" });
        await execa("git", ["pull", "origin", "main"], { stdio: "inherit" });
      }
      await execa("git", ["checkout", "main"], { stdio: "inherit" });
      await execa("git", ["pull", "origin", "main"], { stdio: "inherit" });
      if (rebase) {
        const { stdout: changes } =
          await execa`git diff main..${currentBranch}`;
        if (changes) {
          console.error("❌ ERROR: Changes on branch not fully merged!");
          await execa`git checkout ${currentBranch}`;
          process.exit(1);
        }
        await execa("git", ["fetch", "--prune"], { stdio: "inherit" });
        await execa("git", ["branch", "-D", currentBranch], {
          stdio: "inherit",
        });
      } else {
        try {
          await execa("git", ["branch", "--delete", currentBranch], {
            stdio: "inherit",
          });
        } catch (error: unknown) {
          if (error instanceof ExecaError) {
            console.error("❌ ERROR: Changes on branch not fully merged!");
            await execa`git checkout ${currentBranch}`;
            process.exitCode = 1;
          }
          throw error;
        }
      }
    });
}

export default gitCleanup;
