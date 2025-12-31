import { normaliseIndents } from "@alextheman/utility";

const basePullRequestTemplate: string = normaliseIndents`
    # Select a Template

    Please select the option that best describes your changes:

    - [Breaking Change](?template=breaking_change.md) - For changes that may require users of the package to refactor their code.
    - [New Feature](?template=new_feature.md) - For changes that add a new feature to the package.
    - [Bug Fix](?template=bug_fix.md) - For changes that fix a bug in the package.
    - [Tooling Change](?template=tooling_change.md) - For changes to the package's tooling (dependencies, devDependencies, configs...).
    - [Documentation Change](?template=documentation_change.md) - For changes that affect the way that information about the package is presented to users.
    - [Refactor](?template=refactor.md) - For changes that change code quality and structure without affecting runtime behaviour.
    - [Miscellaneous](?template=miscellaneous.md) - For changes that do not fit cleanly into any of the above categories.

    In some cases, your pull request may be doing more than one of these. In this case, please select a template from the top-down.
    For example, if you are introducing a new feature but also making changes to tooling, please select \`New Feature\` as that comes before tooling in the list.
    This ensures that the most impactful aspect of the change is reflected.
`;

export default basePullRequestTemplate;
