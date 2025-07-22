import plugin from "@alextheman/eslint-plugin";

export default [
  ...plugin.configs.alexTypeScriptBase,
  {
    rules: {
      // Probably not the best idea to give warnings/errors when using the console in a console-based tool now, isn't it?
      "no-console": "off",
    },
  },
];
