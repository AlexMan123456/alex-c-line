import { Command } from "commander";
import sayHello from "src/commands/say-hello";

function loadCommands(program: Command) {
  sayHello(program);
}

export default loadCommands;
