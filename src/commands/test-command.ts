import { Command } from "commander";

function testCommand(program: Command) {
  program
    .command("test-command")
    .description("Quick test command")
    .action(() => {
      console.log("Success!");
    });
}

export default testCommand;
