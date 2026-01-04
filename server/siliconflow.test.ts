import { describe, it, expect } from "vitest";
import { testSiliconFlowConnection } from "./siliconflowTTS";

describe("SiliconFlow TTS Integration", () => {
  it("should validate SiliconFlow API credentials and generate audio", async () => {
    const isConnected = await testSiliconFlowConnection();
    expect(isConnected).toBe(true);
  });
});
