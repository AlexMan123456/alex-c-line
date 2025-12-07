#!/usr/bin/env node
import { Command } from "commander";
import packageInfo from "package.json" with { type: "json" };
import updateNotifier from "update-notifier";

import createCommands from "src/commands";

const program = new Command();
program.name("alex-c-line").description("CLI tool built by Alex").version(packageInfo.version);

updateNotifier({ pkg: packageInfo }).notify();

createCommands(program);
program.parse(process.argv);
