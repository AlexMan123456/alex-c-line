import type { Command } from "commander";

function sayHello(program: Command) {
  program
    .command("say-hello")
    .description("Quick test command")
    .action(() => {
      console.info("Hello!");
    });
}

export default sayHello;
