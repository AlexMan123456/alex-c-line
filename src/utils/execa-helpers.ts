import type { Options } from "execa";

import { execa, ExecaError } from "execa";

export function createExecaClientWithDefaultOptions(defaultOptions: Options) {
  return async (command: string, args?: string[], options?: Options) => {
    return await execa(command, args, { ...defaultOptions, ...options });
  };
}

export async function execaNoFail(command: string, args?: string[], options?: Options) {
  try {
    return await execa(command, args, options);
  } catch (error: unknown) {
    if (error instanceof ExecaError) {
      return error;
    }
    throw error;
  }
}
