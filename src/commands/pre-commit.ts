import type { Command } from "commander";

import { DataError, parseZodSchema } from "@alextheman/utility";
import z from "zod";

import { readFile } from "node:fs/promises";
import path from "node:path";

import { PackageManager } from "src/configs/types/PreCommitConfig";
import loadAlexCLineConfig from "src/utility/configLoaders/loadAlexCLineConfig";
import { execaNoFail } from "src/utility/execa-helpers";
import findAlexCLineConfig from "src/utility/findAlexCLineConfig";

interface PreCommitOptions {
  allowNoStagedChanges?: boolean;
}

function preCommit(program: Command) {
  program
    .command("pre-commit")
    .description("Run the standard pre-commits used across all my repositories.")
    .option("--allow-no-staged-changes", "Run even if nothing is staged")
    .action(async ({ allowNoStagedChanges }: PreCommitOptions) => {
      const configPath = await findAlexCLineConfig(process.cwd());
      if (!configPath) {
        program.error("Could not find the path to the alex-c-line config file. Does it exist?", {
          exitCode: 1,
          code: "ALEX_C_LINE_CONFIG_NOT_FOUND",
        });
      }
      const { preCommit: preCommitConfig } = await loadAlexCLineConfig(configPath);

      if (!preCommitConfig) {
        program.error("Could not find the pre-commit config in alex-c-line config.", {
          exitCode: 1,
          code: "PRE_COMMIT_CONFIG_NOT_FOUND",
        });
      }

      const { exitCode: diffExitCode } = await execaNoFail("git", ["diff", "--cached", "--quiet"]);

      switch (diffExitCode) {
        case 128:
          program.error("Not currently in a Git repository", {
            exitCode: 1,
            code: "GIT_DIFF_FAILED",
          });
        // program.error() will throw an error and stop the program, so it is redundant to include a break here.
        // eslint-disable-next-line no-fallthrough
        case 0:
          if (allowNoStagedChanges ?? preCommitConfig.allowNoStagedChanges) {
            break;
          }
          console.info("No staged changes found. Use --allow-no-staged-changes to run anyway.");
          return;
      }

      async function runCommandAndLogToConsole(command: string, args?: string[] | undefined) {
        const result = await execaNoFail(command, args, { stdio: "inherit" });

        if (result.exitCode !== 0) {
          program.error(`Command failed: ${command}${args?.length ? ` ${args.join(" ")}` : ""}`, {
            exitCode: result.exitCode ?? 1,
            code: "PRE_COMMIT_FAILED",
          });
        }

        return result;
      }

      const { packageManager: packagePackageManager, scripts } = JSON.parse(
        await readFile(path.join(process.cwd(), "package.json"), "utf8"),
      );
      const rawPackageManager =
        preCommitConfig.packageManager ??
        (typeof packagePackageManager === "string"
          ? packagePackageManager.split("@")[0]
          : undefined);

      const packageManager = parseZodSchema(
        z.enum(PackageManager),
        rawPackageManager,
        new DataError(
          rawPackageManager,
          "UNSUPPORTED_PACKAGE_MANAGER",
          `This repository manager is not currently supported. Only the following are supported: ${Object.values(PackageManager).join(", ")}`,
        ),
      );

      function getCommandArguments(script: string, args?: string[]): string[] {
        if (!(script in (scripts ?? {}))) {
          program.error(`Could not find script \`${script}\` in package.json.`, {
            exitCode: 1,
            code: "SCRIPT_NOT_FOUND",
          });
        }
        const result = script === "test" ? [script] : ["run", script];

        if (args) {
          result.push(...args);
        }

        return result;
      }

      for (const step of preCommitConfig.steps) {
        if (typeof step === "string") {
          await runCommandAndLogToConsole(packageManager, [...getCommandArguments(step)]);
        } else {
          const [script, options] = step;
          await runCommandAndLogToConsole(packageManager, [
            ...getCommandArguments(script, options.arguments),
          ]);
        }
      }

      await execaNoFail("git", ["update-index", "--again"]);
    });
}

export default preCommit;
