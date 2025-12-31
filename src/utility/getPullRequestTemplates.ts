import { normaliseIndents } from "@alextheman/utility";

export interface PullRequestTemplate {
  breaking_change: string;
  new_feature: string;
  bug_fix: string;
  tooling_change: string;
  documentation_change: string;
  refactor: string;
  miscellaneous: string;
}

function getPullRequestTemplates(packageName: string): PullRequestTemplate {
  const descriptionOfChanges =
    "Please see the commits tab of this pull request for the description of changes.";

  const allBaseTemplates: PullRequestTemplate = {
    breaking_change: normaliseIndents`
            # Breaking Change

            This is a change to \`${packageName}\` that will cause breaking changes wherever it is used.
        `,
    new_feature: normaliseIndents`
            # New Feature

            This is a new feature for \`${packageName}\`. It adds a new feature to the package.
        `,
    bug_fix: normaliseIndents`
            # Bug Fix

            This is a bug fix for \`${packageName}\`. It fixes an unintended side-effect of the package.
        `,
    tooling_change: normaliseIndents`
            # Tooling Change

            This is a change to the tooling of \`${packageName}\`. It changes the internal workings of the package and should have no noticeable effect on users.
        `,
    documentation_change: normaliseIndents`
            # Documentation Change

            This is a change to the documentation of \`${packageName}\`. It changes the way that information about the package is presented to users.
        `,
    refactor: normaliseIndents`
            # Refactor

            This is a change to the code layout of \`${packageName}\`. It changes how the code is presented in terms of quality and structure without changing its overall runtime behaviour or user-facing functionality.
        `,
    miscellaneous: normaliseIndents`
            # Miscellaneous

            This is a general change to \`${packageName}\` that does not fit in any of the other provided categories.
        `,
  };

  const allTemplates: PullRequestTemplate = {} as PullRequestTemplate;

  for (const templateName of Object.keys(allBaseTemplates) as (keyof PullRequestTemplate)[]) {
    allTemplates[templateName] = `${allBaseTemplates[templateName]}\n${descriptionOfChanges}\n`;
  }

  return allTemplates;
}

export default getPullRequestTemplates;
