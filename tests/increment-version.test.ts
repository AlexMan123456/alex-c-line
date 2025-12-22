import { VersionNumber } from "@alextheman/utility";
import { ExecaError } from "execa";
import { describe, expect, test } from "vitest";

import alexCLineTestClient from "tests/test-clients/alex-c-line-test-client";

import { version } from "package.json" with { type: "json" };

describe("incrementVersion", () => {
  describe("Provides the incremented version in stdout", () => {
    test("Major", async () => {
      const { exitCode: majorExitCode, stdout: newMajorVersion } = await alexCLineTestClient(
        "increment-version",
        [version, "major"],
      );
      expect(majorExitCode).toBe(0);
      expect(newMajorVersion).toBe(new VersionNumber(version).increment("major").toString());
    });

    test("Minor", async () => {
      const { exitCode: minorExitCode, stdout: newMinorVersion } = await alexCLineTestClient(
        "increment-version",
        [version, "minor"],
      );
      expect(minorExitCode).toBe(0);
      expect(newMinorVersion).toBe(new VersionNumber(version).increment("minor").toString());
    });

    test("Patch", async () => {
      const { exitCode: patchExitCode, stdout: newPatchVersion } = await alexCLineTestClient(
        "increment-version",
        [version, "patch"],
      );
      expect(patchExitCode).toBe(0);
      expect(newPatchVersion).toBe(new VersionNumber(version).increment("patch").toString());
    });
  });

  test("Fails on invalid version number", async () => {
    try {
      await alexCLineTestClient("increment-version", ["hello", "minor"]);
    } catch (error) {
      if (error instanceof ExecaError) {
        const { stderr, exitCode } = error;
        expect(exitCode).toBe(1);
        expect(stderr).toContain("DataError");
      } else {
        throw error;
      }
    }
  });

  test("Fails on invalid version type", async () => {
    try {
      await alexCLineTestClient("increment-version", [version, "hello"]);
    } catch (error) {
      if (error instanceof ExecaError) {
        const { stderr, exitCode } = error;
        expect(exitCode).toBe(1);
        expect(stderr).toContain("DataError");
      } else {
        throw error;
      }
    }
  });

  test('Does not include "v" prefix if --no-prefix provided', async () => {
    const { exitCode, stdout: newVersion } = await alexCLineTestClient("increment-version", [
      version,
      "major",
      "--no-prefix",
    ]);
    expect(exitCode).toBe(0);
    expect(newVersion).toBe(
      new VersionNumber(version).increment("major").toString({ omitPrefix: true }),
    );
  });
});
