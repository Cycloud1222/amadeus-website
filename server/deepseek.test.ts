import { describe, it, expect } from "vitest";
import { testDeepSeekConnection } from "./deepseekLLM";

describe("DeepSeek API Integration", () => {
  it("should validate DeepSeek API credentials", async () => {
    // This test validates that the DeepSeek API credentials are correctly configured
    const isConnected = await testDeepSeekConnection();
    expect(isConnected).toBe(true);
  });
});
