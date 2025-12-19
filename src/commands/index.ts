import type { Command } from "commander";

import checkForFileDependencies from "src/commands/check-for-file-dependencies";
import checkLockfileVersionDiscrepancy from "src/commands/check-lockfile-version-discrepancy";
import checkVersionNumberChange from "src/commands/check-version-number-change";
import createReleaseNote from "src/commands/create-release-note";
import editEnv from "src/commands/edit-env";
import gitPostMergeCleanup from "src/commands/git-post-merge-cleanup";
import sayHello from "src/commands/say-hello";
import setReleaseStatus from "src/commands/set-release-status";
import loadCommands from "src/utils/loadCommands";

function createCommands(program: Command) {
  loadCommands(program, {
    checkForFileDependencies,
    checkLockfileVersionDiscrepancy,
    checkVersionNumberChange,
    createReleaseNote,
    editEnv,
    gitPostMergeCleanup,
    sayHello,
    setReleaseStatus,
  });
}

export default createCommands;
