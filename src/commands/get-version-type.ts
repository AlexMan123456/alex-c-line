import type { Command } from "commander";

import { VersionNumber } from "@alextheman/utility";

function getVersionType(program: Command) {
  program
    .command("get-version-type")
    .description("Gets the version type of the given version number.")
    .argument("<version>", "The version to get the version type from")
    .action((version: string) => {
      console.info(new VersionNumber(version).type);
    });
}

export default getVersionType;
