import { readFile, writeFile } from "fs/promises";
import path from "path";

import type { Command } from "commander";
import dotenv from "dotenv";
// @ts-ignore
import dotenvStringify from "dotenv-stringify";

export interface EditEnvOptions {
  key: string;
  value: unknown;
}

function editEnv(program: Command) {
  program
    .command("edit-env <key> <value>")
    .description("Edit property in .env file ")
    .action(async (key: string, value: string) => {
      if (!key || !value) {
        console.error("Invalid property. Please provide property in format PROPERTY=value");
        process.exit(1);
      }

      let currentEnvFileContents: Record<string, unknown>;
      try {
        currentEnvFileContents = dotenv.parse(
          await readFile(path.join(process.cwd(), ".env"), "utf-8"),
        );
      } catch {
        currentEnvFileContents = {};
      }

      currentEnvFileContents[key] = value;

      await writeFile(path.join(process.cwd(), ".env"), dotenvStringify(currentEnvFileContents));
    });
}

export default editEnv;
