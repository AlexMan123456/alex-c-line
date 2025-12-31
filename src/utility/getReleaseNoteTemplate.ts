import type { VersionNumber } from "@alextheman/utility";

import { normaliseIndents } from "@alextheman/utility";

import {
  getMajorReleaseSummary,
  getMinorReleaseSummary,
  getPatchReleaseSummary,
} from "src/utility/getReleaseSummary";

export type ReleaseStatus = "In progress" | "Released";

export interface ReleaseNoteContents {
  descriptionOfChanges?: string;
  notes?: string;
}

function getReleaseNoteTemplate(
  packageName: string,
  version: VersionNumber,
  status: ReleaseStatus = "In progress",
  contents?: ReleaseNoteContents,
) {
  const descriptionOfChanges = contents?.descriptionOfChanges ?? "Description here";
  const migrationNotes = contents?.notes ?? "Migration notes here";
  const additionalNotes = contents?.notes ?? "Additional notes here";

  return {
    major: normaliseIndents`
                # ${version.toString()} (Major Release)

                **Status**: ${status}

                ${getMajorReleaseSummary(packageName)}

                ## Description of Changes

                ${descriptionOfChanges}

                ## Migration Notes

                ${migrationNotes}
            `,
    minor: normaliseIndents`
                # ${version.toString()} (Minor Release)

                **Status**: ${status}

                ${getMinorReleaseSummary(packageName)}

                ## Description of Changes

                ${descriptionOfChanges}

                ## Additional Notes

                ${additionalNotes}
            `,
    patch: normaliseIndents`
                # ${version.toString()} (Patch Release)

                **Status**: ${status}

                ${getPatchReleaseSummary(packageName)}

                ## Description of Changes

                ${descriptionOfChanges}

                ## Additional Notes

                ${additionalNotes}
            `,
  }[version.type];
}

export default getReleaseNoteTemplate;
