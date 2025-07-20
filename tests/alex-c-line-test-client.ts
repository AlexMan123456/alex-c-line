import { execa } from "execa";
import path from "path";

interface Options {
  cwd: string;
}

async function alexCLineTestClient(
  command: string | string[],
  options?: Options,
) {
  const localDistDirectory = path.resolve(process.cwd(), "dist");
  const commandArray = Array.isArray(command) ? command : [command];
  return await execa(
    "node",
    [path.join(localDistDirectory, "index.js"), ...commandArray],
    options,
  );
}

export default alexCLineTestClient;
