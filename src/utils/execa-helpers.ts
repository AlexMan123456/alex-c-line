import { execa, Options } from "execa";

export function createExecaClientWithDefaultOptions(defaultOptions: Options) {
  return async (command: string, args?: string[], options?: Options) => {
    return await execa(command, args, { ...defaultOptions, ...options });
  };
}
