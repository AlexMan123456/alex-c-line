import { Command } from "commander";
export function loadCommands(program: Command) {
  program
    .command("test-command")
    .description("Quick test command")
    .action(() => {
      console.log("Success!");
    });
}
