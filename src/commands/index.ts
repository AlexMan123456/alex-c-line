import type { Command } from "commander";

import checkForFileDependencies from "src/commands/check-for-file-dependencies";
import checkLockfileVersionDiscrepancy from "src/commands/check-lockfile-version-discrepancy";
import checkVersionNumberChange from "src/commands/check-version-number-change";
import createPullRequestTemplates from "src/commands/create-pull-request-templates";
import createReleaseNote from "src/commands/create-release-note";
import editEnv from "src/commands/edit-env";
import getVersionType from "src/commands/get-version-type";
import gitPostMergeCleanup from "src/commands/git-post-merge-cleanup";
import incrementVersion from "src/commands/increment-version";
import preCommit from "src/commands/pre-commit";
import sayHello from "src/commands/say-hello";
import setReleaseStatus from "src/commands/set-release-status";
import loadCommands from "src/utility/loadCommands";

function createCommands(program: Command) {
  loadCommands(program, {
    checkForFileDependencies,
    checkLockfileVersionDiscrepancy,
    checkVersionNumberChange,
    createPullRequestTemplates,
    createReleaseNote,
    editEnv,
    getVersionType,
    gitPostMergeCleanup,
    incrementVersion,
    preCommit,
    sayHello,
    setReleaseStatus,
  });
}

export default createCommands;
