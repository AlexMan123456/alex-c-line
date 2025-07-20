import { describe, expect, test } from "vitest";
import { temporaryDirectoryTask } from "tempy";
import path from "path";
import { writeFile } from "fs/promises";
import alexCLineTestClient from "tests/alex-c-line-test-client";

describe("check-lockfile-version-discrepancy", () => {
  test("Succeed if version numbers in package.json and package-lock.json are successful", async () => {
    await temporaryDirectoryTask(async (tempDirectory) => {
      const packagePath = path.join(tempDirectory, "package.json");
      const packageLockPath = path.join(tempDirectory, "package-lock.json");

      await writeFile(
        packagePath,
        JSON.stringify({ version: "1.0.0" }, null, 2),
      );
      await writeFile(
        packageLockPath,
        JSON.stringify({ version: "1.0.0" }, null, 2),
      );

      const { stdout: output, exitCode } = await alexCLineTestClient(
        "check-lockfile-version-discrepancy",
        {
          cwd: tempDirectory,
        },
      );
      expect(output).toContain(
        "package.json and package-lock.json versions in sync.",
      );
      expect(exitCode).toBe(0);
    });
  });
});
