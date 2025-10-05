import plugin from "@alextheman/eslint-plugin";

export default [
  ...plugin.configs.alexTypeScriptBase,
  {
    rules: {
      // Probably not the best idea to give warnings/errors when using the console in a console-based tool now, isn't it?
      "no-console": "off",
    },
  },
  {
    files: ["**/tests/**.test.ts"],
    rules: {
      // But forbid it in tests because more often than not, they're a mistake from debugging there.
      "no-console": ["error", { allow: ["warn", "error"] }],
    },
  },
];
