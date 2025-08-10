import { describe, expect, test } from "vitest";

import alexCLineTestClient from "tests/test-clients/alex-c-line-test-client";

describe("say-hello", () => {
  test("Prints a message to the console", async () => {
    const { stdout: output } = await alexCLineTestClient("say-hello");
    expect(output).toBe("Hello!");
  });
});
