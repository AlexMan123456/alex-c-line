import { Command } from "commander";
import checkLockfileVersionDiscrepancy from "src/commands/check-lockfile-version-discrepancy";
import gitCleanup from "src/commands/git-post-merge-cleanup";
import sayHello from "src/commands/say-hello";

function loadCommands(program: Command) {
  sayHello(program);
  checkLockfileVersionDiscrepancy(program);
  gitCleanup(program);
}

export default loadCommands;
