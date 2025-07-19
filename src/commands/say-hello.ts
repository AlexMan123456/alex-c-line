import { Command } from "commander";

function sayHello(program: Command) {
  program
    .command("say-hello")
    .description("Quick test command")
    .action(() => {
      console.log("Hello!");
    });
}

export default sayHello;
