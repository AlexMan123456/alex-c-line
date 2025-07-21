import { execa, ExecaError } from "execa";
import { readFile, writeFile } from "fs/promises";
import { temporaryDirectoryTask } from "tempy";
import { createAlexCLineTestClientInDirectory } from "tests/test-clients/alex-c-line-test-client";
import {
  createGitTestClient,
  mergeChangesIntoMain,
  rebaseChangesOntoMain,
  setupOrigin,
  setupRepository,
} from "tests/test-clients/git-testing-utilities";
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
      const fileContentsBefore = await readFile(testFilePath, "utf-8");
      expect(fileContentsBefore).toBe("");

      const gitTestClient = createGitTestClient(testRepository);
      const alexCLineTestClient =
        createAlexCLineTestClientInDirectory(testRepository);

      // Setup test file
      await gitTestClient("git", ["checkout", "-b", "test-branch"]);
      await writeFile(testFilePath, 'console.log("This is a test");');
      await gitTestClient("git", ["add", "test-file.js"]);
      await gitTestClient("git", ["commit", "-m", "This is a test"]);
      await gitTestClient("git", ["push", "origin", "test-branch"]);

      await mergeChangesIntoMain(testRepository, "test-branch");

      await alexCLineTestClient("git-cleanup");
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

      const alexCLineTestClient =
        createAlexCLineTestClientInDirectory(testRepository);

      try {
        await alexCLineTestClient("git-cleanup");
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
      const fileContentsBefore = await readFile(testFilePath, "utf-8");
      expect(fileContentsBefore).toBe("");

      const gitTestClient = createGitTestClient(testRepository);
      const alexCLineTestClient =
        createAlexCLineTestClientInDirectory(testRepository);

      // Setup an actual test file
      await gitTestClient("git", ["checkout", "-b", "test-branch"]);
      await writeFile(testFilePath, 'console.log("This is a test");');
      await gitTestClient("git", ["add", "test-file.js"]);
      await gitTestClient("git", ["commit", "-m", "This is a test"]);
      await gitTestClient("git", ["push", "origin", "test-branch"]);

      await rebaseChangesOntoMain(testRepository, "test-branch");

      await alexCLineTestClient("git-cleanup", ["--rebase"]);
      const { stdout: branches } = await gitTestClient("git", ["branch"]);
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

      const gitTestClient = createGitTestClient(testRepository);
      const alexCLineTestClient =
        createAlexCLineTestClientInDirectory(testRepository);

      await gitTestClient("git", ["checkout", "-b", "test-branch"]);
      await writeFile(testFilePath, 'console.log("This is a test");');
      await gitTestClient("git", ["add", "test-file.js"]);
      await gitTestClient("git", ["commit", "-m", "This is a test"]);

      try {
        await alexCLineTestClient("git-cleanup", ["--rebase"]);
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

      const gitTestClient = createGitTestClient(testRepository);
      const alexCLineTestClient =
        createAlexCLineTestClientInDirectory(testRepository);

      await gitTestClient("git", ["checkout", "-b", "test-branch"]);
      await writeFile(testFilePath, 'console.log("This is a test");');
      await gitTestClient("git", ["add", "test-file.js"]);
      await gitTestClient("git", ["commit", "-m", "This is a test"]);
      await gitTestClient("git", ["push", "origin", "test-branch"]);

      try {
        await alexCLineTestClient("git-cleanup", ["--rebase"], {
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
  // TO DO: Add test for case when someone merges before you in rebase.
  test.skip("If someone made changes beforehand, still allow the rebase to go through", async () => {
    await temporaryDirectoryTask(async (tempDirectory) => {
      const originDirectory = await setupOrigin(tempDirectory);
      const { testRepository, testFilePath } = await setupRepository(
        tempDirectory,
        originDirectory,
        "test-file.js",
      );

      const gitTestClient = createGitTestClient(testRepository);
      const alexCLineTestClient =
        createAlexCLineTestClientInDirectory(testRepository);

      await gitTestClient("git", ["checkout", "-b", "test-branch"]);
      await writeFile(testFilePath, 'console.log("This is a test");');
      await gitTestClient("git", ["add", "test-file.js"]);
      await gitTestClient("git", ["commit", "-m", "This is a test"]);
      await gitTestClient("git", ["push", "origin", "test-branch"]);

      await rebaseChangesOntoMain(testRepository, "test-branch");
      await alexCLineTestClient("git-cleanup", ["--rebase"]);
      const fileContentsAfter = await readFile(testFilePath, "utf-8");
      expect(fileContentsAfter).toBe('console.log("This is a test");');
      const { stdout: branches } = await execa("git", ["branch"], {
        cwd: testRepository,
      });
      expect(branches).not.toContain("test-branch");
    });
  });
});
