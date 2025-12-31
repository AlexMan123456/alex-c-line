import type { Command } from "commander";

function loadCommands(
  program: Command,
  commandMap: Record<string, (program: Command) => void>,
): void {
  for (const loader of Object.values(commandMap)) {
    loader(program);
  }
}

export default loadCommands;
