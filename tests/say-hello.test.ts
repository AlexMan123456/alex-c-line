import alexCLineTestClient from "tests/test-utilities/alex-c-line-test-client";
import { describe, expect, test } from "vitest";

describe("say-hello", () => {
  test("Prints a message to the console", async () => {
    const { stdout: output } = await alexCLineTestClient("say-hello");
    expect(output).toBe("Hello!");
  });
});
