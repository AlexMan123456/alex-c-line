import { readFile, writeFile } from "fs/promises";
import path from "path";

import type { Command } from "commander";
import dotenv from "dotenv";
// @ts-ignore
import dotenvStringify from "dotenv-stringify";

function editEnv(program: Command) {
  program
    .command("edit-env <key> <value>")
    .description("Edit property in .env file ")
    .action(async (key: string, value: unknown) => {
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
      console.log(".env file updated");
    });
}

export default editEnv;
