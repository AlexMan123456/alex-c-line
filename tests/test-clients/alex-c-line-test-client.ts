import { execa, Options } from "execa";
import path from "path";

async function alexCLineTestClient(
  command: string,
  args?: string[],
  options?: Options,
) {
  const localDistDirectory = path.resolve(process.cwd(), "dist");
  const newArguments = args ?? [];
  return await execa(
    "node",
    [path.join(localDistDirectory, "index.js"), command, ...newArguments],
    options,
  );
}

export function createAlexCLineTestClientInDirectory(directory: string) {
  return async (
    command: string,
    args?: string[],
    options?: Omit<Options, "cwd">,
  ) => {
    return await alexCLineTestClient(command, args, {
      ...options,
      cwd: directory,
      env: {
        HOME: directory.split("/").slice(0, -1).join("/"),
      },
    });
  };
}

export default alexCLineTestClient;
