import { Command } from "commander";
import checkLockfileVersionDiscrepancy from "src/commands/check-lockfile-version-discrepancy";
import sayHello from "src/commands/say-hello";

function loadCommands(program: Command) {
  sayHello(program);
  checkLockfileVersionDiscrepancy(program);
}

export default loadCommands;
