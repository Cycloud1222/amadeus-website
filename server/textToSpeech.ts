/**
 * Text-to-Speech integration for Amadeus/Kurisu voice
 * Supports multiple TTS providers with voice customization
 */

import { ENV } from "./_core/env";

export interface TTSOptions {
  text: string;
  voiceId?: string;
  speed?: number; // 0.5 to 2.0
  pitch?: number; // 0.5 to 2.0
  language?: "en" | "zh" | "ja";
}

export interface TTSResponse {
  audioUrl: string;
  duration?: number;
  format: "mp3" | "wav" | "webm";
}

/**
 * Generate speech using SiliconFlow (based on amadeus-system-new implementation)
 * This is the recommended provider for Kurisu voice cloning
 */
export async function generateSpeechSiliconFlow(
  options: TTSOptions
): Promise<TTSResponse> {
  const {
    text,
    voiceId = process.env.SILICONFLOW_VOICE_ID || "default-kurisu",
    speed = 1.0,
    pitch = 1.0,
    language = "en",
  } = options;

  try {
    const response = await fetch(
      "https://api.siliconflow.cn/v1/audio/speech",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SILICONFLOW_API_KEY}`,
        },
        body: JSON.stringify({
          model: "speech-001",
          input: text,
          voice: voiceId,
          speed,
          pitch,
          language,
          response_format: "mp3",
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`SiliconFlow API error: ${response.statusText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    
    // Upload to storage and return URL
    const { storagePut } = await import("./storage");
    const key = `audio/kurisu-${Date.now()}.mp3`;
    const { url } = await storagePut(key, Buffer.from(audioBuffer), "audio/mpeg");

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
 * Generate speech using OpenAI TTS (fallback option)
 */
export async function generateSpeechOpenAI(
  options: TTSOptions
): Promise<TTSResponse> {
  const {
    text,
    speed = 1.0,
    language = "en",
  } = options;

  try {
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        voice: "nova", // Can be customized
        speed,
        response_format: "mp3",
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI TTS error: ${response.statusText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    
    // Upload to storage and return URL
    const { storagePut } = await import("./storage");
    const key = `audio/kurisu-${Date.now()}.mp3`;
    const { url } = await storagePut(key, Buffer.from(audioBuffer), "audio/mpeg");

    return {
      audioUrl: url,
      format: "mp3",
    };
  } catch (error) {
    console.error("OpenAI TTS error:", error);
    throw error;
  }
}

/**
 * Main TTS function - uses SiliconFlow if available, falls back to OpenAI
 */
export async function generateKurisuSpeech(
  options: TTSOptions
): Promise<TTSResponse> {
  if (process.env.SILICONFLOW_API_KEY) {
    return generateSpeechSiliconFlow(options);
  } else if (process.env.OPENAI_API_KEY) {
    return generateSpeechOpenAI(options);
  } else {
    throw new Error(
      "No TTS provider configured. Set SILICONFLOW_API_KEY or OPENAI_API_KEY"
    );
  }
}

/**
 * Kurisu-specific voice configuration
 */
export const KURISU_VOICE_CONFIG = {
  // SiliconFlow voice ID for Kurisu (Japanese female voice with scientific tone)
  voiceId: process.env.SILICONFLOW_VOICE_ID || "kurisu-jp",
  
  // Default speech parameters for natural Kurisu voice
  defaultSpeed: 1.0, // Natural speaking speed
  defaultPitch: 1.0, // Natural pitch
  
  // Emotional variations
  emotions: {
    neutral: { speed: 1.0, pitch: 1.0 },
    excited: { speed: 1.1, pitch: 1.1 }, // Slightly faster and higher when enthusiastic
    serious: { speed: 0.95, pitch: 0.95 }, // Slightly slower and lower for serious topics
    sarcastic: { speed: 1.05, pitch: 1.05 }, // Slightly faster for sarcasm
    concerned: { speed: 0.9, pitch: 0.9 }, // Slower and lower when concerned
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

  // Detect sarcasm/sarcastic tone
  if (
    lowerText.includes("obviously")
    || lowerText.includes("obviously")
    || lowerText.includes("don't be ridiculous")
    || lowerText.includes("hmph")
  ) {
    return KURISU_VOICE_CONFIG.emotions.sarcastic;
  }

  // Detect concern/worry
  if (
    lowerText.includes("worried")
    || lowerText.includes("concerned")
    || lowerText.includes("dangerous")
    || lowerText.includes("careful")
  ) {
    return KURISU_VOICE_CONFIG.emotions.concerned;
  }

  // Detect serious/formal tone
  if (
    lowerText.includes("however")
    || lowerText.includes("therefore")
    || lowerText.includes("paradox")
    || lowerText.includes("theory")
  ) {
    return KURISU_VOICE_CONFIG.emotions.serious;
  }

  // Default neutral
  return KURISU_VOICE_CONFIG.emotions.neutral;
}
