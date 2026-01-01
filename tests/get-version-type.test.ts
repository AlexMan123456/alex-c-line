import { VersionNumber } from "@alextheman/utility";
import { ExecaError } from "execa";
import { describe, expect, test } from "vitest";

import alexCLineTestClient from "tests/test-clients/alex-c-line-test-client";

import { version } from "package.json" with { type: "json" };

const versionNumber = new VersionNumber(version);

describe("get-version-type", () => {
  test.each([versionNumber.toString(), versionNumber.toString({ omitPrefix: true })])(
    "Gets the type of the given input version",
    async (versionString) => {
      const { stdout: versionType, exitCode } = await alexCLineTestClient("get-version-type", [
        versionString,
      ]);
      expect(exitCode).toBe(0);
      expect(versionType).toBe(versionNumber.type);
    },
  );

  test("Fails on invalid version number", async () => {
    try {
      await alexCLineTestClient("get-version-type", ["hello"]);
    } catch (error) {
      if (error instanceof ExecaError) {
        const { stderr, exitCode } = error;
        expect(exitCode).toBe(1);
        expect(stderr).toContain("DataError");
      } else {
        throw error;
      }
    }
  });
});
