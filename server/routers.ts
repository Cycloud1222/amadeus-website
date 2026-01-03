import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getOrCreateConversation, getConversationMessages, addMessage } from "./db";
import { invokeLLM } from "./_core/llm";
import { transcribeAudio } from "./_core/voiceTranscription";
import { KURISU_SYSTEM_PROMPT, KURISU_SYSTEM_PROMPT_ZH } from "./kurisuSystemPrompt";
import { generateKurisuSpeech, getEmotionalVoiceParams } from "./textToSpeech";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  chat: router({
    getHistory: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        const conversation = await getOrCreateConversation(input.sessionId);
        const messages = await getConversationMessages(conversation.id);
        return messages;
      }),

    sendMessage: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        message: z.string(),
      }))
      .mutation(async ({ input }) => {
        const conversation = await getOrCreateConversation(input.sessionId);

        // Save user message
        const userMessage = await addMessage({
          conversationId: conversation.id,
          role: "user",
          content: input.message,
        });

        // Get conversation history for context
        const history = await getConversationMessages(conversation.id);
        
        // Build messages for LLM (exclude the just-added user message as we'll add it separately)
        const contextMessages = history
          .filter(m => m.id !== userMessage.id)
          .slice(-10) // Keep last 10 messages for context
          .map(m => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          }));

        // Detect language from user message
        const isChinese = /[\u4E00-\u9FFF]/.test(input.message);
        const systemPrompt = isChinese ? KURISU_SYSTEM_PROMPT_ZH : KURISU_SYSTEM_PROMPT;

        // Call LLM with enhanced Amadeus persona
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            ...contextMessages,
            {
              role: "user",
              content: input.message,
            },
          ],
        });

        const assistantContent = typeof response.choices[0]?.message?.content === 'string' 
          ? response.choices[0].message.content 
          : "I apologize, but I'm having trouble processing that right now.";

        // Save assistant response
        const assistantMessage = await addMessage({
          conversationId: conversation.id,
          role: "assistant",
          content: assistantContent,
        });

        return {
          userMessage,
          assistantMessage,
        };
      }),

    transcribeAudio: publicProcedure
      .input(z.object({
        audioData: z.string(), // base64 encoded audio
        sessionId: z.string(),
      }))
      .mutation(async ({ input }) => {
        // Convert base64 to buffer
        const audioBuffer = Buffer.from(input.audioData, "base64");
        
        // Upload to temporary storage for transcription
        const { storagePut } = await import("./storage");
        const tempKey = `temp-audio/${input.sessionId}-${Date.now()}.webm`;
        const { url } = await storagePut(tempKey, audioBuffer, "audio/webm");

        // Transcribe audio
        const result = await transcribeAudio({
          audioUrl: url,
          language: "en",
        });

        if ('error' in result) {
          throw new Error(result.error);
        }

        return {
          text: result.text,
        };
      }),

    generateVoice: publicProcedure
      .input(z.object({
        text: z.string(),
        language: z.enum(["en", "zh", "ja"]).optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const voiceParams = getEmotionalVoiceParams(input.text);
          const result = await generateKurisuSpeech({
            text: input.text,
            language: input.language || "en",
            speed: voiceParams.speed,
            pitch: voiceParams.pitch,
          });
          return result;
        } catch (error) {
          console.error("Voice generation error:", error);
          throw new Error("Failed to generate voice. Please ensure TTS provider is configured.");
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
