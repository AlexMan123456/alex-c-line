import type { VersionNumber } from "@alextheman/utility";

export function getMajorReleaseSummary(packageName: string) {
  return `This is a new major release of the \`${packageName}\` package. It has the potential to introduce breaking changes that may require a large amount of refactoring. Please read the below description of changes and migration notes for more information.`;
}

export function getMinorReleaseSummary(packageName: string) {
  return `This is a new minor release of the \`${packageName}\` package. It introduces new features in a backwards-compatible way that should require very little refactoring, if any. Please read below the description of changes.`;
}

export function getPatchReleaseSummary(packageName: string) {
  return `This is a new patch release of the \`${packageName}\` package. It fixes issues with the package in a way that should require no refactoring. Please read below the description of changes.`;
}

function getReleaseSummary(packageName: string, version: VersionNumber) {
  return {
    major: getMajorReleaseSummary(packageName),
    minor: getMinorReleaseSummary(packageName),
    patch: getPatchReleaseSummary(packageName),
  }[version.type];
}

export default getReleaseSummary;
