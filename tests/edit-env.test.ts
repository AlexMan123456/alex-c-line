import dotenv from "dotenv";
import dotenvStringify from "dotenv-stringify";
import { temporaryDirectoryTask } from "tempy";
import { describe, expect, test } from "vitest";

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { createAlexCLineTestClient } from "tests/test-clients/alex-c-line-test-client";

describe("edit-env", () => {
  test("Adds property to .env", async () => {
    await temporaryDirectoryTask(async (temporaryPath) => {
      const alexCLineTestClient = createAlexCLineTestClient({ cwd: temporaryPath });

      await alexCLineTestClient("edit-env", [
        "DATABASE_URL",
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      ]);
      const envFileContents = await readFile(path.join(temporaryPath, ".env"), "utf-8");
      expect(envFileContents.endsWith("\n")).toBe(true);
    });
  });
  test("Adds newline to end of file", async () => {
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
  test("If only key is specified, delete the corresponding environment variable", async () => {
    await temporaryDirectoryTask(async (temporaryPath) => {
      const alexCLineTestClient = createAlexCLineTestClient({ cwd: temporaryPath });
      await writeFile(
        path.join(temporaryPath, ".env"),
        dotenvStringify({
          DATABASE_URL: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          PROPERTY: "test",
        }),
      );

      // Get de-rickrolled but keep the DATABASE_URL property around
      await alexCLineTestClient("edit-env", ["DATABASE_URL"]);
      const envFileContents = dotenv.parse(
        await readFile(path.join(temporaryPath, ".env"), "utf-8"),
      );
      expect(envFileContents).not.toHaveProperty("DATABASE_URL");
      expect(envFileContents.PROPERTY).toBe("test");
    });
  });
  test("Allows value to be an empty string to create an environment variable with an empty value", async () => {
    await temporaryDirectoryTask(async (temporaryPath) => {
      const alexCLineTestClient = createAlexCLineTestClient({ cwd: temporaryPath });
      await writeFile(
        path.join(temporaryPath, ".env"),
        dotenvStringify({
          DATABASE_URL: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          PROPERTY: "test",
        }),
      );

      // Get de-rickrolled but keep the DATABASE_URL property around
      await alexCLineTestClient("edit-env", ["DATABASE_URL", ""]);
      const envFileContents = dotenv.parse(
        await readFile(path.join(temporaryPath, ".env"), "utf-8"),
      );
      expect(envFileContents.DATABASE_URL).toBe("");
      expect(envFileContents.PROPERTY).toBe("test");
    });
  });
  test("Writes to the specified file if --file flag given", async () => {
    await temporaryDirectoryTask(async (temporaryPath) => {
      const alexCLineTestClient = createAlexCLineTestClient({ cwd: temporaryPath });
      await writeFile(
        path.join(temporaryPath, ".env.test"),
        dotenvStringify({
          DATABASE_URL: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          ENV: "test",
        }),
      );
      await writeFile(
        path.join(temporaryPath, ".env"),
        dotenvStringify({
          DATABASE_URL: "do-not-use-or-you-will-be.fired",
          ENV: "production",
        }),
      );

      await alexCLineTestClient("edit-env", [
        "DATABASE_URL",
        "https://youtu.be/jKUgVR29PJs?si=XUHJdBKR3pwWCncz",
        "--file",
        ".env.test",
      ]);
      const testEnvFileContents = dotenv.parse(
        await readFile(path.join(temporaryPath, ".env.test"), "utf-8"),
      );
      const envFileContents = dotenv.parse(
        await readFile(path.join(temporaryPath, ".env"), "utf-8"),
      );
      expect(testEnvFileContents.DATABASE_URL).toBe(
        "https://youtu.be/jKUgVR29PJs?si=XUHJdBKR3pwWCncz",
      );
      expect(testEnvFileContents.ENV).toBe("test");

      expect(envFileContents.DATABASE_URL).toBe("do-not-use-or-you-will-be.fired");
      expect(envFileContents.ENV).toBe("production");
    });
  });
  test("Deletes from custom file if no value specified but --file flag given", async () => {
    await temporaryDirectoryTask(async (temporaryPath) => {
      const alexCLineTestClient = createAlexCLineTestClient({ cwd: temporaryPath });
      await writeFile(
        path.join(temporaryPath, ".env.test"),
        dotenvStringify({
          DATABASE_URL: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          ENV: "test",
        }),
      );

      // De-rickroll command incoming!
      await alexCLineTestClient("edit-env", ["DATABASE_URL", "--file", ".env.test"]);
      const envFileContents = dotenv.parse(
        await readFile(path.join(temporaryPath, ".env.test"), "utf-8"),
      );
      expect(envFileContents).not.toHaveProperty("DATABASE_URL");
      expect(envFileContents.ENV).toBe("test");
    });
  });
});
