import { Command } from "commander";
import { execa } from "execa";

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
      await execa("git", ["checkout", "main"], { stdio: "inherit" });
      await execa("git", ["pull", "origin", "main"], { stdio: "inherit" });
      if (rebase) {
        const { stdout: branches } = await execa`git branch -r`;
        const branchExists = branches.includes(`origin/${currentBranch}`);
        if (branchExists) {
          console.error("❌ ERROR: Changes on branch not fully merged!");
          process.exitCode = 1;
          return;
        }
        await execa("git", ["fetch", "--prune"], { stdio: "inherit" });
        await execa("git", ["branch", "-D", currentBranch], {
          stdio: "inherit",
        });
      } else {
        await execa("git", ["branch", "--delete", currentBranch], {
          stdio: "inherit",
        });
      }
    });
}

export default gitCleanup;
