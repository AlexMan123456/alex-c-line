import { determineVersionType, normaliseIndents, parseVersion } from "@alextheman/utility";

import {
  getMajorReleaseSummary,
  getMinorReleaseSummary,
  getPatchReleaseSummary,
} from "src/utils/getReleaseSummary";

export type ReleaseStatus = "In progress" | "Released";

export interface ReleaseNoteContents {
  descriptionOfChanges?: string;
  notes?: string;
}

function getReleaseNoteTemplate(
  packageName: string,
  version: string,
  status: ReleaseStatus = "In progress",
  contents?: ReleaseNoteContents,
) {
  const descriptionOfChanges = contents?.descriptionOfChanges ?? "Description here";
  const migrationNotes = contents?.notes ?? "Migration notes here";
  const additionalNotes = contents?.notes ?? "Additional notes here";

  const parsedVersion = parseVersion(version);

  return {
    major: normaliseIndents`
                # ${parsedVersion} (Major Release)

                **Status**: ${status}

                ${getMajorReleaseSummary(packageName)}

                ## Description of Changes

                ${descriptionOfChanges}

                ## Migration Notes

                ${migrationNotes}
            `,
    minor: normaliseIndents`
                # ${parsedVersion} (Minor Release)

                **Status**: ${status}

                ${getMinorReleaseSummary(packageName)}

                ## Description of Changes

                ${descriptionOfChanges}

                ## Additional Notes

                ${additionalNotes}
            `,
    patch: normaliseIndents`
                # ${parsedVersion} (Patch Release)

                **Status**: ${status}

                ${getPatchReleaseSummary(packageName)}

                ## Description of Changes

                ${descriptionOfChanges}

                ## Additional Notes

                ${additionalNotes}
            `,
  }[determineVersionType(version)];
}

export default getReleaseNoteTemplate;
