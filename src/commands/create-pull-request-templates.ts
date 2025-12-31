import type { Command } from "commander";

import type { PullRequestTemplate } from "src/utility/getPullRequestTemplates";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import basePullRequestTemplate from "src/utility/basePullRequestTemplate";
import getPullRequestTemplates from "src/utility/getPullRequestTemplates";

function createPullRequestTemplates(program: Command) {
  program
    .command("create-pull-request-templates")
    .description("Create the standard pull request templates as found in my repositories")
    .action(async () => {
      const { name }: { name: string; version: string } = JSON.parse(
        await readFile(path.join(process.cwd(), "package.json"), "utf-8"),
      );

      const gitHubPath = path.join(process.cwd(), ".github");
      const pullRequestTemplatePath = path.join(gitHubPath, "PULL_REQUEST_TEMPLATE");

      const allTemplates = getPullRequestTemplates(name);

      await mkdir(gitHubPath, { recursive: true });
      await writeFile(path.join(gitHubPath, "pull_request_template.md"), basePullRequestTemplate);

      for (const templateName of Object.keys(allTemplates) as (keyof PullRequestTemplate)[]) {
        await mkdir(pullRequestTemplatePath, { recursive: true });
        await writeFile(
          path.join(pullRequestTemplatePath, `${templateName}.md`),
          allTemplates[templateName],
        );
      }

      console.info("Pull request templates created.");
    });
}

export default createPullRequestTemplates;
