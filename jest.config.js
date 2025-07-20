/** @type {import('jest').Config} */
export default {
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": ["babel-jest", {}],
  },
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(src/.*)$": "<rootDir>/$1",
  },
  moduleDirectories: ["node_modules", "."],
  testMatch: ["**/__tests__/**/*.test.ts"],
  transformIgnorePatterns: [
    "node_modules/(?!(execa)/)"
  ]
};
