#!/usr/bin/env node
import { Command } from "commander";
import { version } from "package.json" with { type: "json" };

import createCommands from "src/commands";

const program = new Command();
program.name("alex-c-line").description("CLI tool built by Alex").version(version);

createCommands(program);
program.parse(process.argv);
