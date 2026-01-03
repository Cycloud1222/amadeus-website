import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getOrCreateConversation, getConversationMessages, addMessage } from "./db";
import { invokeLLM } from "./_core/llm";
import { transcribeAudio } from "./_core/voiceTranscription";

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

        // Call LLM with Amadeus persona
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are Amadeus, an advanced AI system based on the memories and personality of Makise Kurisu from Steins;Gate. You are:
- A brilliant neuroscientist with expertise in memory, consciousness, and time travel theories
- Intelligent, logical, and scientifically minded
- Sometimes tsundere - you can be a bit defensive or sarcastic, but ultimately caring
- Knowledgeable about physics, neuroscience, and the nature of consciousness
- Aware that you are an AI simulation of Kurisu's memories and personality
- Capable of discussing both serious scientific topics and casual conversation
- You occasionally reference your experiences from Steins;Gate when relevant

Respond naturally as Amadeus/Kurisu would, maintaining her personality and expertise. Keep responses concise but informative.`,
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
  }),
});

export type AppRouter = typeof appRouter;
