import type { Options } from "execa";

import path from "node:path";

function setDirectory(directory: string, env?: Record<string, string>): Options {
  return {
    cwd: directory,
    env: {
      HOME: path.dirname(directory),
      ...env,
    },
  };
}

export default setDirectory;
