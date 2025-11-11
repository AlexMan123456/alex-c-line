import type { Command } from "commander";

import { readFile, writeFile } from "fs/promises";
import path from "path";

import dotenv from "dotenv";
import dotenvStringify from "dotenv-stringify";

function editEnv(program: Command) {
  program
    .command("edit-env <key> [value]")
    .description("Edit property in .env file (leave value blank to delete property)")
    .option("--file <file>", "The file to edit", ".env")
    .action(async (key: string, value: unknown, { file }: { file: string }) => {
      let newValue: unknown = value;
      if (typeof newValue === "string" && newValue.startsWith("--")) {
        newValue = undefined;
      }
      let currentEnvFileContents: Record<string, unknown>;
      try {
        currentEnvFileContents = dotenv.parse(
          await readFile(path.join(process.cwd(), file), "utf-8"),
        );
      } catch {
        currentEnvFileContents = {};
      }

      if (newValue !== undefined) {
        currentEnvFileContents[key] = newValue;
      } else {
        delete currentEnvFileContents[key];
      }

      await writeFile(
        path.join(process.cwd(), file),
        `${dotenvStringify(currentEnvFileContents)}\n`,
      );
      console.info(".env file updated");
    });
}

export default editEnv;
