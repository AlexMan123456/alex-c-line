import { ExecaError } from "execa";
import { temporaryDirectoryTask } from "tempy";
import { describe, expect, test } from "vitest";

import { writeFile } from "node:fs/promises";
import path from "node:path";

import alexCLineTestClient from "tests/test-clients/alex-c-line-test-client";

describe("check-lockfile-version-discrepancy", () => {
  test("Succeed if version numbers in package.json and package-lock.json are successful", async () => {
    await temporaryDirectoryTask(async (tempDirectory) => {
      const packagePath = path.join(tempDirectory, "package.json");
      const packageLockPath = path.join(tempDirectory, "package-lock.json");

      await writeFile(packagePath, JSON.stringify({ version: "1.0.0" }, null, 2));
      await writeFile(packageLockPath, JSON.stringify({ version: "1.0.0" }, null, 2));

      const { stdout: output, exitCode } = await alexCLineTestClient(
        "check-lockfile-version-discrepancy",
        undefined,
        {
          cwd: tempDirectory,
        },
      );
      expect(exitCode).toBe(0);
      expect(output).toContain("package.json and package-lock.json versions in sync.");
    });
  });
  test("Throw an error if package.json and package-lock.json versions don't match", async () => {
    await temporaryDirectoryTask(async (tempDirectory) => {
      const packagePath = path.join(tempDirectory, "package.json");
      const packageLockPath = path.join(tempDirectory, "package-lock.json");

      await writeFile(packagePath, JSON.stringify({ version: "1.0.0" }, null, 2));
      await writeFile(packageLockPath, JSON.stringify({ version: "1.0.1" }, null, 2));

      try {
        await alexCLineTestClient("check-lockfile-version-discrepancy", undefined, {
          cwd: tempDirectory,
        });
        throw new Error("TEST_FAILED");
      } catch (error: unknown) {
        if (error instanceof ExecaError) {
          const { stderr: errorMessage, exitCode } = error;
          expect(exitCode).toBe(1);
          expect(errorMessage).toBe(
            "❌ ERROR: package.json and package-lock.json out of sync. Please run `npm install` to fix this.",
          );
        }
      }
    });
  });
});
