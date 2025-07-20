import { execa } from "execa";
import { describe, expect, test } from "vitest";

describe("say-hello", () => {
  test("Prints a message to the console", async () => {
    const { stdout: output } = await execa`npx alex-c-line say-hello`;
    expect(output).toBe("Hello!");
  });
});
