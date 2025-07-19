import { execa } from "execa";

describe("say-hello", () => {
  test("Prints a message to the console", async () => {
    const { stdout: output } = await execa`npx alex-c-line say-hello`;
    expect(output).toBe("Hello!");
  });
});
