#!/usr/bin/env node
import { Command } from "commander";
import { loadCommands } from "src/commands/test-command";
const program = new Command();
program
  .name("typescript-cli-tool")
  .description("A powerful CLI tool built with TypeScript")
  .version("1.0.0");

loadCommands(program);
program.parse(process.argv);
