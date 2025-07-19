import alexBaseConfig from "@alextheman/eslint-config-typescript-base";

export default [
  ...alexBaseConfig,
  {
    rules: {
      // Probably not the best idea to give warnings/errors when using the console in a console-based tool now, isn't it?
      "no-console": "off",
    },
  },
];
