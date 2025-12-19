#!/usr/bin/env node
import { Command } from "commander";
import updateNotifier from "update-notifier";

import createCommands from "src/commands";

import packageInfo from "package.json" with { type: "json" };

const program = new Command();
program.name("alex-c-line").description("CLI tool built by Alex").version(packageInfo.version);

updateNotifier({ pkg: packageInfo }).notify();

createCommands(program);
program.parse(process.argv);
