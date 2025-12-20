import type { Options } from "execa";

import { execa } from "execa";

import { writeFile } from "node:fs/promises";
import path from "node:path";

export function createGitTestClient(repository: string) {
  return async (command: string, args?: string[], options?: Omit<Options, "cwd">) => {
    await execa("git", ["config", "--global", "user.email", "test@example.com"], {
      env: {
        HOME: repository.split("/").slice(0, -1).join("/"),
      },
    });
    await execa("git", ["config", "--global", "user.name", "Test User"], {
      env: {
        HOME: repository.split("/").slice(0, -1).join("/"),
      },
    });
    return await execa(command, args, {
      ...options,
      cwd: repository,
      env: {
        HOME: repository.split("/").slice(0, -1).join("/"),
      },
    });
  };
}

export async function setupOrigin(tempDirectory: string) {
  const originDirectory = path.join(tempDirectory, "origin.git");
  await execa("git", ["init", "--bare", originDirectory]);
  return originDirectory;
}

export async function setupRepository(
  tempDirectory: string,
  originDirectory: string,
  testFileName: string = "README.md",
) {
  await execa("mkdir", ["test-repository"], { cwd: tempDirectory });
  const testRepository = path.resolve(tempDirectory, "test-repository");
  const gitTestClient = createGitTestClient(testRepository);
  await gitTestClient("git", ["init"]);
  await gitTestClient("git", ["checkout", "-b", "main"]);
  await gitTestClient("git", ["remote", "add", "origin", originDirectory]);
  const testFilePath = path.join(testRepository, testFileName);
  await writeFile(testFilePath, "");
  await gitTestClient("git", ["add", "."]);
  await gitTestClient("git", ["commit", "-m", "Initial commit"]);
  await gitTestClient("git", ["push", "origin", "main"]);
  return { testRepository, testFilePath };
}

export async function mergeChangesIntoMain(testRepository: string, branchName: string) {
  const gitTestClient = createGitTestClient(testRepository);
  await gitTestClient("git", ["checkout", "main"]);
  await gitTestClient("git", ["merge", branchName, "--no-ff", "-m", "Merge into main"]);
  await gitTestClient("git", ["push", "origin", "main"]);
  await gitTestClient("git", ["push", "origin", "--delete", branchName]);
  await gitTestClient("git", ["checkout", branchName]);
}

export async function rebaseChangesOntoMain(testRepository: string, branchName: string) {
  const gitTestClient = createGitTestClient(testRepository);
  await gitTestClient("git", ["checkout", "main"]);
  await gitTestClient("git", ["pull", "origin", "main"]);
  await gitTestClient("git", ["checkout", branchName]);
  await gitTestClient("git", ["rebase", "main"]);
  await gitTestClient("git", ["push", "--force", "origin", branchName]);
  await gitTestClient("git", ["checkout", "main"]);
  await gitTestClient("git", ["merge", branchName]);
  await gitTestClient("git", ["push", "--force", "origin", "main"]);
  await gitTestClient("git", ["push", "origin", "--delete", branchName]);
  await gitTestClient("git", ["checkout", branchName]);
}
//
