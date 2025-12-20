import { ExecaError } from "execa";
import { temporaryDirectoryTask } from "tempy";
import { describe, expect, test } from "vitest";

import { writeFile } from "node:fs/promises";
import path from "node:path";

import { createAlexCLineTestClientInDirectory } from "tests/test-clients/alex-c-line-test-client";

describe("check-for-file-dependencies", () => {
  test("Exits with exit code 0 if no file dependencies found", async () => {
    await temporaryDirectoryTask(async (temporaryDirectory) => {
      const alexCLineTestClient = createAlexCLineTestClientInDirectory(temporaryDirectory);
      await writeFile(
        path.join(temporaryDirectory, "package.json"),
        JSON.stringify({
          dependencies: {
            "@alextheman/components": "^3.5.3",
            "@alextheman/utility": "*",
          },
          devDependencies: {
            gitmock: "1.0.0",
            eslint: "^9.34.0",
          },
          peerDependencies: {
            react: "^19.1.0",
          },
        }),
      );

      const { stdout: message, exitCode } = await alexCLineTestClient(
        "check-for-file-dependencies",
      );
      expect(exitCode).toBe(0);
      expect(message).toContain("Checking for file dependencies...");
      expect(message).toContain("No file dependencies found!");
    });
  });
  describe("devDependencies and/or peerDependencies can be left out", async () => {
    test("Leaving out devDependencies", async () => {
      await temporaryDirectoryTask(async (temporaryDirectory) => {
        const alexCLineTestClient = createAlexCLineTestClientInDirectory(temporaryDirectory);
        await writeFile(
          path.join(temporaryDirectory, "package.json"),
          JSON.stringify({
            dependencies: {
              "@alextheman/components": "^3.5.3",
              "@alextheman/utility": "*",
            },
            peerDependencies: {
              react: "^19.1.0",
            },
          }),
        );

        const { stdout: message, exitCode } = await alexCLineTestClient(
          "check-for-file-dependencies",
        );
        expect(exitCode).toBe(0);
        expect(message).toContain("Checking for file dependencies...");
        expect(message).toContain("No file dependencies found!");
      });
    });
    test("Leaving out peerDependencies", async () => {
      await temporaryDirectoryTask(async (temporaryDirectory) => {
        const alexCLineTestClient = createAlexCLineTestClientInDirectory(temporaryDirectory);
        await writeFile(
          path.join(temporaryDirectory, "package.json"),
          JSON.stringify({
            dependencies: {
              "@alextheman/components": "^3.5.3",
              "@alextheman/utility": "*",
            },
            devDependencies: {
              gitmock: "1.0.0",
              eslint: "^9.34.0",
            },
          }),
        );

        const { stdout: message, exitCode } = await alexCLineTestClient(
          "check-for-file-dependencies",
        );
        expect(exitCode).toBe(0);
        expect(message).toContain("Checking for file dependencies...");
        expect(message).toContain("No file dependencies found!");
      });
    });
    test("Dependencies only", async () => {
      await temporaryDirectoryTask(async (temporaryDirectory) => {
        const alexCLineTestClient = createAlexCLineTestClientInDirectory(temporaryDirectory);
        await writeFile(
          path.join(temporaryDirectory, "package.json"),
          JSON.stringify({
            dependencies: {
              "@alextheman/components": "^3.5.3",
              "@alextheman/utility": "*",
            },
            devDependencies: {
              gitmock: "1.0.0",
              eslint: "^9.34.0",
            },
            peerDependencies: {
              react: "^19.1.0",
            },
          }),
        );

        const { stdout: message, exitCode } = await alexCLineTestClient(
          "check-for-file-dependencies",
        );
        expect(exitCode).toBe(0);
        expect(message).toContain("Checking for file dependencies...");
        expect(message).toContain("No file dependencies found!");
      });
    });
  });
  test("Succeeds if package.json is completely empty", async () => {
    await temporaryDirectoryTask(async (temporaryDirectory) => {
      const alexCLineTestClient = createAlexCLineTestClientInDirectory(temporaryDirectory);
      await writeFile(path.join(temporaryDirectory, "package.json"), JSON.stringify({}));

      const { stdout: message, exitCode } = await alexCLineTestClient(
        "check-for-file-dependencies",
      );
      expect(exitCode).toBe(0);
      expect(message).toContain("Checking for file dependencies...");
      expect(message).toContain("No file dependencies found!");
    });
  });
  test("Exit with exit code 1 if file dependencies found", async () => {
    await temporaryDirectoryTask(async (temporaryDirectory) => {
      const alexCLineTestClient = createAlexCLineTestClientInDirectory(temporaryDirectory);
      await writeFile(
        path.join(temporaryDirectory, "package.json"),
        JSON.stringify({
          dependencies: {
            "@alextheman/components": "file:../components",
            gitmock: "1.0.0",
            "@alextheman/utility": "^1.16.0",
          },
          devDependencies: {
            "@alextheman/eslint-plugin": "file:../eslint-plugin",
            vitest: "*",
          },
          peerDependencies: {
            react: "file:../react",
          },
        }),
      );

      try {
        await alexCLineTestClient("check-for-file-dependencies");
        throw new Error("TEST_FAILED");
      } catch (error) {
        if (error instanceof ExecaError) {
          const { exitCode, stdout: message, stderr: errorMessage } = error;
          expect(exitCode).toBe(1);
          expect(message).toContain("Checking for file dependencies...");
          expect(errorMessage).toContain("ERROR: File dependencies found:");
          expect(errorMessage).toContain(
            JSON.stringify(
              {
                dependencies: { "@alextheman/components": "file:../components" },
                devDependencies: { "@alextheman/eslint-plugin": "file:../eslint-plugin" },
                peerDependencies: { react: "file:../react" },
              },
              undefined,
              2,
            ),
          );
          return;
        }
        throw error;
      }
    });
  });
  describe("devDependencies and/or peerDependencies can be left out even if error code is 1", () => {
    test("Leaving out devDependencies on error code 1", async () => {
      await temporaryDirectoryTask(async (temporaryDirectory) => {
        const alexCLineTestClient = createAlexCLineTestClientInDirectory(temporaryDirectory);
        await writeFile(
          path.join(temporaryDirectory, "package.json"),
          JSON.stringify({
            dependencies: {
              "@alextheman/components": "file:../components",
              gitmock: "1.0.0",
              "@alextheman/utility": "^1.16.0",
            },
            peerDependencies: {
              react: "file:../react",
            },
          }),
        );

        try {
          await alexCLineTestClient("check-for-file-dependencies");
          throw new Error("TEST_FAILED");
        } catch (error) {
          if (error instanceof ExecaError) {
            const { exitCode, stdout: message, stderr: errorMessage } = error;
            expect(exitCode).toBe(1);
            expect(message).toContain("Checking for file dependencies...");
            expect(errorMessage).toContain("ERROR: File dependencies found:");
            expect(errorMessage).toContain(
              JSON.stringify(
                {
                  dependencies: { "@alextheman/components": "file:../components" },
                  peerDependencies: { react: "file:../react" },
                },
                undefined,
                2,
              ),
            );
            return;
          }
          throw error;
        }
      });
    });
    test("Leaving out peerDependencies on error code 1", async () => {
      await temporaryDirectoryTask(async (temporaryDirectory) => {
        const alexCLineTestClient = createAlexCLineTestClientInDirectory(temporaryDirectory);
        await writeFile(
          path.join(temporaryDirectory, "package.json"),
          JSON.stringify({
            dependencies: {
              "@alextheman/components": "file:../components",
              gitmock: "1.0.0",
              "@alextheman/utility": "^1.16.0",
            },
            devDependencies: {
              "@alextheman/eslint-plugin": "file:../eslint-plugin",
              vitest: "*",
            },
          }),
        );

        try {
          await alexCLineTestClient("check-for-file-dependencies");
          throw new Error("TEST_FAILED");
        } catch (error) {
          if (error instanceof ExecaError) {
            const { exitCode, stdout: message, stderr: errorMessage } = error;
            expect(exitCode).toBe(1);
            expect(message).toContain("Checking for file dependencies...");
            expect(errorMessage).toContain("ERROR: File dependencies found:");
            expect(errorMessage).toContain(
              JSON.stringify(
                {
                  dependencies: { "@alextheman/components": "file:../components" },
                  devDependencies: { "@alextheman/eslint-plugin": "file:../eslint-plugin" },
                },
                undefined,
                2,
              ),
            );
            return;
          }
          throw error;
        }
      });
    });
    test("Dependencies only on error code 1", async () => {
      await temporaryDirectoryTask(async (temporaryDirectory) => {
        const alexCLineTestClient = createAlexCLineTestClientInDirectory(temporaryDirectory);
        await writeFile(
          path.join(temporaryDirectory, "package.json"),
          JSON.stringify({
            dependencies: {
              "@alextheman/components": "file:../components",
              gitmock: "1.0.0",
              "@alextheman/utility": "^1.16.0",
            },
          }),
        );

        try {
          await alexCLineTestClient("check-for-file-dependencies");
          throw new Error("TEST_FAILED");
        } catch (error) {
          if (error instanceof ExecaError) {
            const { exitCode, stdout: message, stderr: errorMessage } = error;
            expect(exitCode).toBe(1);
            expect(message).toContain("Checking for file dependencies...");
            expect(errorMessage).toContain("ERROR: File dependencies found:");
            expect(errorMessage).toContain(
              JSON.stringify(
                {
                  dependencies: { "@alextheman/components": "file:../components" },
                },
                undefined,
                2,
              ),
            );
            return;
          }
          throw error;
        }
      });
    });
  });
});
