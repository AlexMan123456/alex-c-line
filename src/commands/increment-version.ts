import type { Command } from "commander";

import {
  incrementVersion as incrementVersionUtility,
  normaliseIndents,
  parseVersion,
  parseVersionType,
} from "@alextheman/utility";

interface IncrementVersionOptions {
  prefix?: boolean;
}

function incrementVersion(program: Command) {
  program
    .command("increment-version")
    .description("Increments the given input version depending on the given increment type.")
    .argument("<version>", "The version to increment")
    .argument(
      "<incrementType>",
      normaliseIndents`
            The type of increment. Can be one of the following:

            - "major": Change the major version v1.2.3 → v2.0.0
            - "minor": Change the minor version v1.2.3 → v1.3.0
            - "patch": Change the patch version v1.2.3 → v1.2.4
        `,
    )
    .option("--no-prefix")
    .option(
      "--prefix",
      "Whether to add the `v` prefix from the output version or not (defaults to true).",
    )
    .action((version: string, incrementType: string, { prefix }: IncrementVersionOptions) => {
      console.info(
        incrementVersionUtility(parseVersion(version), parseVersionType(incrementType), {
          omitPrefix: !prefix,
        }),
      );
    });
}

export default incrementVersion;
