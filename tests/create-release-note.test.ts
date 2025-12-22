import { VersionNumber } from "@alextheman/utility";
import { ExecaError } from "execa";
import { temporaryDirectoryTask } from "tempy";
import { describe, expect, test } from "vitest";

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { createAlexCLineTestClientInDirectory } from "tests/test-clients/alex-c-line-test-client";

import { name, version } from "package.json" with { type: "json" };

describe("create-release-notes", () => {
  test("The resulting release notes at least has the version number and description of changes", async () => {
    await temporaryDirectoryTask(async (temporaryPath) => {
      const alexCLineTestClient = createAlexCLineTestClientInDirectory(temporaryPath);
      const versionType = new VersionNumber(version).type;

      await writeFile(
        path.join(temporaryPath, "package.json"),
        JSON.stringify({
          name,
          version,
        }),
      );

      const { exitCode } = await alexCLineTestClient("create-release-note");

      expect(exitCode).toBe(0);
      const fileContents = await readFile(
        path.join(temporaryPath, `docs/releases/${versionType}/v${version}.md`),
        "utf-8",
      );
      expect(fileContents).toContain(`v${version}`);
      expect(fileContents).toContain(`## Description of Changes`);
    });
  });
  test("A major version change is contained in docs/releases/major/vX.Y.Z.md and must have migration notes", async () => {
    await temporaryDirectoryTask(async (temporaryPath) => {
      const alexCLineTestClient = createAlexCLineTestClientInDirectory(temporaryPath);
      await writeFile(
        path.join(temporaryPath, "package.json"),
        JSON.stringify({
          name,
          version: "v2.0.0",
        }),
      );

      const { exitCode } = await alexCLineTestClient("create-release-note");
      expect(exitCode).toBe(0);
      const fileContents = await readFile(
        path.join(temporaryPath, `docs/releases/major/v2.0.0.md`),
        "utf-8",
      );

      expect(fileContents).toContain("# v2.0.0 (Major Release)");
      expect(fileContents).toContain("## Migration Notes");
    });
  });
  test("A minor version change is contained in docs/releases/minor/vX.Y.Z.", async () => {
    await temporaryDirectoryTask(async (temporaryPath) => {
      const alexCLineTestClient = createAlexCLineTestClientInDirectory(temporaryPath);
      await writeFile(
        path.join(temporaryPath, "package.json"),
        JSON.stringify({
          name,
          version: "v1.2.0",
        }),
      );

      const { exitCode } = await alexCLineTestClient("create-release-note");
      expect(exitCode).toBe(0);
      const fileContents = await readFile(
        path.join(temporaryPath, `docs/releases/minor/v1.2.0.md`),
        "utf-8",
      );

      expect(fileContents).toContain("# v1.2.0 (Minor Release)");
    });
  });
  test("A patch version change is contained in docs/releases/patch/vX.Y.Z.", async () => {
    await temporaryDirectoryTask(async (temporaryPath) => {
      const alexCLineTestClient = createAlexCLineTestClientInDirectory(temporaryPath);
      await writeFile(
        path.join(temporaryPath, "package.json"),
        JSON.stringify({
          name,
          version: "v1.2.3",
        }),
      );

      const { exitCode } = await alexCLineTestClient("create-release-note");
      expect(exitCode).toBe(0);
      const fileContents = await readFile(
        path.join(temporaryPath, `docs/releases/patch/v1.2.3.md`),
        "utf-8",
      );

      expect(fileContents).toContain("# v1.2.3 (Patch Release)");
    });
  });
  test("Errors if the release note already exists", async () => {
    await temporaryDirectoryTask(async (temporaryPath) => {
      const alexCLineTestClient = createAlexCLineTestClientInDirectory(temporaryPath);
      await writeFile(
        path.join(temporaryPath, "package.json"),
        JSON.stringify({
          name,
          version: "v1.2.3",
        }),
      );

      try {
        await alexCLineTestClient("create-release-note");
      } catch (error) {
        if (error instanceof ExecaError) {
          const { stderr: errorMessage, exitCode } = error;
          expect(exitCode).toBe(1);
          expect(errorMessage).toBe("❌ ERROR: Release notes already exist.");
        }
      }
    });
  });
  test("Allows an option for major, minor, or patch to be passed in as an argument", async () => {
    await temporaryDirectoryTask(async (temporaryPath) => {
      const alexCLineTestClient = createAlexCLineTestClientInDirectory(temporaryPath);
      await writeFile(
        path.join(temporaryPath, "package.json"),
        JSON.stringify({
          name,
          version: "v1.2.3",
        }),
      );

      // Major option
      const { exitCode: majorExitCode } = await alexCLineTestClient("create-release-note", [
        "major",
      ]);
      expect(majorExitCode).toBe(0);
      const majorFileContents = await readFile(
        path.join(temporaryPath, `docs/releases/major/v2.0.0.md`),
        "utf-8",
      );

      expect(majorFileContents).toContain("# v2.0.0 (Major Release)");
      expect(majorFileContents).toContain("## Migration Notes");

      // Minor option
      const { exitCode: minorExitCode } = await alexCLineTestClient("create-release-note", [
        "minor",
      ]);
      expect(minorExitCode).toBe(0);
      const minorFileContents = await readFile(
        path.join(temporaryPath, `docs/releases/minor/v1.3.0.md`),
        "utf-8",
      );

      expect(minorFileContents).toContain("# v1.3.0 (Minor Release)");

      // Patch option
      const { exitCode: patchExitCode } = await alexCLineTestClient("create-release-note", [
        "patch",
      ]);
      expect(patchExitCode).toBe(0);
      const fileContents = await readFile(
        path.join(temporaryPath, `docs/releases/patch/v1.2.4.md`),
        "utf-8",
      );

      expect(fileContents).toContain("# v1.2.4 (Patch Release)");
    });
  });
});
