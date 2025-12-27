import type { VersionType } from "@alextheman/utility";
import type { Command } from "commander";

import { parseVersionType, VersionNumber } from "@alextheman/utility";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import getReleaseNoteTemplate from "src/utils/getReleaseNoteTemplate";

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

      const versionNumber = versionType
        ? new VersionNumber(version).increment(parseVersionType(versionType))
        : new VersionNumber(version);
      const resolvedVersionType = versionNumber.type;

      const releaseNoteDirectory = `docs/releases/${resolvedVersionType}`;
      const releaseNotePath = `${releaseNoteDirectory}/${versionNumber}.md`;
      const fullReleaseNotePath = path.join(process.cwd(), releaseNotePath);

      const releaseNoteTemplate = getReleaseNoteTemplate(name, versionNumber, "In progress");

      try {
        await mkdir(path.dirname(fullReleaseNotePath), { recursive: true });
        await writeFile(fullReleaseNotePath, releaseNoteTemplate, { flag: "wx" });
      } catch (error) {
        if (error instanceof Error && "code" in error && error.code === "EEXIST") {
          program.error("❌ ERROR: Release notes already exist.", {
            exitCode: 1,
            code: "RELEASE_NOTE_EXISTS",
          });
        } else {
          throw error;
        }
      }
      console.info(`Release notes for ${versionNumber} have been created in ${releaseNotePath}`);
    });
}

export default createReleaseNote;
