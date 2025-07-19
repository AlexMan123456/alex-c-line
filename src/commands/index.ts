import { Command } from "commander";
import testCommand from "src/commands/test-command";

function loadCommands(program: Command) {
  testCommand(program);
}

export default loadCommands;
