import { Command } from "commander";
import { execa } from "execa";

function gitCleanup(program: Command) {
  program
    .command("git-cleanup")
    .description("Run after merging into main to quickly clean up")
    .action(async () => {
      const { stdout: currentBranch } = await execa`git branch --show-current`;
      if (currentBranch === "main") {
        console.error("❌ ERROR: Cannot run cleanup on main branch!");
        process.exitCode = 1;
        return;
      }
      await execa("git", ["checkout", "main"], { stdio: "inherit" });
      await execa("git", ["pull", "origin", "main"], { stdio: "inherit" });
      await execa("git", ["branch", "--delete", currentBranch], {
        stdio: "inherit",
      });
    });
}

export default gitCleanup;
