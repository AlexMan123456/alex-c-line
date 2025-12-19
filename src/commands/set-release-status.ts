import type { Command } from "commander";

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { parseVersion } from "@alextheman/utility";

import isValidReleaseDocument from "src/utils/isValidReleaseDocument";

function setReleaseStatus(program: Command) {
  program
    .command("set-release-status")
    .description(
      "Change the release status on a given release document initially generated from the `create-release-note` command.",
    )
    .argument("<documentPath>", "The path to the document")
    .action(async (documentPath: string) => {
      const { name: packageName }: { name: string } = JSON.parse(
        await readFile(path.join(process.cwd(), "package.json"), "utf-8"),
      );
      if (!documentPath.endsWith("md")) {
        console.error("❌ ERROR: Invalid file path. Path must lead to a .md file.");
        process.exit(1);
      }

      const pathParts = documentPath.split("/");
      const version = pathParts[pathParts.length - 1]
        .split(".")
        .filter((part) => {
          return part !== "md";
        })
        .join(".");
      const parsedVersion = parseVersion(version);

      const fullDocumentPath = path.join(process.cwd(), documentPath);
      const initialDocument = await readFile(fullDocumentPath, "utf-8");

      if (!isValidReleaseDocument(packageName, parsedVersion, initialDocument)) {
        console.error("❌ ERROR: Document does not match a valid release note template.");
        process.exit(1);
      }

      const newDocument = initialDocument.replace(
        /^\*\*Status\*\*:\s*(.+)$/m,
        "**Status**: Released",
      );

      await writeFile(fullDocumentPath, newDocument);
      console.info(`Setting the status of ${documentPath} to "Released"`);
    });
}

export default setReleaseStatus;
