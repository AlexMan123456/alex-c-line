import { readFile, writeFile } from "fs/promises";
import path from "path";

import dotenv from "dotenv";
// @ts-ignore
import dotenvStringify from "dotenv-stringify";
import { temporaryDirectoryTask } from "tempy";
import { describe, expect, test } from "vitest";

import { createAlexCLineTestClient } from "tests/test-clients/alex-c-line-test-client";

describe("edit-env", () => {
  test("Adds property to .env", async () => {
    await temporaryDirectoryTask(async (temporaryPath) => {
      const alexCLineTestClient = createAlexCLineTestClient({ cwd: temporaryPath });

      await alexCLineTestClient("edit-env", ["PROPERTY", "hello"]);
      const envFileContents = dotenv.parse(
        await readFile(path.join(temporaryPath, ".env"), "utf-8"),
      );
      expect(envFileContents.PROPERTY).toBe("hello");
    });
  });
  test("If .env already exists but property does not, append it to end of file", async () => {
    await temporaryDirectoryTask(async (temporaryPath) => {
      const alexCLineTestClient = createAlexCLineTestClient({ cwd: temporaryPath });
      await writeFile(
        path.join(temporaryPath, ".env"),
        dotenvStringify({ DATABASE_URL: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }),
      );

      await alexCLineTestClient("edit-env", ["PROPERTY", "test"]);
      const envFileContents = dotenv.parse(
        await readFile(path.join(temporaryPath, ".env"), "utf-8"),
      );
      expect(envFileContents.DATABASE_URL).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      expect(envFileContents.PROPERTY).toBe("test");
    });
  });
  test("If property already existed, replace the property", async () => {
    await temporaryDirectoryTask(async (temporaryPath) => {
      const alexCLineTestClient = createAlexCLineTestClient({ cwd: temporaryPath });
      await writeFile(
        path.join(temporaryPath, ".env"),
        dotenvStringify({
          DATABASE_URL: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          PROPERTY: "test",
        }),
      );

      await alexCLineTestClient("edit-env", ["PROPERTY", "hello"]);
      const envFileContents = dotenv.parse(
        await readFile(path.join(temporaryPath, ".env"), "utf-8"),
      );
      expect(envFileContents.DATABASE_URL).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      expect(envFileContents.PROPERTY).toBe("hello");
    });
  });
});
