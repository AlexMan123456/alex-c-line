import type { CreateEnumType } from "@alextheman/utility";

const ConfigFileName = {
  STANDARD_JAVASCRIPT: "alex-c-line.config.js",
  ES_MODULES_JAVASCRIPT: "alex-c-line.config.mjs",
  COMMON_JS_JAVASCRIPT: "alex-c-line.config.cjs",
} as const;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type ConfigFileName = CreateEnumType<typeof ConfigFileName>;

export default ConfigFileName;
