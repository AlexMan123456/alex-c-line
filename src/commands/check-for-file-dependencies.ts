import type { Command } from "commander";

import { readFile } from "fs/promises";
import path from "path";

export interface PackageDependencies {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

function findFileDependencies(
  dependencies: Record<string, string> | undefined,
): Record<string, string> {
  const fileDependencies: Record<string, string> = {};
  if (!dependencies) {
    return {};
  }
  for (const dependency in dependencies) {
    if (dependencies[dependency].includes("file:")) {
      fileDependencies[dependency] = dependencies[dependency];
    }
  }
  return fileDependencies;
}

function checkForFileDependencies(program: Command) {
  program
    .command("check-for-file-dependencies")
    .description(
      "Check for existence of file dependencies in package.json and give exit code 1 if such dependencies are found",
    )
    .action(async () => {
      console.info("Checking for file dependencies...");
      const { dependencies, devDependencies, peerDependencies } = JSON.parse(
        await readFile(path.resolve(process.cwd(), "package.json"), "utf-8"),
      );
      const allFileDependencies: PackageDependencies = {
        dependencies: findFileDependencies(dependencies),
        devDependencies: findFileDependencies(devDependencies),
        peerDependencies: findFileDependencies(peerDependencies),
      };

      if (Object.keys(allFileDependencies.dependencies ?? {}).length === 0) {
        delete allFileDependencies.dependencies;
      }
      if (Object.keys(allFileDependencies.devDependencies ?? {}).length === 0) {
        delete allFileDependencies.devDependencies;
      }
      if (Object.keys(allFileDependencies.peerDependencies ?? {}).length === 0) {
        delete allFileDependencies.peerDependencies;
      }

      if (Object.keys(allFileDependencies).length !== 0) {
        console.error("ERROR: File dependencies found:");
        console.error(JSON.stringify(allFileDependencies, undefined, 2));
        process.exit(1);
      }
      console.info("No file dependencies found!");
      process.exit(0);
    });
}

export default checkForFileDependencies;
