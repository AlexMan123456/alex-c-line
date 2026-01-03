import type { AlexCLineConfig } from "src/configs/types/AlexCLineConfig";

import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

import { defineAlexCLineConfig } from "src/configs";

const require = createRequire(import.meta.url);

async function loadAlexCLineConfig(filePath: string): Promise<AlexCLineConfig> {
  if (filePath.endsWith(".cjs")) {
    const module = require(filePath);
    return defineAlexCLineConfig(module.default ?? module);
  }
  const module = await import(pathToFileURL(filePath).href);
  return defineAlexCLineConfig(module.default ?? module);
}

export default loadAlexCLineConfig;
