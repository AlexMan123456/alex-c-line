import { kebabToCamel, normaliseIndents, VersionNumber } from "@alextheman/utility";
import { ExecaError } from "execa";
import { temporaryDirectoryTask } from "tempy";
import { describe, expect, test } from "vitest";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { createAlexCLineTestClientInDirectory } from "tests/test-clients/alex-c-line-test-client";

import getReleaseNoteTemplate from "src/utility/getReleaseNoteTemplate";
import getReleaseSummary, { getMajorReleaseSummary } from "src/utility/getReleaseSummary";

import { name, version } from "package.json" with { type: "json" };

describe("set-release-status", () => {
  test("Takes a file path to a valid release note and sets the status to released", async () => {
    await temporaryDirectoryTask(async (temporaryPath) => {
      const alexCLineTestClient = createAlexCLineTestClientInDirectory(temporaryPath);
      const versionNumber = new VersionNumber(version);

      await writeFile(
        path.join(temporaryPath, "package.json"),
        JSON.stringify({
          name,
          version,
        }),
      );

      const { exitCode: createReleaseNoteExitCode } =
        await alexCLineTestClient("create-release-note");
      expect(createReleaseNoteExitCode).toBe(0);

      const fileContentsBeforeWrite = await readFile(
        path.join(temporaryPath, `docs/releases/${versionNumber.type}/v${version}.md`),
        "utf-8",
      );
      expect(fileContentsBeforeWrite).toContain(`v${version}`);
      expect(fileContentsBeforeWrite).toContain("**Status**: In progress");

      const { exitCode: setReleaseStatusExitCode } = await alexCLineTestClient(
        "set-release-status",
        [`docs/releases/${versionNumber.type}/v${version}.md`],
      );
      expect(setReleaseStatusExitCode).toBe(0);

      const fileContentsAfterWrite = await readFile(
        path.join(temporaryPath, `docs/releases/${versionNumber.type}/v${version}.md`),
        "utf-8",
      );
      expect(fileContentsAfterWrite).toContain("**Status**: Released");
    });
  });

  test("Only replaces the first occurrence of the status", async () => {
    await temporaryDirectoryTask(async (temporaryPath) => {
      const alexCLineTestClient = createAlexCLineTestClientInDirectory(temporaryPath);
      const versionType = new VersionNumber(version).type;
      const documentPath = `docs/releases/${versionType}/v${version}.md`;

      await writeFile(
        path.join(temporaryPath, "package.json"),
        JSON.stringify({
          name,
          version,
        }),
      );

      await mkdir(path.dirname(path.join(temporaryPath, documentPath)), { recursive: true });
      await writeFile(
        path.join(temporaryPath, documentPath),
        getReleaseNoteTemplate(name, new VersionNumber(version), "In progress", {
          descriptionOfChanges: "**Status**: In progress",
        }),
      );

      const { exitCode } = await alexCLineTestClient("set-release-status", [documentPath]);
      expect(exitCode).toBe(0);

      const fileContentsAfterWrite = await readFile(
        path.join(temporaryPath, `docs/releases/${versionType}/v${version}.md`),
        "utf-8",
      );
      expect(
        fileContentsAfterWrite.startsWith(normaliseIndents`
            # v${version} (${kebabToCamel(versionType, { startWithUpper: true })} Release)

            **Status**: Released
        `),
      ).toBe(true);
      expect(fileContentsAfterWrite).toContain("**Status**: In progress");
    });
  });

  test.each([
    ["Completely invalid", "hello"],
    [
      "Has version title but not status",
      normaliseIndents`
            # v${version} (${kebabToCamel(new VersionNumber(version).type, { startWithUpper: true })} Release)
        `,
    ],
    [
      "Has version title and status, but status is not in progress",
      normaliseIndents`
            # v${version} (${kebabToCamel(new VersionNumber(version).type, { startWithUpper: true })} Release)

            **Status**: Invalid
        `,
    ],
    [
      "Has version, title and status, but summary is invalid",
      normaliseIndents`
        # v${version} (${kebabToCamel(new VersionNumber(version).type, { startWithUpper: true })} Release)

        **Status**: In progress

        Invalid summary (is generally automatically generated and should not be edited)
    `,
    ],
    [
      "Has version title, status, and valid summary, but no description of changes",
      normaliseIndents`
        # v${version} (${kebabToCamel(new VersionNumber(version).type, { startWithUpper: true })} Release)

        **Status**: In progress

        ${getReleaseSummary(name, new VersionNumber(version))}
    `,
    ],
    [
      "Has version title, status, valid summary, description of changes, but is a major release and has no migration notes",
      normaliseIndents`
        # v2.0.0 (Major Release)

        **Status**: In progress

        ${getMajorReleaseSummary(name)}

        ## Description of Changes

        These are breaking changes. Figure out how to fix them yourself.
    `,
    ],
  ])("Does not operate on invalid markdown (%s)", async (_: string, documentContents: string) => {
    await temporaryDirectoryTask(async (temporaryPath) => {
      const alexCLineTestClient = createAlexCLineTestClientInDirectory(temporaryPath);
      const versionType = new VersionNumber(version).type;
      const documentPath = `docs/releases/${versionType}/v${version}.md`;

      await writeFile(
        path.join(temporaryPath, "package.json"),
        JSON.stringify({
          name,
          version,
        }),
      );

      await mkdir(path.dirname(path.join(temporaryPath, documentPath)), { recursive: true });
      await writeFile(path.join(temporaryPath, documentPath), documentContents);

      try {
        await alexCLineTestClient("set-release-status", [documentPath]);
        throw new Error("DID_NOT_THROW");
      } catch (error) {
        if (error instanceof ExecaError) {
          const { stderr: errorMessage, exitCode } = error;
          expect(exitCode).toBe(1);
          expect(errorMessage).toBe(
            "❌ ERROR: Document does not match a valid release note template.",
          );
        } else {
          throw error;
        }
      }
    });
  });
});
