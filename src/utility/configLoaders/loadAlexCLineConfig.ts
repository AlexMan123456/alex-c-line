import type { AlexCLineConfig } from "src/configs/AlexCLineConfig";

import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);

async function loadAlexCLineConfig(filePath: string): Promise<AlexCLineConfig> {
  if (filePath.endsWith(".cjs")) {
    const module = require(filePath);
    return module.default ?? module;
  }
  const module = await import(pathToFileURL(filePath).href);
  return module.default ?? module;
}

export default loadAlexCLineConfig;
