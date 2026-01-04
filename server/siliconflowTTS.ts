/**
 * SiliconFlow TTS Integration with CosyVoice2 Model
 * Provides high-quality voice synthesis for Amadeus/Kurisu character
 */

export interface TTSOptions {
  text: string;
  voiceId?: string;
  speed?: number;
  pitch?: number;
  language?: "en" | "zh" | "ja";
}

export interface TTSResponse {
  audioUrl: string;
  duration?: number;
  format: "mp3" | "wav" | "webm";
}

/**
 * Generate speech using SiliconFlow with CosyVoice2 model
 * This provides natural, high-quality voice synthesis for Amadeus
 */
export async function generateSpeechSiliconFlow(
  options: TTSOptions
): Promise<TTSResponse> {
  const {
    text,
    voiceId = process.env.SILICONFLOW_VOICE_ID || "default-kurisu",
    speed = 1.0,
    pitch = 1.0,
  } = options;

  const apiKey = process.env.SILICONFLOW_API_KEY;

  if (!apiKey) {
    throw new Error("SILICONFLOW_API_KEY is not configured");
  }

  try {
    // Use SiliconFlow's CosyVoice2 API endpoint
    const response = await fetch(
      "https://api.siliconflow.cn/v1/audio/speech",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "FunAudioLLM/CosyVoice2-0.5B",
          input: text,
          voice: voiceId,
          speed,
          pitch,
          response_format: "mp3",
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SiliconFlow API error response:", errorText);
      throw new Error(
        `SiliconFlow API error: ${response.status} ${response.statusText}`
      );
    }

    const audioBuffer = await response.arrayBuffer();

    // Upload to storage and return URL
    const { storagePut } = await import("./storage");
    const key = `audio/amadeus-${Date.now()}.mp3`;
    const { url } = await storagePut(
      key,
      Buffer.from(audioBuffer),
      "audio/mpeg"
    );

    return {
      audioUrl: url,
      format: "mp3",
    };
  } catch (error) {
    console.error("SiliconFlow TTS error:", error);
    throw error;
  }
}

/**
 * Test SiliconFlow API connection
 */
export async function testSiliconFlowConnection(): Promise<boolean> {
  try {
    const result = await generateSpeechSiliconFlow({
      text: "こんにちは、私はアマデウスです。",
      language: "ja",
    });
    return !!result.audioUrl;
  } catch (error) {
    console.error("SiliconFlow connection test failed:", error);
    return false;
  }
}

/**
 * Kurisu-specific voice configuration for SiliconFlow
 */
export const KURISU_VOICE_CONFIG = {
  // SiliconFlow voice ID for Amadeus/Kurisu with CosyVoice2
  voiceId:
    process.env.SILICONFLOW_VOICE_ID ||
    "speech:amadeus0:d59879p719ns73c9g58g:dtqnmlditayjycykeyme",

  // Default speech parameters for natural Kurisu voice
  defaultSpeed: 1.0,
  defaultPitch: 1.0,

  // Emotional variations
  emotions: {
    neutral: { speed: 1.0, pitch: 1.0 },
    excited: { speed: 1.1, pitch: 1.1 },
    serious: { speed: 0.95, pitch: 0.95 },
    sarcastic: { speed: 1.05, pitch: 1.05 },
    concerned: { speed: 0.9, pitch: 0.9 },
  },
};

/**
 * Detect emotion from text and apply appropriate voice parameters
 */
export function getEmotionalVoiceParams(text: string): {
  speed: number;
  pitch: number;
} {
  const lowerText = text.toLowerCase();

  // Detect excitement/enthusiasm
  if (
    lowerText.includes("!")
    || lowerText.includes("amazing")
    || lowerText.includes("brilliant")
    || lowerText.includes("fascinating")
  ) {
    return KURISU_VOICE_CONFIG.emotions.excited;
  }

  // Detect sarcasm
  if (
    lowerText.includes("obviously")
    || lowerText.includes("don't be ridiculous")
    || lowerText.includes("hmph")
  ) {
    return KURISU_VOICE_CONFIG.emotions.sarcastic;
  }

  // Detect concern
  if (
    lowerText.includes("worried")
    || lowerText.includes("concerned")
    || lowerText.includes("dangerous")
  ) {
    return KURISU_VOICE_CONFIG.emotions.concerned;
  }

  // Detect serious tone
  if (
    lowerText.includes("however")
    || lowerText.includes("therefore")
    || lowerText.includes("paradox")
  ) {
    return KURISU_VOICE_CONFIG.emotions.serious;
  }

  return KURISU_VOICE_CONFIG.emotions.neutral;
}
