import type { VersionType } from "@alextheman/utility";
import type { Command } from "commander";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  determineVersionType,
  normaliseIndents,
  parseVersion,
  parseVersionType,
  incrementVersion,
} from "@alextheman/utility";

function createReleaseNote(program: Command) {
  program
    .command("create-release-note")
    .argument(
      "[versionType]",
      "The version type to increment by (`major|minor|patch`). Note that this performs the version calculation without changing package.json. If left blank it will use the version in package.json",
    )
    .description("Create release notes based on the current version in package.json.")
    .action(async (versionType?: VersionType) => {
      const { name, version }: { name: string; version: string } = JSON.parse(
        await readFile(path.join(process.cwd(), "package.json"), "utf-8"),
      );

      const resolvedVersion = versionType
        ? incrementVersion(parseVersion(version), parseVersionType(versionType))
        : parseVersion(version);
      const resolvedVersionType = determineVersionType(resolvedVersion);

      const releaseNoteDirectory = `docs/releases/${resolvedVersionType}`;
      const releaseNotePath = `${releaseNoteDirectory}/${resolvedVersion}.md`;
      const fullReleaseNotePath = path.join(process.cwd(), releaseNotePath);

      const releaseNoteTemplate = {
        major: normaliseIndents`
                # ${resolvedVersion} (Major Release)

                **Status**: In progress

                This is a new major release of the \`${name}\` package. It has the potential to introduce breaking changes that may require a large amount of refactoring. Please read the below description of changes and migration notes for more information.

                ## Description of Changes

                Description here

                ## Migration Notes

                Migration notes here
            `,
        minor: normaliseIndents`
                # ${resolvedVersion} (Minor Release)

                **Status**: In progress

                This is a new minor release of the \`${name}\` package. It introduces new features in a backwards-compatible way that should require very little refactoring, if any. Please read below the description of changes.

                ## Description of Changes

                Description here

                ## Additional Notes

                Additional notes here
            `,
        patch: normaliseIndents`
                # ${resolvedVersion} (Patch Release)

                **Status**: In progress

                This is a new patch release of the \`${name}\` package. It fixes issues with the package in a way that should require no refactoring. Please read below the description of changes.

                ## Description of Changes

                Description here

                ## Additional Notes

                Additional notes here
            `,
      }[resolvedVersionType];

      try {
        await mkdir(path.dirname(fullReleaseNotePath), { recursive: true });
        await writeFile(fullReleaseNotePath, releaseNoteTemplate, { flag: "wx" });
      } catch (error) {
        if (error instanceof Error && "code" in error && error.code === "EEXIST") {
          console.error("❌ ERROR: Release notes already exist.");
          process.exit(1);
        } else {
          throw error;
        }
      }
      console.info(`Release notes for ${resolvedVersion} have been created in ${releaseNotePath}`);
    });
}

export default createReleaseNote;
