import { determineVersionType, kebabToCamel, normaliseIndents } from "@alextheman/utility";

import getReleaseSummary from "src/utils/getReleaseSummary";

function isValidReleaseDocument(
  packageName: string,
  version: string,
  initialDocument: string,
): boolean {
  const versionType = determineVersionType(version);

  return (
    initialDocument.startsWith(normaliseIndents`
            # v${version} (${kebabToCamel(versionType, { startWithUpper: true })} Release)
            
            **Status**: In progress
            `) &&
    initialDocument.includes(getReleaseSummary(packageName, version)) &&
    initialDocument.includes("## Description of Changes") &&
    (versionType === "major" ? initialDocument.includes("## Migration Notes") : true)
  );
}

export default isValidReleaseDocument;
