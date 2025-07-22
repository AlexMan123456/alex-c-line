import { execa, ExecaError } from "execa";
import { readFile, writeFile } from "fs/promises";
import path from "path";
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
  test("Throw a custom error if branch not fully merged, and go back to current branch", async () => {
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

      try {
        await alexCLineTestClient("git-cleanup");
        throw new Error("TEST_FAILED");
      } catch (error: unknown) {
        if (error instanceof ExecaError) {
          const { exitCode, stderr: errorMessage } = error;
          expect(exitCode).toBe(1);
          expect(errorMessage).toContain(
            "❌ ERROR: Changes on branch not fully merged!",
          );
          const { stdout: currentBranch } = await gitTestClient("git", [
            "branch",
            "--show-current",
          ]);
          expect(currentBranch).toBe("test-branch");
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
          const { stdout: currentBranch } = await gitTestClient("git", [
            "branch",
            "--show-current",
          ]);
          expect(currentBranch).toBe("test-branch");
        } else {
          throw error;
        }
      }
    });
  });
  test("If current branch exists on remote but has not been rebase-merged yet, throw an error", async () => {
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
          const { stdout: currentBranch } = await gitTestClient("git", [
            "branch",
            "--show-current",
          ]);
          expect(currentBranch).toBe("test-branch");
        } else {
          throw error;
        }
      }
    });
  });
  test("If someone made changes beforehand, still allow the rebase to go through", async () => {
    await temporaryDirectoryTask(async (tempDirectory) => {
      const originDirectory = await setupOrigin(tempDirectory);
      const { testRepository, testFilePath } = await setupRepository(
        tempDirectory,
        originDirectory,
        "test-file-1.js",
      );

      const gitTestClient = createGitTestClient(testRepository);
      const alexCLineTestClient =
        createAlexCLineTestClientInDirectory(testRepository);

      // Create a change on test-branch-1
      await gitTestClient("git", ["checkout", "-b", "test-branch-1"]);
      await writeFile(testFilePath, 'console.log("This is a test");');
      await gitTestClient("git", ["add", "test-file-1.js"]);
      await gitTestClient("git", ["commit", "-m", "This is a test"]);
      await gitTestClient("git", ["push", "origin", "test-branch-1"]);

      //  Create a change on test-branch-2
      await gitTestClient("git", ["checkout", "main"]);
      await gitTestClient("git", ["checkout", "-b", "test-branch-2"]);
      const secondTestFilePath = path.join(testRepository, "test-file-2.js");
      await writeFile(
        secondTestFilePath,
        'console.log("This is another test");',
      );
      await gitTestClient("git", ["add", "test-file-2.js"]);
      await gitTestClient("git", ["commit", "-m", "This is a second test"]);
      await gitTestClient("git", ["push", "origin", "test-branch-2"]);

      // Rebase and merge changes from test-branch-1
      await rebaseChangesOntoMain(testRepository, "test-branch-1");

      // Check test-branch-1 has been rebased and merged
      await alexCLineTestClient("git-cleanup", ["--rebase"]);
      const fileContentsAfterFirst = await readFile(testFilePath, "utf-8");
      expect(fileContentsAfterFirst).toBe('console.log("This is a test");');
      const { stdout: branchesAfterFirst } = await gitTestClient("git", [
        "branch",
      ]);
      expect(branchesAfterFirst).not.toContain("test-branch-1");

      // Rebase and merge changes from
      await rebaseChangesOntoMain(testRepository, "test-branch-2");

      // Check test-branch-2 has been rebased and merged
      await alexCLineTestClient("git-cleanup", ["--rebase"]);
      const fileContentsAfterSecond = await readFile(
        secondTestFilePath,
        "utf-8",
      );
      expect(fileContentsAfterSecond).toBe(
        'console.log("This is another test");',
      );
      const { stdout: branchesAfterSecond } = await gitTestClient("git", [
        "branch",
      ]);
      expect(branchesAfterSecond).not.toContain("test-branch-2");
    });
  });
});
