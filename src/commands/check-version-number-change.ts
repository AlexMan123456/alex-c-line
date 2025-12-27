import type { Command } from "commander";

import { normaliseIndents } from "@alextheman/utility";
import { execa } from "execa";

import { readFile } from "node:fs/promises";
import path from "node:path";

import { execaNoFail } from "src/utils/execa-helpers";

function checkVersionNumberChange(program: Command) {
  program
    .command("check-version-number-change")
    .description(
      "Check that version number on branch has changed if source code differs between main and current branch",
    )
    .action(async () => {
      console.info("Checking for version change...");

      const { exitCode } = await execaNoFail("git", [
        "diff",
        "origin/main...HEAD",
        "--quiet",
        "src/*",
      ]);
      if (exitCode === 0) {
        console.info("No source code changes found. Version does not need changing.");
        return;
      }

      const { stdout: packageContents } = await execa`git show origin/main:package.json`;
      const { version: mainPackageVersion } = JSON.parse(packageContents);
      const { version: currentBranchPackageVersion } = JSON.parse(
        await readFile(path.resolve(process.cwd(), "package.json"), "utf-8"),
      );

      const [currentBranchMajor, currentBranchMinor, currentBranchPatch] =
        currentBranchPackageVersion.split(".");

      const newMajorVersion = `${parseInt(currentBranchMajor) + 1}.0.0`;
      const newMinorVersion = `${currentBranchMajor}.${parseInt(currentBranchMinor) + 1}.0`;
      const newPatchVersion = `${currentBranchMajor}.${currentBranchMinor}.${parseInt(currentBranchPatch) + 1}`;

      if (mainPackageVersion === currentBranchPackageVersion) {
        program.error(
          normaliseIndents`
            ❌ Version needs updating. Please run one of the following:
            - npm version major -m "Change version number to v%s" (v${mainPackageVersion} -> v${newMajorVersion})
            - npm version minor -m "Change version number to v%s" (v${mainPackageVersion} -> v${newMinorVersion})
            - npm version patch -m "Change version number to v%s" (v${mainPackageVersion} -> v${newPatchVersion})
          `,
          { exitCode: 1, code: "VERSION_NEEDS_UPDATING" },
        );
      }

      console.info("Version has been updated!");
    });
}

export default checkVersionNumberChange;
