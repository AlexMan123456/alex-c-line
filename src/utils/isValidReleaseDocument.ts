import type { VersionNumber } from "@alextheman/utility";

import { kebabToCamel, normaliseIndents } from "@alextheman/utility";

import getReleaseSummary from "src/utils/getReleaseSummary";

function isValidReleaseDocument(
  packageName: string,
  version: VersionNumber,
  initialDocument: string,
): boolean {
  return (
    initialDocument.startsWith(normaliseIndents`
            # ${version} (${kebabToCamel(version.type, { startWithUpper: true })} Release)
            
            **Status**: In progress
            `) &&
    initialDocument.includes(getReleaseSummary(packageName, version)) &&
    initialDocument.includes("## Description of Changes") &&
    (version.type === "major" ? initialDocument.includes("## Migration Notes") : true)
  );
}

export default isValidReleaseDocument;
