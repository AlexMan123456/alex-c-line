import { execa } from "execa";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { expect } from "vitest";

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
  await execa("git", ["init"], { cwd: testRepository });
  await execa("git", ["checkout", "-b", "main"], { cwd: testRepository });
  await execa("git", ["remote", "add", "origin", originDirectory], {
    cwd: testRepository,
  });
  const testFilePath = path.join(testRepository, testFileName);
  await writeFile(testFilePath, "");
  const fileContentsBefore = await readFile(testFilePath, "utf-8");
  expect(fileContentsBefore).toBe("");
  await execa("git", ["add", "."], { cwd: testRepository });
  await execa("git", ["commit", "-m", "Initial commit"], {
    cwd: testRepository,
  });
  await execa("git", ["push", "origin", "main"], { cwd: testRepository });
  return { testRepository, testFilePath };
}

export async function mergeChangesIntoMain(
  testRepository: string,
  branchName: string,
) {
  await execa("git", ["checkout", "main"], { cwd: testRepository });
  await execa(
    "git",
    ["merge", branchName, "--no-ff", "-m", "Merge into main"],
    { cwd: testRepository },
  );
  await execa("git", ["push", "origin", "main"], { cwd: testRepository });
  await execa("git", ["push", "origin", "--delete", branchName], {
    cwd: testRepository,
  });
  await execa("git", ["checkout", branchName], { cwd: testRepository });
}

export async function rebaseChangesOntoMain(
  testRepository: string,
  branchName: string,
) {
  await execa("git", ["checkout", "main"], { cwd: testRepository });
  await execa("git", ["pull", "origin", "main"], { cwd: testRepository });
  await execa("git", ["checkout", branchName], { cwd: testRepository });
  await execa("git", ["rebase", "main"], { cwd: testRepository });
  await execa("git", ["push", "--force", "origin", branchName], {
    cwd: testRepository,
  });
  await execa("git", ["checkout", "main"], { cwd: testRepository });
  await execa("git", ["merge", "--ff-only", branchName], {
    cwd: testRepository,
  });
  await execa("git", ["push", "origin", "main"], { cwd: testRepository });
  await execa("git", ["push", "origin", "--delete", branchName], {
    cwd: testRepository,
  });
  await execa("git", ["checkout", branchName], { cwd: testRepository });
}
