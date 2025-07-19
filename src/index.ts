#!/usr/bin/env node
import { Command } from "commander";
import loadCommands from "src/commands";

const program = new Command();
program
  .name("alex-c-line")
  .description("CLI tool built by Alex")
  .version("1.0.0");

loadCommands(program);
program.parse(process.argv);
