/**
 * DeepSeek LLM Integration Module
 * Replaces the built-in LLM with DeepSeek API for Amadeus/Kurisu conversations
 */

import { ENV } from "./_core/env";

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Invoke DeepSeek API for chat completions
 * Compatible with the invokeLLM interface
 */
export async function invokeDeepSeek(options: {
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
}): Promise<DeepSeekResponse> {
  const {
    messages,
    temperature = 0.7,
    max_tokens = 2048,
    top_p = 1,
  } = options;

  const apiUrl = process.env.DEEPSEEK_API_URL || "https://api.deepseek.com";
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not configured");
  }

  try {
    const response = await fetch(`${apiUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages,
        temperature,
        max_tokens,
        top_p,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("DeepSeek API error:", errorData);
      throw new Error(
        `DeepSeek API error: ${response.status} ${JSON.stringify(errorData)}`
      );
    }

    const data = (await response.json()) as DeepSeekResponse;
    return data;
  } catch (error) {
    console.error("DeepSeek LLM invocation error:", error);
    throw error;
  }
}

/**
 * Test DeepSeek API connection
 * Used for validating credentials
 */
export async function testDeepSeekConnection(): Promise<boolean> {
  try {
    const response = await invokeDeepSeek({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant.",
        },
        {
          role: "user",
          content: "Say 'OK' if you can hear me.",
        },
      ],
      max_tokens: 10,
    });

    return (
      response.choices &&
      response.choices.length > 0 &&
      !!response.choices[0]?.message?.content
    );
  } catch (error) {
    console.error("DeepSeek connection test failed:", error);
    return false;
  }
}
