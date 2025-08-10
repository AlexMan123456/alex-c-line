import type { Command } from "commander";

import checkLockfileVersionDiscrepancy from "src/commands/check-lockfile-version-discrepancy";
import gitPostMergeCleanup from "src/commands/git-post-merge-cleanup";
import sayHello from "src/commands/say-hello";

function loadCommands(program: Command) {
  sayHello(program);
  checkLockfileVersionDiscrepancy(program);
  gitPostMergeCleanup(program);
}

export default loadCommands;
