import { execa, ExecaError } from "execa";
import { readFile, writeFile } from "fs/promises";
import { temporaryDirectoryTask } from "tempy";
import alexCLineTestClient from "tests/test-utilities/alex-c-line-test-client";
import {
  mergeChangesIntoMain,
  rebaseChangesOntoMain,
  setupOrigin,
  setupRepository,
} from "tests/test-utilities/git-testing-utilities";
import { describe, expect, test } from "vitest";

describe("git-cleanup", () => {
  test("Checks out main from the current branch, then pulls down changes and deletes the previous branch", async () => {
    await temporaryDirectoryTask(async (tempDirectory) => {
      // Setup
      const originDirectory = await setupOrigin(tempDirectory);
      const { testRepository, testFilePath } = await setupRepository(
        tempDirectory,
        originDirectory,
        "test-file.js",
      );

      // Setup an actual test file
      await execa("git", ["checkout", "-b", "test-branch"], {
        cwd: testRepository,
      });
      await writeFile(testFilePath, 'console.log("This is a test");');
      await execa("git", ["add", "test-file.js"], { cwd: testRepository });
      await execa("git", ["commit", "-m", "This is a test"], {
        cwd: testRepository,
      });
      await execa("git", ["push", "origin", "test-branch"], {
        cwd: testRepository,
      });

      await mergeChangesIntoMain(testRepository, "test-branch");

      await alexCLineTestClient("git-cleanup", { cwd: testRepository });
      const fileContentsAfter = await readFile(testFilePath, "utf-8");
      expect(fileContentsAfter).toBe('console.log("This is a test");');
      const { stdout: branches } = await execa("git", ["branch"], {
        cwd: testRepository,
      });
      expect(branches).not.toContain("test-branch");
    });
  });
  test("Throws an error if command is run on main branch", async () => {
    await temporaryDirectoryTask(async (tempDirectory) => {
      // Setup
      const originDirectory = await setupOrigin(tempDirectory);
      const { testRepository } = await setupRepository(
        tempDirectory,
        originDirectory,
        "test-file.js",
      );

      try {
        await alexCLineTestClient("git-cleanup", { cwd: testRepository });
        throw new Error("TEST_FAILED");
      } catch (error: unknown) {
        if (error instanceof ExecaError) {
          const { stderr: errorMessage, exitCode } = error;
          expect(exitCode).toBe(1);
          expect(errorMessage).toBe(
            "❌ ERROR: Cannot run cleanup on main branch!",
          );
        } else {
          throw error;
        }
      }
    });
  });
  test("Force-deletes branch in rebase mode", async () => {
    await temporaryDirectoryTask(async (tempDirectory) => {
      const originDirectory = await setupOrigin(tempDirectory);
      const { testRepository, testFilePath } = await setupRepository(
        tempDirectory,
        originDirectory,
        "test-file.js",
      );

      // Setup an actual test file
      await execa("git", ["checkout", "-b", "test-branch"], {
        cwd: testRepository,
      });
      await writeFile(testFilePath, 'console.log("This is a test");');
      await execa("git", ["add", "test-file.js"], { cwd: testRepository });
      await execa("git", ["commit", "-m", "This is a test"], {
        cwd: testRepository,
      });
      await execa("git", ["push", "origin", "test-branch"], {
        cwd: testRepository,
      });

      await rebaseChangesOntoMain(testRepository, "test-branch");

      await alexCLineTestClient(["git-cleanup", "--rebase"], {
        cwd: testRepository,
      });
      const { stdout: branches } = await execa("git", ["branch"], {
        cwd: testRepository,
      });
      expect(branches).not.toContain("test-branch");
      const fileContentsAfter = await readFile(testFilePath, "utf-8");
      expect(fileContentsAfter).toBe('console.log("This is a test");');
    });
  });
  test("If current branch differs from main on rebase, throw an error", async () => {
    await temporaryDirectoryTask(async (tempDirectory) => {
      const originDirectory = await setupOrigin(tempDirectory);
      const { testRepository, testFilePath } = await setupRepository(
        tempDirectory,
        originDirectory,
        "test-file.js",
      );

      await execa("git", ["checkout", "-b", "test-branch"], {
        cwd: testRepository,
      });
      await writeFile(testFilePath, 'console.log("This is a test");');
      await execa("git", ["add", "test-file.js"], { cwd: testRepository });
      await execa("git", ["commit", "-m", "This is a test"], {
        cwd: testRepository,
      });

      try {
        await alexCLineTestClient(["git-cleanup", "--rebase"], {
          cwd: testRepository,
        });
        throw new Error("TEST_FAILED");
      } catch (error: unknown) {
        if (error instanceof ExecaError) {
          const { stderr: errorMessage, exitCode } = error;
          expect(exitCode).toBe(1);
          expect(errorMessage).toContain(
            "❌ ERROR: Changes on branch not fully merged!",
          );
          return;
        } else {
          throw error;
        }
      }
    });
  });
  test("If current branch exists on remote but has not been merged yet, still throw an error", async () => {
    await temporaryDirectoryTask(async (tempDirectory) => {
      const originDirectory = await setupOrigin(tempDirectory);
      const { testRepository, testFilePath } = await setupRepository(
        tempDirectory,
        originDirectory,
        "test-file.js",
      );

      await execa("git", ["checkout", "-b", "test-branch"], {
        cwd: testRepository,
      });
      await writeFile(testFilePath, 'console.log("This is a test");');
      await execa("git", ["add", "test-file.js"], { cwd: testRepository });
      await execa("git", ["commit", "-m", "This is a test"], {
        cwd: testRepository,
      });
      await execa("git", ["push", "origin", "test-branch"], {
        cwd: testRepository,
      });

      try {
        await alexCLineTestClient(["git-cleanup", "--rebase"], {
          cwd: testRepository,
        });
        throw new Error("TEST_FAILED");
      } catch (error: unknown) {
        if (error instanceof ExecaError) {
          const { stderr: errorMessage, exitCode } = error;
          expect(exitCode).toBe(1);
          expect(errorMessage).toContain(
            "❌ ERROR: Changes on branch not fully merged!",
          );
          return;
        } else {
          throw error;
        }
      }
    });
  });
});
